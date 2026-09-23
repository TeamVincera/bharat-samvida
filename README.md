# Bharat Samvida

A Next.js application with an anonymous Tender Studio, Groq analysis, Hindi/English interface, PDF/DOCX exports and a local legal library.

## Free deployment on Render

1. Put the CONTENTS of this folder in a private GitHub repository. `package.json` and `render.yaml` must be at the repository root.
2. Sign up at https://dashboard.render.com/register and complete the account setup yourself.
3. In Render, choose **New → Blueprint**, connect only this repository and select it. The included `render.yaml` requests a **Free** Node web service in Singapore. Confirm that the plan is Free before deploying.
4. Render will request `GROQ_API_KEY`. Paste the key into that secret field, not into GitHub or a chat. It is used on the server only.
5. Deploy. When the service says **Live**, open its assigned `https://…onrender.com` address. Render chooses the final available subdomain.

If using **New → Web Service** instead of Blueprint:

- Runtime: Node; region: Singapore; instance type: Free
- Build: `npm ci --include=dev && npm run build`
- Start: `npm run start:render`
- Health check: `/api/health`
- Environment: `NODE_VERSION=22`, `NEXT_TELEMETRY_DISABLED=1`, `APP_MODE=live`, `GROQ_API_KEY` (secret), `GROQ_EXTRACTION_MODEL=openai/gpt-oss-20b`, `GROQ_RECOMMENDATION_MODEL=openai/gpt-oss-120b`.

Do not choose Static Site: this app needs a backend for AI, sessions, document parsing and exports. Do not upload `.env.local`, `node_modules`, `.next`, old handoff ZIPs or local test downloads. This prepared folder intentionally excludes those.

## What the free deployment includes

Render provides the web service, HTTPS and an onrender.com address under its free-plan limits. Groq usage has separate account/model rate limits; hosting being free does not make paid AI usage free. Keep the Groq account on its free allowance if a zero-cost demo is required.

Render's free service sleeps after 15 idle minutes and may take about a minute to wake. Temporary drafts are stored in server memory and are lost on sleep, restart or redeploy; download work you need to keep. Keep one service instance. This configuration is for an SIH demo, not persistent production procurement records.

Original legal PDFs remain available. Hindi reading translations are AI-assisted where an official Hindi page is unavailable, and are labelled accordingly. The standards catalogue is a curated starter set and requires authority review.

Official hosting documentation: https://render.com/docs/free and https://render.com/docs/deploy-nextjs-app

## Verify after deployment

- Open Home, Studio and Library on phone and desktop.
- Select Hindi and reload; confirm the selected language persists.
- Open a library PDF and download the original.
- Submit a non-sensitive sample brief, answer clarification questions and download PDF/DOCX.
- Confirm the chat remains usable across consecutive answer requests.
- Never submit real confidential tender data for a public demo.

## Local development

Use Node 22. Run `npm ci`, copy `.env.example` to `.env.local`, configure your local key, then `npm run dev`.
Run `npm test` and `npm run build` before publishing changes.

## Netlify Free (no card)

Connect this repository to a Netlify Free project. Build command: `npm run build`; publish directory: `.next`; Node 22. Keep the automatic Next.js adapter enabled. Configure runtime environment variables in the Netlify UI: `SESSION_STORAGE=netlify`, `APP_MODE=live`, and `GROQ_API_KEY` as a secret. Optional model variables retain the defaults listed above.

Netlify uses encrypted Blobs for temporary sessions, replacing the single-server memory limitation described in the Render section. The random HttpOnly session token derives the encryption key and is never stored alongside the encrypted record. Access expires after 30 minutes of inactivity or 2 hours total. A scheduled job removes expired records every ten minutes; cleanup depends on scheduled-function availability. Session deletion removes its stored record. Uploads are limited to 3 MB for serverless request limits. Keep secrets in Netlify, never in this repository.
