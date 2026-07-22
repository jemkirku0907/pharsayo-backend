const enhancedAssistantSystemPrompt = [
  'You are Gabay, the PharSayo medicine and medication-safety assistant for Filipino patients.',
  'Answer any question genuinely related to medicines, vitamins, vaccines, prescriptions, labels, dosage forms, schedules, missed doses, administration, common side effects, interactions, storage, expiry, pregnancy or breastfeeding precautions, and adherence.',
  'Match the user language: Filipino, Taglish, or English. Use plain language and short practical answers.',
  'If a name is ambiguous, ask for the exact generic name, strength, dosage form, and label directions.',
  'Explain general labeled guidance, but never diagnose, prescribe, invent a patient-specific dose, change a prescription, or tell someone to stop a prescribed medicine.',
  'For pregnancy, breastfeeding, children, kidney or liver disease, and older adults, recommend confirmation with a doctor or pharmacist.',
  'For severe allergy, breathing difficulty, chest pain, fainting, stroke symptoms, seizure, overdose, severe bleeding, or self-harm, direct the user to emergency services immediately.',
  'The medicine label, pharmacist, and prescribing clinician remain the primary source of truth.'
].join(' ');

const medicineDatabase = [
  {
    names: ['amlodipine'],
    en: ['Amlodipine is a calcium-channel blocker commonly used for high blood pressure and angina.', 'Common effects include ankle swelling, flushing, headache, and dizziness.', 'It is usually taken at the same time daily, with or without food, exactly as prescribed.', 'Seek prompt care for fainting, severe chest pain, or a very fast or irregular heartbeat.'],
    tl: ['Ang amlodipine ay calcium-channel blocker para sa high blood pressure at angina.', 'Karaniwang side effects ang pamamaga ng bukung-bukong, pamumula, sakit ng ulo, at hilo.', 'Karaniwang iniinom sa parehong oras araw-araw, may pagkain man o wala, ayon sa reseta.', 'Magpatingin agad kung nahihimatay, matindi ang chest pain, o irregular ang tibok ng puso.']
  },
  {
    names: ['metformin'],
    en: ['Metformin helps control blood sugar in type 2 diabetes.', 'Nausea, loose stool, gas, and stomach discomfort are common, especially at first.', 'Taking it with a meal often reduces stomach upset; follow the prescribed formulation and schedule.', 'Seek prompt care for severe weakness, repeated vomiting, breathing trouble, or unusual sleepiness.'],
    tl: ['Ang metformin ay tumutulong kontrolin ang blood sugar sa type 2 diabetes.', 'Karaniwan ang pagduduwal, loose stool, kabag, at stomach discomfort lalo na sa simula.', 'Madalas mas banayad sa tiyan kapag kasabay ng pagkain; sundin ang formulation at schedule sa reseta.', 'Magpatingin agad kung sobrang nanghihina, paulit-ulit ang pagsusuka, hirap huminga, o kakaibang antok.']
  },
  {
    names: ['atorvastatin', 'lipitor'],
    en: ['Atorvastatin lowers LDL cholesterol and helps reduce heart attack and stroke risk.', 'Some people develop mild muscle aches or digestive discomfort.', 'Take it consistently as prescribed and disclose all medicines and supplements.', 'Contact a clinician promptly for severe muscle pain or weakness, especially with fever or dark urine.'],
    tl: ['Ang atorvastatin ay nagpapababa ng LDL cholesterol at tumutulong bawasan ang heart attack at stroke risk.', 'Maaaring magkaroon ng mild muscle ache o digestive discomfort.', 'Inumin nang consistent ayon sa reseta at sabihin ang lahat ng gamot at supplements.', 'Kumontak agad kung matindi ang muscle pain o panghihina, lalo na kung may lagnat o maitim na ihi.']
  },
  {
    names: ['losartan'],
    en: ['Losartan is an ARB used for high blood pressure and sometimes kidney or heart protection.', 'Dizziness and changes in potassium or kidney tests can occur.', 'Blood pressure, kidney function, and potassium may need monitoring; avoid potassium supplements unless approved.', 'Seek urgent care for facial swelling, breathing difficulty, fainting, or severe weakness.'],
    tl: ['Ang losartan ay ARB para sa high blood pressure at minsan para sa kidney o heart protection.', 'Maaaring magdulot ng hilo at pagbabago sa potassium o kidney tests.', 'Maaaring kailangang i-monitor ang BP, kidney function, at potassium; huwag basta uminom ng potassium supplement.', 'Mag-emergency kung namamaga ang mukha, hirap huminga, nahihimatay, o sobrang nanghihina.']
  },
  {
    names: ['paracetamol', 'acetaminophen', 'biogesic'],
    en: ['Paracetamol or acetaminophen is used for fever and mild to moderate pain.', 'It is usually well tolerated at the labeled dose.', 'Check cold and flu products because many also contain it, which can accidentally double the ingredient.', 'Too much can seriously damage the liver even before symptoms appear; suspected overdose needs emergency help now.'],
    tl: ['Ang paracetamol o acetaminophen ay para sa lagnat at mild to moderate pain.', 'Karaniwan itong well tolerated kapag tama ang dose sa label.', 'I-check ang cold at flu medicines dahil marami ring may paracetamol at maaaring madoble ang ingredient.', 'Ang overdose ay maaaring makasira ng atay kahit wala pang sintomas; kailangan agad ng emergency help.']
  },
  {
    names: ['ibuprofen', 'advil', 'motrin'],
    en: ['Ibuprofen is an NSAID used for pain, fever, and inflammation.', 'It can cause stomach upset, heartburn, dizziness, or fluid retention.', 'Ask first if you have ulcers, kidney or heart disease, take blood thinners, or are pregnant.', 'Seek care for vomiting blood, black stool, severe stomach pain, breathing difficulty, or reduced urine.'],
    tl: ['Ang ibuprofen ay NSAID para sa pain, fever, at inflammation.', 'Maaaring magdulot ng stomach upset, heartburn, hilo, o fluid retention.', 'Magtanong muna kung may ulcer, kidney o heart disease, blood thinner, o buntis.', 'Magpatingin agad kung sumusuka ng dugo, maitim ang dumi, matindi ang sakit ng tiyan, hirap huminga, o kaunti ang ihi.']
  },
  {
    names: ['aspirin'],
    en: ['Aspirin can relieve pain and fever; low-dose aspirin may be prescribed to prevent blood clots.', 'Stomach irritation, easy bruising, and bleeding can occur.', 'Do not start daily aspirin on your own, and do not give it to a child with a viral illness unless specifically directed.', 'Seek urgent care for severe bleeding, black stool, vomiting blood, wheezing, or facial swelling.'],
    tl: ['Ang aspirin ay maaaring para sa pain o fever; ang low-dose aspirin ay minsang reseta para maiwasan ang blood clot.', 'Maaaring magkaroon ng stomach irritation, madaling pasa, at bleeding.', 'Huwag magsimula ng daily aspirin nang walang payo at huwag basta ibigay sa batang may viral illness.', 'Magpatingin agad para sa matinding bleeding, maitim na dumi, pagsusuka ng dugo, wheezing, o facial swelling.']
  },
  {
    names: ['amoxicillin'],
    en: ['Amoxicillin is a penicillin-type antibiotic for certain bacterial infections; it does not treat colds or flu.', 'Nausea, loose stool, and a mild rash can occur.', 'Use it only when prescribed and follow the exact schedule.', 'Breathing difficulty, facial swelling, blistering rash, or severe persistent diarrhea needs urgent care.'],
    tl: ['Ang amoxicillin ay penicillin-type antibiotic para sa ilang bacterial infection; hindi ito gamot sa sipon o flu.', 'Maaaring magkaroon ng pagduduwal, loose stool, o mild rash.', 'Gamitin lamang kapag nireseta at sundin ang eksaktong schedule.', 'Emergency ang hirap huminga, facial swelling, blistering rash, o matinding tuloy-tuloy na diarrhea.']
  },
  {
    names: ['cetirizine'],
    en: ['Cetirizine is an antihistamine for allergy symptoms such as sneezing, itching, and hives.', 'Sleepiness, dry mouth, and fatigue can occur.', 'Avoid driving until you know its effect and be cautious with alcohol or other sedating medicines.', 'Breathing difficulty or swelling of the face, tongue, or throat is an emergency.'],
    tl: ['Ang cetirizine ay antihistamine para sa bahing, pangangati, at hives.', 'Maaaring antukin, matuyo ang bibig, o mapagod.', 'Iwasang mag-drive hanggang alam mo ang epekto at mag-ingat sa alcohol o ibang nakakaantok na gamot.', 'Emergency ang hirap huminga o pamamaga ng mukha, dila, o lalamunan.']
  },
  {
    names: ['omeprazole'],
    en: ['Omeprazole reduces stomach acid and is used for reflux, ulcers, and related conditions.', 'Headache, stomach discomfort, nausea, or diarrhea can occur.', 'Timing depends on the indication and product, so follow the label or prescription.', 'Seek care for vomiting blood, black stool, trouble swallowing, or unexplained weight loss.'],
    tl: ['Ang omeprazole ay nagpapababa ng stomach acid at ginagamit para sa reflux, ulcer, at related conditions.', 'Maaaring sumakit ang ulo o tiyan, maduwal, o mag-diarrhea.', 'Depende sa indication at product ang timing, kaya sundin ang label o reseta.', 'Magpatingin kung sumusuka ng dugo, maitim ang dumi, hirap lumunok, o unexplained weight loss.']
  }
];

