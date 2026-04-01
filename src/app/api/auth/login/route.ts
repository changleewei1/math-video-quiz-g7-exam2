import { NextResponse } from "next/server";
import { getLoginAdminUseCase, getLoginStudentUseCase } from "@/infrastructure/composition";
import { loginBodySchema } from "@/lib/validation";
import { setAdminSessionCookie, setStudentSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = loginBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const body = parsed.data;
  if (body.role === "student") {
    const uc = getLoginStudentUseCase();
    const result = await uc.execute(body.studentCode, body.password);
    if (!result) {
      return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 401 });
    }
    await setStudentSessionCookie(result.token);
    return NextResponse.json({
      ok: true,
      studentId: result.studentId,
      name: result.name,
    });
  }
  const uc = getLoginAdminUseCase();
  const result = await uc.execute(body.adminSecret);
  if (!result) {
    return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 401 });
  }
  await setAdminSessionCookie(result.token);
  return NextResponse.json({ ok: true });
}
