const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * HTTPS endpoint backing src/services/aiService.js (VITE_AI_API_URL).
 * Verifies the caller's Firebase ID token (JWT) before proxying to the
 * LLM provider, so the provider API key never reaches the browser.
 *
 * Replace `callLLM` with your actual provider call (Anthropic/OpenAI/etc).
 * Keep the provider key in `functions:config` / Secret Manager, never in code.
 */
exports.aiChat = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).send('');
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    await admin.auth().verifyIdToken(token); // throws if invalid/expired
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { type, message, history, macroProfile, context } = req.body;

  try {
    let reply;
    switch (type) {
      case 'chat':
        reply = await callLLM(buildChatPrompt(message, history));
        return res.json({ reply });
      case 'recommend_nutrition':
        reply = await callLLM(buildNutritionPrompt(macroProfile));
        return res.json({ summary: reply });
      case 'suggest_products':
        reply = await callLLM(buildSuggestionPrompt(context));
        return res.json({ summary: reply });
      default:
        return res.status(400).json({ error: 'Unknown request type' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI service error' });
  }
});

function buildChatPrompt(message, history = []) {
  const transcript = history.map((h) => `${h.role}: ${h.content}`).join('\n');
  return `You are Rex, a friendly, evidence-based fitness and nutrition assistant for RB_Protein, an oats/protein e-commerce brand. Keep answers concise and practical.\n\n${transcript}\nuser: ${message}\nassistant:`;
}
function buildNutritionPrompt(macroProfile) {
  return `Given this user's daily macro targets: ${JSON.stringify(macroProfile)}, suggest which RB_Protein product categories (protein powder, oats, creatine) best fit their goal and why, in 2-3 sentences.`;
}
function buildSuggestionPrompt(context) {
  return `Given this shopping context: ${JSON.stringify(context)}, suggest 2-3 complementary RB_Protein products a customer might also want, with a one-line reason each.`;
}

/** Swap this for a real provider call. */
async function callLLM(prompt) {
  // Example using Anthropic's Messages API:
  // const resp = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: {
  //     'x-api-key': process.env.ANTHROPIC_API_KEY,
  //     'anthropic-version': '2023-06-01',
  //     'content-type': 'application/json',
  //   },
  //   body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
  // });
  // const data = await resp.json();
  // return data.content?.[0]?.text || '';
  return 'AI provider not configured yet — wire up callLLM() in functions/ai.js.';
}
