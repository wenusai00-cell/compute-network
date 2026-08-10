// MVP in-memory store.
// IMPORTANT: On Vercel this resets whenever the serverless function cold-starts,
// so numbers will drift/reset in production. This exists only so the UI has
// something real to read from during Phase 1. Phase 2 replaces this with
// a real database (Supabase/Postgres) — see README.

let totals = {
  devices: 4812,
  units: 1200000,
  paid: 38204,
};

export function recordContribution({ units, earned }) {
  totals.devices += 0; // device count stays illustrative until real auth exists
  totals.units += units || 0;
  totals.paid += earned || 0;
  return totals;
}

export function getTotals() {
  return totals;
}
