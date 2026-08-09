export async function POST(req) {
  const body = await req.json();
  console.log("Contribution received:", body);
  // TODO Phase 1.5: Save to database (Supabase) with device ID + timestamp
  return Response.json({ success: true, received: body });
}