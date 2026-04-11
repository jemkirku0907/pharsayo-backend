const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    const { system, messages, max_tokens } = req.body;
    const contents = [];

    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      } else if (Array.isArray(msg.content)) {
        const parts = [];
        for (const part of msg.content) {
          if (part.type === 'text') {
            parts.push({ text: part.text });
          } else if (part.type === 'image') {
            parts.push({
              inlineData: {
                mimeType: part.source.media_type,
                data: part.source.data
              }
            });
          }
        }
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        });
      }
    }

    if (system && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts.unshift({ text: '[SYSTEM]: ' + system + '\n\n' });
    }

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: max_tokens || 1000,
        temperature: 0.7
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log('Gemini raw:', JSON.stringify(data).substring(0, 300));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Text:', text.substring(0, 100));

    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
});

app.get('/', (req, res) => res.send('PharSayo API proxy is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
