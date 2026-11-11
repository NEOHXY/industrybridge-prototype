# IndustryBridge prototype

Clickable single-page prototype of IndustryBridge, an AI-powered challenge-management LMS for students and organizers.

The existing app is `index.html`. Streamlit serves an identical copy at `static/index.html`; the Python file only provides the Streamlit entry point and a full-window frame. No screens or JavaScript were rewritten.

## Deploy on Streamlit Community Cloud

1. Open [share.streamlit.io](https://share.streamlit.io/) and choose **Create app** → **Yup, I have an app**.
2. Repository: `NEOHXY/industrybridge-prototype`; branch: `main`; main file path: `app.py`.
3. Click **Deploy**. Share the resulting `*.streamlit.app` link. For the full-window original app, append `/app/static/index.html` to that link.

You can also run it locally with `pip install -r requirements.txt` and `streamlit run app.py`.

## Edit the prototype

Edit `index.html`, then copy it to `static/index.html` before committing. Both files must match. On Windows PowerShell:

```powershell
Copy-Item index.html static/index.html
```

The old Netlify configuration remains in the repository. Browser data stored on the Netlify domain is separate from data stored on the new Streamlit domain; demo state in this prototype may need to be entered again after switching links.

## Gemini AI (Program plan and poster)

When Gemini is connected, the organizer studio uses it: **Generate plan** (title, modules, weights, poster lines), **Suggest style & copy** and **Generate artwork** on the poster. Otherwise it falls back to the built-in templates and patterns.

### Team connection (everyone on the link gets Gemini)

The key lives in a Cloudflare Worker (`cloudflare-worker/worker.js`), never in this repo or the browser.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker** → name it (e.g. `industrybridge-gemini`) → **Deploy**.
2. **Edit code**, replace everything with `cloudflare-worker/worker.js`, **Deploy**.
3. Worker → **Settings** → **Variables and Secrets** → **Add**: type **Secret**, name `GEMINI_API_KEY`, value = key from [Google AI Studio](https://aistudio.google.com/app/apikey) → **Deploy**.
4. Open the Worker URL (`https://<name>.<account>.workers.dev`). It should show `"keySet":true`.
5. Put that URL in `index.html` as `const GEMINI_RELAY='https://…workers.dev';`, copy to `static/index.html`, commit and push.

**Free poster artwork:** Worker → **Settings** → **Bindings** → **Add binding** → **Workers AI**, variable name `AI` → Deploy. **Generate artwork** then draws with FLUX.1 schnell on Cloudflare's free daily allowance (no Gemini billing needed). The Worker URL should show `"imageAI":true`.

The Worker only answers requests from `https://neohxy.github.io` (and localhost), only Gemini models, and limits each visitor to 20 text and 5 image requests per 10 minutes. To allow another site, add a Text variable `ALLOWED_ORIGINS` (comma-separated). Also set a spend cap in Google AI Studio.

### Own key (optional)

Avatar menu → **Gemini AI** → paste a key → **Check key** → **Save**. It is stored only in that browser and overrides the team connection there. **Never put a key in `index.html` or this repo.**
