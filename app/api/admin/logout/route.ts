import { NextResponse } from "next/server";
import { clearSession } from "@/lib/server/auth";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  await clearSession();
  return NextResponse.json({ ok: true });
}
