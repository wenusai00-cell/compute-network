# Compute Network — Phase 1

Idle device compute-sharing network. Same codebase runs on mobile and PC
because it's just a website — no app store needed for Phase 1.

## What's actually real right now
- Real background compute (SHA-256 hashing loop in a Web Worker) — not simulated
- Live waveform driven by actual hash-rate
- UI fully responsive, works in phone + PC browser
- API routes exist and respond

## What's NOT real yet (be honest with yourself here)
- No database — `/lib/store.js` is in-memory only, resets on server cold start
- No user accounts / login
- No real payout system
- "Devices online" / "units shared" numbers are seed placeholders, not live network data
- Compute is CPU hashing (proof-of-work style), not yet real AI inference — that's Phase 2 (WebGPU/ONNX)

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000 — open the same URL on your phone (same wifi, use your PC's local IP instead of localhost) to test on mobile too.

## Deploy
1. Push this folder to a GitHub repo
2. Import the repo in Vercel
3. Deploy — open the Vercel URL on your phone to test for real

## Phase 2 (next real step)
- Add Supabase: real user accounts, persistent contribution history, real payout ledger
- Swap the hashing worker for real AI inference tasks pulled from a job queue
- Add a leaderboard using real per-user data instead of the shared totals
