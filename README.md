# RAISE

Hackathon app for a room of about 400 people: answer five questions, get a color, hold up your phone, stand with people who have the same color, then agree to meet once in the next 7 days.

## Run locally

```bash
npm install
npm run dev
```

- Phone flow: `/`
- Projector / QR: `/host`

## Deploy (no API keys)

This is a static Vite app. Nothing to configure.

**Vercel**

```bash
npx vercel
```

**Cloudflare Pages**

```bash
npx wrangler pages deploy dist --project-name raise
```

Build command: `npm run build`. Output directory: `dist`.

You do not need a Wrangler token unless you want Cloudflare Pages from the CLI. Vercel is the faster path tonight.

## APIs

None required. The matching is client-side.

Optional later: a tiny Worker + KV if you want live counts per color on the host screen. That would need a Cloudflare API token with Pages/Workers + KV edit. Skip it for the demo.
