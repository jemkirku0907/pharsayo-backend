const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.get('/', (req, res) => res.send('PharSayo API proxy is running (Claude backend).'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
