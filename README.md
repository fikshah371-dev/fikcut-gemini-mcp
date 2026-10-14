# FikCut Pro — Google Gemini Remote MCP Connector

Official Model Context Protocol (MCP) Streamable HTTP connector linking Google Gemini (Web & Mobile) with FikCut Pro Video Editor.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fikshah371-dev/fikcut-gemini-mcp)

---

## Features & Supported Tools

This connector exposes 10 production-grade video editing actions to Google Gemini:

1. `get_timeline_state`: Inspect active timeline tracks, clips, duration, and playhead position.
2. `get_project_info`: Inspect resolution (9:16 vertical 1080x1920 or 16:9), framerate, and clip counts.
3. `import_media`: Import video, audio, and image assets into the editor library.
4. `add_clip_to_timeline`: Place clips onto target tracks (`track-v1`, `track-v2`, `track-a1`, `track-t1`).
5. `split_clip`: Cut clips at exact timestamps.
6. `set_color_grade`: Apply cinematic CapCut color grading presets (Shadow Void, Cyberpunk, Teal & Orange, Nolan 35mm).
7. `auto_caption`: Generate dynamic Alex Hormozi animated captions on Track T1.
8. `generate_voiceover`: Generate AI speech from text with studio DSP vocal mastering on Track A1.
9. `ai_edit_command`: Execute natural language editing prompts in Malay or English.
10. `export_video`: Render and export complete timeline to MP4 with FFmpeg hardware acceleration.

---

## 1-Click Deployment to Vercel (Free & Instant)

1. Click the **Deploy with Vercel** button above or import repository `fikshah371-dev/fikcut-gemini-mcp` on [Vercel](https://vercel.com/new).
2. Click **Deploy**. Vercel will build and assign your official production URL:
   ```text
   https://fikcut-gemini-mcp.vercel.app/mcp
   ```
3. Open **Google Gemini** -> **Settings** -> **Connected Apps** -> **Add a custom app**.
4. Paste your Vercel URL and click **Next**!

---

## Deploy to Google Cloud Run

```bash
gcloud run deploy fikcut-gemini-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
