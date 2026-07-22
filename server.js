const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const expoWebDir = path.join(__dirname, 'ios-app', 'dist');
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(expoWebDir));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server.' });
  }
  try {
    const { system, messages, max_tokens } = req.body;

    const body = {
      model: 'claude-sonnet-4-5',
      max_tokens: max_tokens || 1000,
      messages,
      ...(system && { system })
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Claude raw:', JSON.stringify(data).substring(0, 300));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return in same shape the frontend expects: { content: [{ type, text }] }
    res.json({ content: data.content || [] });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
});

const assistantSystemPrompt = `You are Gabay, the PharSayo medication assistant for Filipino patients.
Answer in simple Filipino or Taglish, matching the user's language. Be concise, calm, and practical.
You may explain common medicine uses, schedules, adherence, and general safety information.
Never diagnose, prescribe, change a dose, or tell a patient to stop medicine. For those questions, direct them to a doctor, pharmacist, or BHU.
For severe allergic reaction, chest pain, difficulty breathing, fainting, stroke symptoms, overdose, or self-harm, tell them to contact emergency services immediately.
Mention that medicine labels and the patient's clinician remain the primary source of truth.`;

function localMedicationAnswer(question = '') {
  const q = String(question).toLowerCase();
  if (/hirap.*(?:hinga|huminga)|chest pain|sakit.*dibdib|nahimatay|overdose|allergic|(?:pamamaga|namamaga).*mukha|stroke|emergency/.test(q)) {
    return 'Maaaring emergency ito. Tumawag agad sa 911 o pumunta sa pinakamalapit na emergency room. Huwag maghintay ng sagot sa app.';
  }
  if (/amlodipine/.test(q)) {
    return 'Ang amlodipine ay karaniwang ginagamit para sa mataas na presyon ng dugo. Inumin ito ayon sa reseta at sa parehong oras araw-araw. Posibleng side effects ang hilo, pamumula, o pamamaga ng bukung-bukong. Kumonsulta sa doktor o BHU kung malala o tuloy-tuloy.';
  }
  if (/metformin/.test(q)) {
    return 'Ang metformin ay karaniwang ginagamit para makatulong kontrolin ang blood sugar. Madalas itong iniinom kasabay o pagkatapos kumain para mabawasan ang pagsakit ng tiyan. Sundin ang label at reseta; huwag baguhin ang dose nang walang payo ng clinician.';
  }
  if (/atorvastatin/.test(q)) {
    return 'Ang atorvastatin ay tumutulong magpababa ng cholesterol. Inumin ayon sa iskedyul ng reseta. Kung may matinding pananakit o panghihina ng kalamnan, lalo na may lagnat o maitim na ihi, kumontak agad sa doktor.';
  }
  if (/nakalim|missed|hindi.*nainom|late|nalate/.test(q)) {
    return 'Para sa nakaligtaang dose, sundin ang instruction sa medicine label o tanungin ang pharmacist/BHU. Karaniwang hindi dapat mag-double dose maliban kung malinaw na sinabi ng clinician. Sabihin ang pangalan ng gamot para sa mas angkop na general guidance.';
  }
  if (/side effect|epekto|hilo|suka|pagsusuka|pantal/.test(q)) {
    return 'I-check ang label para sa karaniwang side effects at obserbahan kung kailan nagsimula. Kung banayad pero nagpapatuloy, tawagan ang doktor, pharmacist, o BHU. Kung hirap huminga, namamaga ang mukha/labi, o nahihimatay, emergency iyon—tumawag sa 911.';
  }
  if (/sabay|interaction|halo|alcohol|alak|vitamin|supplement/.test(q)) {
    return 'Hindi ligtas hulaan ang drug interaction nang walang kumpletong listahan. Ibigay sa pharmacist o doktor ang lahat ng gamot, vitamins, supplements, at alcohol use mo. Huwag pagsabayin o ihinto ang gamot base lang sa app.';
  }
  if (/para saan|ano.*gamot|gamit/.test(q)) {
    return 'Sabihin ang eksaktong pangalan at dose na nasa label. Maipapaliwanag ko ang karaniwang gamit at safety reminders, pero ang reseta at payo ng doktor o pharmacist pa rin ang dapat sundin.';
  }
  return 'Maaari kitang tulungan sa karaniwang gamit ng gamot, schedule, missed dose, at general side effects. I-type ang eksaktong pangalan at dose ng gamot. Para sa diagnosis o pagbabago ng reseta, kumonsulta sa doktor, pharmacist, o BHU.';
}

app.post('/api/assistant', async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-8) : [];
  const question = String(req.body?.question || messages.at(-1)?.content || '').trim();
  const medications = Array.isArray(req.body?.medications) ? req.body.medications.slice(0, 12) : [];
  if (!question) return res.status(400).json({ error: 'Question is required.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const medicineContext = medications.length
        ? `\nCurrent medication list supplied by the app:\n${medications.map((item) => `- ${item.name || 'Unknown'} ${item.dose || ''} at ${item.time || 'unspecified time'}`).join('\n')}`
        : '';
      const contents = [
        { role: 'user', parts: [{ text: assistantSystemPrompt + medicineContext }] },
        ...messages.map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(message.content || '') }]
        }))
      ];
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.25, maxOutputTokens: 280 } })
      });
      if (response.ok) {
        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) return res.json({ answer, mode: 'gemini' });
      }
    } catch (error) {
      console.error('Gemini assistant fallback:', error.message);
    }
  }

  return res.json({ answer: localMedicationAnswer(question), mode: 'local' });
});

app.post('/api/identify-medicine', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Hindi pa naka-connect ang AI image recognition. Idagdag muna ang Gemini key sa Vercel, saka subukang mag-scan ulit.' });
  }

  const imageBase64 = String(req.body?.imageBase64 || '').replace(/^data:[^;]+;base64,/, '');
  const mimeType = /^image\/(jpeg|png|webp|heic|heif)$/.test(String(req.body?.mimeType || '')) ? req.body.mimeType : 'image/jpeg';
  if (!imageBase64) return res.status(400).json({ error: 'Medicine label image is required.' });
  if (imageBase64.length > 9_000_000) return res.status(413).json({ error: 'Masyadong malaki ang larawan. Kunan ulit nang mas malapit sa label.' });

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const prompt = `Read the visible text on this medicine packaging or prescription label and identify it conservatively.
Return JSON only with: name, dosage, form, confidence (high, medium, or low), visibleText, guidance.
Use "Hindi matukoy" as name when the printed medicine name is not clearly visible. Never identify a medicine from pill color or shape alone.
Guidance must be concise Filipino/Taglish general information, must not prescribe or change a dose, and must tell the user to confirm against the original label or a pharmacist.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300, responseMimeType: 'application/json' }
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Vision request failed.');
    const raw = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!raw) throw new Error('No medicine details returned.');
    const finding = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ''));
    if (!finding?.name || !['high', 'medium', 'low'].includes(finding.confidence)) throw new Error('Invalid medicine result.');
    return res.json({ finding, mode: 'gemini' });
  } catch (error) {
    console.error('Medicine image analysis:', error.message);
    return res.status(502).json({ error: 'Hindi mabasa nang maayos ang label. Kunan ulit sa maliwanag na lugar at siguraduhing kita ang pangalan at dosage.' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(expoWebDir, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
