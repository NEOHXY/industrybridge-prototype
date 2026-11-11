"""Streamlit entry point for the existing IndustryBridge prototype."""

import streamlit as st


st.set_page_config(
    page_title="IndustryBridge Prototype",
    page_icon="🌉",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Keep the original HTML app as the source of truth. Streamlit serves its
# unchanged copy from /app/static/index.html, including all embedded assets.
st.markdown(
    """
    <style>
      header[data-testid="stHeader"],
      [data-testid="stToolbar"],
      [data-testid="stDecoration"],
      [data-testid="stStatusWidget"] { display: none !important; }
      .stApp { overflow: hidden; }
      .block-container { max-width: none !important; padding: 0 !important; }
      [data-testid="stVerticalBlock"] { gap: 0 !important; }
      iframe[title="IndustryBridge prototype"] {
        height: 100dvh !important;
        width: 100% !important;
        display: block;
        border: 0;
      }
    </style>
    """,
    unsafe_allow_html=True,
)

st.iframe(
    "/app/static/index.html",
    height=900,
    alt="IndustryBridge prototype",
)
