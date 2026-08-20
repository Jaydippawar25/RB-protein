import { authHeader } from '../utils/jwt';

/**
 * All AI features are proxied through a Cloud Function (`/functions/ai.js`
 * in the deployment guide) so the LLM API key never ships to the browser.
 * VITE_AI_API_URL points at that function's HTTPS endpoint.
 */
const AI_URL = import.meta.env.VITE_AI_API_URL;

async function callAI(payload) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
  const res = await fetch(AI_URL, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('AI service unavailable');
  return res.json();
}

/** Free-form fitness/nutrition chatbot turn. */
export function chatWithAssistant(message, history = []) {
  return callAI({ type: 'chat', message, history });
}

/** Given a computed macro target, ask for product recommendations from our catalog. */
export function getNutritionRecommendations(macroProfile) {
  return callAI({ type: 'recommend_nutrition', macroProfile });
}

/** "Customers also fuel with..." style suggestions for a product/cart. */
export function getProductSuggestions(context) {
  return callAI({ type: 'suggest_products', context });
}
