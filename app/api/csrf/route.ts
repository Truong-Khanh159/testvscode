import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/server/security";

export async function GET() {
  const token = await issueCsrfToken();
  return NextResponse.json({ token });
}
