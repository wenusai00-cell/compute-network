import { recordContribution } from "../../../lib/store";

export async function POST(req) {
  const body = await req.json();
  const totals = recordContribution(body);
  return Response.json({ success: true, totals });
}
