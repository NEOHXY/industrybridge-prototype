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
