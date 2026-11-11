/**
 * IndustryBridge · Gemini relay (Cloudflare Worker)
 *
 * The website calls this Worker; the Worker adds the Gemini API key and forwards the
 * request to Google. The key lives only in Cloudflare as the secret GEMINI_API_KEY and
 * never reaches the browser or the GitHub repo.
 *
 * Setup: Cloudflare dashboard → Workers & Pages → your Worker → Settings → Variables and Secrets
 *   GEMINI_API_KEY   (type: Secret)  your key from https://aistudio.google.com/app/apikey
 *   ALLOWED_ORIGINS  (type: Text, optional) comma-separated, e.g. https://neohxy.github.io
 */

const GOOGLE = 'https://generativelanguage.googleapis.com';
const DEFAULT_ORIGINS = ['https://neohxy.github.io'];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Best-effort limits per visitor IP (kept in memory, so they reset when Cloudflare recycles the Worker).
// Set a monthly spend cap in Google AI Studio as the real safety net.
const LIMITS = { text: 20, image: 5 };            // requests per IP per 10 minutes
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY = 20_000;                          // bytes; prompts here are short
const hits = new Map();

function allowedOrigin(origin, env) {
  if (!origin) return null;
  const list = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = (list.length ? list : DEFAULT_ORIGINS).includes(origin) || LOCAL.test(origin);
  return ok ? origin : null;
}

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function reply(status, data, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...(origin ? cors(origin) : {}) },
  });
}

function overLimit(ip, kind) {
  const now = Date.now(), key = ip + '|' + kind;
  const list = (hits.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (list.length >= LIMITS[kind]) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request.headers.get('Origin'), env);

    if (request.method === 'OPTIONS') {
      return origin ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
    }
    if (url.pathname === '/' && request.method === 'GET') {
      return reply(200, { ok: true, service: 'IndustryBridge Gemini relay', keySet: !!env.GEMINI_API_KEY }, origin);
    }
    if (!origin) return reply(403, { error: { message: 'This relay only answers the IndustryBridge website.' } });
    if (!env.GEMINI_API_KEY) return reply(500, { error: { message: 'GEMINI_API_KEY secret is not set on the Worker.' } }, origin);

    const auth = { 'x-goog-api-key': env.GEMINI_API_KEY };

    // List models (the site picks a Flash text model and an image model from this)
    if (request.method === 'GET' && url.pathname === '/v1beta/models') {
      const r = await fetch(`${GOOGLE}/v1beta/models?pageSize=200`, { headers: auth });
      return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json', ...cors(origin) } });
    }

    // Generate: only Gemini / Nano Banana models, only generateContent
    const m = url.pathname.match(/^\/v1beta\/models\/([a-z0-9.\-]+):generateContent$/i);
    if (request.method === 'POST' && m && /(gemini|banana)/i.test(m[1])) {
      const kind = /(image|banana)/i.test(m[1]) ? 'image' : 'text';
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (overLimit(ip, kind)) {
        return reply(429, { error: { message: `Too many ${kind} requests. Try again in a few minutes.` } }, origin);
      }
      const body = await request.text();
      if (body.length > MAX_BODY) return reply(413, { error: { message: 'Request too large.' } }, origin);
      const r = await fetch(`${GOOGLE}/v1beta/models/${m[1]}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...auth },
        body,
      });
      return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json', ...cors(origin) } });
    }

    return reply(404, { error: { message: 'Not found' } }, origin);
  },
};