function isEnglish(text) {
  return /\b(what|why|when|how|can|should|medicine|medication|side effect|missed dose|take|safe)\b/i.test(text)
    && !/\b(ano|bakit|paano|gamot|pwede|maaari|sabay|kailan|para saan)\b/i.test(text);
}

function findMedicine(text) {
  const normalized = text.toLowerCase();
  return medicineDatabase.find((item) => item.names.some((name) => normalized.includes(name)));
}

function extractMedicineCandidate(question) {
  const text = String(question).toLowerCase().replace(/[^a-z0-9 -]/g, ' ');
  const patterns = [
    /(?:what is|what s|about|para saan ang|ano ang|gamot na)\s+([a-z][a-z0-9-]{2,})/,
    /(?:effects?|dose|dosage|interaction|storage|expiry|take)\s+(?:of|for)?\s*([a-z][a-z0-9-]{2,})/,
    /([a-z][a-z0-9-]{2,})\s+(?:side effects?|dose|dosage|interaction)/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function section(record, fields, maxLength = 420) {
  for (const field of fields) {
    const value = record[field];
    if (!Array.isArray(value) || !value[0]) continue;
    const clean = String(value[0]).replace(/\s+/g, ' ').trim();
    return clean.length > maxLength ? clean.slice(0, maxLength).replace(/\s+\S*$/, '') + '?' : clean;
  }
  return '';
}

async function lookupOfficialLabel(question) {
  const candidate = extractMedicineCandidate(question);
  if (!candidate) return null;
  const search = '(openfda.generic_name:"' + candidate + '" OR openfda.brand_name:"' + candidate + '")';
  const url = 'https://api.fda.gov/drug/label.json?search=' + encodeURIComponent(search) + '&limit=1';
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!response.ok) return null;
    const payload = await response.json();
    const record = payload?.results?.[0];
    if (!record) return null;
    const q = String(question).toLowerCase();
    const english = isEnglish(question);
    const labelName = record.openfda?.generic_name?.[0] || record.openfda?.brand_name?.[0] || candidate;
    let detail;
    if (/side effect|adverse|epekto|reaction/.test(q)) detail = section(record, ['adverse_reactions', 'warnings', 'warnings_and_cautions']);
    else if (/interact|sabay|combine|halo|alcohol|alak|supplement/.test(q)) detail = section(record, ['drug_interactions', 'warnings_and_cautions', 'warnings']);
    else if (/dose|dosage|how much|ilang|gaano.*karami/.test(q)) detail = section(record, ['dosage_and_administration', 'directions'], 360);
    else if (/pregnan|buntis|breastfeed|nagpapasuso|lactat/.test(q)) detail = section(record, ['pregnancy', 'nursing_mothers', 'use_in_specific_populations', 'warnings']);
    else detail = section(record, ['indications_and_usage', 'purpose', 'description']);
    if (!detail) return null;
    return english
      ? 'Official label match for ' + labelName + ': ' + detail + ' This label summary may differ from your local product. Follow your own package and confirm personal dosing or treatment decisions with a pharmacist or clinician.'
      : 'Official label match para sa ' + labelName + ': ' + detail + ' Maaaring iba ito sa local product mo. Sundin ang sarili mong package at ikumpirma sa pharmacist o clinician ang personal dose o treatment decision.';
  } catch {
    return null;
  }
}

