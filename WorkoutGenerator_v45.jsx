const clampText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const extractResponseText = (data) => {
  if (typeof data?.output_text === 'string') return data.output_text;
  const message = data?.output?.find(item => item.type === 'message');
  const textPart = message?.content?.find(item => item.type === 'output_text' || item.text);
  return textPart?.text || '';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = clampText(req.body?.prompt, 500);
  const demoResponse = clampText(req.body?.demoResponse, 900) || 'ForgeAI Coach · Demo AI\n\nDemo coaching is ready. Add a prompt to get a workout-specific adjustment.';
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-5.5';

  if (!prompt) {
    res.status(200).json({ mode: 'demo', answer: demoResponse, error: 'Prompt was empty.' });
    return;
  }

  if (!apiKey) {
    res.status(200).json({ mode: 'demo', answer: demoResponse });
    return;
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 350,
        input: [
          {
            role: 'system',
            content: [
              'You are ForgeAI Coach, a premium concise strength and fitness coach.',
              'Use the provided workout/settings context.',
              'Return practical coaching only. No medical claims.',
              'Keep the response under 900 characters.'
            ].join(' ')
          },
          {
            role: 'user',
            content: JSON.stringify({
              prompt,
              context: req.body?.context || {}
            })
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      res.status(200).json({
        mode: 'demo',
        answer: demoResponse,
        error: `Live AI unavailable (${openaiResponse.status}). Demo AI answered instead.`
      });
      return;
    }

    const data = await openaiResponse.json();
    const answer = clampText(extractResponseText(data), 900);
    res.status(200).json({ mode: 'live', model, answer: answer || demoResponse });
  } catch (error) {
    res.status(200).json({
      mode: 'demo',
      answer: demoResponse,
      error: 'AI coach request failed. Demo AI answered instead.'
    });
  }
}
