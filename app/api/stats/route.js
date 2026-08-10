import { getTotals } from "../../../lib/store";

export async function GET() {
  return Response.json(getTotals());
}