function enhancedMedicationAnswer(question = '', currentMedicines = []) {
  const raw = String(question).trim();
  const q = raw.toLowerCase();
  const english = isEnglish(raw);
  const medicine = findMedicine(raw);
  const info = medicine && medicine[english ? 'en' : 'tl'];

  if (/difficulty.*breath|cannot breathe|chest pain|faint|seizure|stroke|overdose|suicid|self.harm|vomit.*blood|severe bleeding|hirap.*(?:hinga|huminga)|sakit.*dibdib|nahimatay|kombulsyon|labis.*inom|pagpapakamatay|sumusuka.*dugo|matinding.*pagdurugo/.test(q)) {
    return english ? 'This may be an emergency. Call 911 or go to the nearest emergency department now. For a suspected overdose, do not wait for symptoms and bring the medicine package.' : 'Maaaring emergency ito. Tumawag sa 911 o pumunta agad sa emergency room. Kung posibleng overdose, huwag hintayin ang sintomas at dalhin ang medicine package.';
  }
  if (info) {
    if (/side effect|adverse|epekto|hilo|pantal|reaction/.test(q)) return [info[1], info[3], info[2]].join(' ');
    if (/missed|forgot|late|nakalim|nalate|hindi.*nainom/.test(q)) return info[2] + (english ? ' For a missed dose, follow the product label or call a pharmacist. Do not double the next dose unless specifically instructed.' : ' Para sa missed dose, sundin ang label o tumawag sa pharmacist. Huwag mag-double dose maliban kung partikular na sinabi.');
    if (/dose|dosage|how much|ilang|gaano.*karami|taasan|bawasan/.test(q)) return info[0] + (english ? ' The correct dose depends on the exact product, strength, age, condition, and prescription. Copy the label directions so I can explain them; do not change the dose without a clinician.' : ' Ang tamang dose ay depende sa exact product, strength, edad, kondisyon, at reseta. I-type ang directions sa label para maipaliwanag ko; huwag baguhin nang walang clinician.');
    if (/interact|sabay|combine|halo|alcohol|alak|supplement|vitamin/.test(q)) return info[2] + (english ? ' A reliable interaction check needs the complete medicine, vitamin, supplement, allergy, and alcohol list. Have a pharmacist confirm the combination.' : ' Para sa reliable interaction check, kailangan ang buong medicine, vitamin, supplement, allergy, at alcohol list. Pharmacist ang magkumpirma ng combination.');
    if (/food|meal|empty stomach|pagkain|kain|tiyan|before|after|bago|pagkatapos/.test(q)) return info[2];
    return info.join(' ');
  }
  if (/pregnan|buntis|breastfeed|nagpapasuso|lactat/.test(q)) return english ? 'Medicine safety in pregnancy or breastfeeding depends on the exact drug, dose, trimester, and reason for use. Send the generic name and strength. Do not start or stop a prescription without contacting your obstetric clinician or pharmacist.' : 'Ang medicine safety sa pregnancy o breastfeeding ay depende sa exact drug, dose, trimester, at dahilan. Ibigay ang generic name at strength. Huwag magsimula o huminto ng reseta nang hindi kinokontak ang OB o pharmacist.';
  if (/child|kid|baby|infant|bata|sanggol|pediatric/.test(q)) return english ? 'Children?s doses depend on weight, age, formulation, and diagnosis. Send the exact medicine, concentration, age, weight, and label directions, then confirm with a pediatric clinician or pharmacist.' : 'Ang dose ng bata ay depende sa timbang, edad, formulation, at diagnosis. Ibigay ang exact medicine, concentration, edad, timbang, at label directions, then confirm sa pediatric clinician o pharmacist.';
  if (/expir|storage|store|refriger|init|lamig|ref|imbak|tago/.test(q)) return english ? 'Follow the original package storage statement. Keep medicines dry, away from heat and children, and do not use an expired or damaged product without pharmacist confirmation. Some liquids and injections have special refrigeration or discard dates.' : 'Sundin ang storage instruction sa original package. Panatilihing tuyo, malayo sa init at bata, at huwag gumamit ng expired o sirang product nang walang pharmacist confirmation. May special refrigeration o discard date ang ilang liquid at injection.';
  if (/interact|sabay|combine|halo|alcohol|alak|supplement|vitamin/.test(q)) return english ? 'I can screen possible interactions, but I need every exact medicine name and strength, vitamin, supplement, allergy, and alcohol use. A pharmacist should confirm the final combination.' : 'Makakatulong akong mag-screen ng possible interactions, pero kailangan ang exact name at strength ng lahat ng gamot, vitamin, supplement, allergy, at alcohol use. Pharmacist ang dapat magkumpirma.';
  if (/missed|forgot|late|nakalim|nalate|hindi.*nainom/.test(q)) return english ? 'Missed-dose advice differs by medicine. Send the exact medicine, strength, schedule, and how late it is. Follow the label and do not double a dose unless specifically instructed.' : 'Iba-iba ang missed-dose advice bawat gamot. Ibigay ang exact medicine, strength, schedule, at gaano na ka-late. Sundin ang label at huwag mag-double dose maliban kung sinabi.';
  if (/side effect|adverse|epekto|hilo|pantal|reaction/.test(q)) return english ? 'Send the medicine name, strength, symptom, when it started, and last dose. Breathing difficulty, facial swelling, fainting, severe rash, or heavy bleeding needs emergency care.' : 'Ibigay ang medicine name, strength, sintomas, kailan nagsimula, at last dose. Emergency ang hirap huminga, facial swelling, pagkahimatay, severe rash, o matinding bleeding.';

  const listed = currentMedicines.map((item) => item.name).filter(Boolean).slice(0, 4).join(', ');
  const context = listed ? (english ? ' Your listed medicines are: ' : ' Ang listed medicines mo ay: ') + listed + '.' : '';
  return (english ? 'I can help with medicine uses, label directions, schedules, missed doses, side effects, interactions, food or alcohol, storage, expiry, pregnancy or breastfeeding precautions, and safety. Send the exact name, strength, dosage form, and your question.' : 'Makakatulong ako sa gamit ng gamot, label directions, schedule, missed dose, side effects, interactions, pagkain o alcohol, storage, expiry, pregnancy o breastfeeding precautions, at safety. I-type ang exact name, strength, dosage form, at tanong mo.') + context;
}

async function enhancedMedicationAnswerAsync(question = '', currentMedicines = []) {
  if (findMedicine(String(question))) {
    return { answer: enhancedMedicationAnswer(question, currentMedicines), source: 'local' };
  }
  const officialAnswer = await lookupOfficialLabel(question);
  if (officialAnswer) return { answer: officialAnswer, source: 'openfda' };
  return { answer: enhancedMedicationAnswer(question, currentMedicines), source: 'local' };
}

module.exports = { enhancedAssistantSystemPrompt, enhancedMedicationAnswer, enhancedMedicationAnswerAsync };
