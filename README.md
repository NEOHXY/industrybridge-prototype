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

When Gemini is connected, the organizer studio uses it; otherwise it falls back to the built-in templates and patterns.

1. Create a key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In the app, open the avatar menu → **Gemini AI** (or the "Connect Gemini" link under Generate plan), paste the key, click **Check key**, pick a model, then **Save**.
3. Generate a plan. The title, tagline, learning modules, assessment weights and poster lines come from Gemini.
4. Design & publish → **Suggest style & copy** lets Gemini pick the poster style, brand colour and tag lines. **Generate artwork** draws a poster background with the image model you chose (Nano Banana). Image generation may need billing turned on for the key.

The site is static (GitHub Pages), so there is no server to hide a key. The key is saved only in that browser's localStorage and is never committed. **Never put a key in `index.html` or this repo.** In Google Cloud Console → Credentials, restrict the key to the Generative Language API and to the referrer `https://neohxy.github.io/*`.
