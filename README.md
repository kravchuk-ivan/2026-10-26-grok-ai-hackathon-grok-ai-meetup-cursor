# RAISE

Hackathon app for a room of ~400: answer five questions, get a color, raise your phone, find your people, then lock a 7-day pact so the huddle does not evaporate.

The color is how you find each other. **The pact is why you stay.**

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
