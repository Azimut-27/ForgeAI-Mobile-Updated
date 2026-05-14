import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 12000) {
      reject(new Error('Request body too large'));
      req.destroy();
    }
  });
  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const sendJson = (res, payload, statusCode = 200) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const clampText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const extractResponseText = (data) => {
  if (typeof data?.output_text === 'string') return data.output_text;
  const message = data?.output?.find(item => item.type === 'message');
  const textPart = message?.content?.find(item => item.type === 'output_text' || item.text);
  return textPart?.text || '';
};

const aiCoachApiPlugin = () => ({
  name: 'forgeai-coach-api',
  configureServer(server) {
    server.middlewares.use('/api/ai-coach', async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, { error: 'Method not allowed' }, 405);
        return;
      }

      try {
        const body = await readJsonBody(req);
        const prompt = clampText(body.prompt, 500);
        const demoResponse = clampText(body.demoResponse, 900) || 'ForgeAI Coach · Demo AI\n\nDemo coaching is ready. Add a prompt to get a workout-specific adjustment.';
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL || 'gpt-5.5';

        if (!prompt) {
          sendJson(res, { mode: 'demo', answer: demoResponse, error: 'Prompt was empty.' });
          return;
        }

        if (!apiKey) {
          sendJson(res, { mode: 'demo', answer: demoResponse });
          return;
        }

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
                  context: body.context || {}
                })
              }
            ]
          })
        });

        if (!openaiResponse.ok) {
          sendJson(res, {
            mode: 'demo',
            answer: demoResponse,
            error: `Live AI unavailable (${openaiResponse.status}). Demo AI answered instead.`
          });
          return;
        }

        const data = await openaiResponse.json();
        const answer = clampText(extractResponseText(data), 900);
        sendJson(res, { mode: 'live', model, answer: answer || demoResponse });
      } catch (error) {
        sendJson(res, {
          mode: 'demo',
          answer: 'ForgeAI Coach · Demo AI\n\nLive AI is unavailable right now, so Demo AI is active. Try again with a shorter prompt or check the backend environment.',
          error: 'AI coach request failed. Demo AI answered instead.'
        });
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), aiCoachApiPlugin()]
});
