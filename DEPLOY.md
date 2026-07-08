# DEPLOY.md — OnePitch AI

## Local Development

### Prerequisites
- Node.js 20.9+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Setup
```bash
# Clone the repo
git clone https://github.com/AryanMedigeri08/OnePitch.git
cd OnePitch

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local and add your GOOGLE_GENERATIVE_AI_API_KEY

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | No | Override the default model (default: `gemini-2.0-flash`) |

---

## Vercel Deployment (Frontend)

### Why Vercel?
- Zero-config for Next.js (automatic builds, edge functions)
- Free Hobby tier is sufficient for demo
- Instant preview URLs on every push

### Steps
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project" → Import the `AryanMedigeri08/OnePitch` repo
3. Framework Preset: **Next.js** (auto-detected)
4. Set Environment Variables:
   - `GOOGLE_GENERATIVE_AI_API_KEY` → your Gemini API key
5. Click "Deploy"
6. Your live URL will be assigned (e.g., `onepitch.vercel.app`)

### Subsequent Deployments
Every `git push` to the connected branch triggers an automatic deployment.

---

## Redeployment / Migration Notes

- This is a single Next.js app — no separate backend service to deploy
- All API routes run as serverless functions on Vercel
- Mock data is in-memory; state resets on each serverless cold start
- No database connection strings needed
- For long-term portfolio use, consider adding persistence (Vercel KV or Firestore) for incident logs
