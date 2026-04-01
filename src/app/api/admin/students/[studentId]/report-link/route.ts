import { NextResponse } from "next/server";
import { getCreateStudentReportLinkUseCase } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";
import { reportLinkBodySchema } from "@/lib/validation";

type Params = { studentId: string };

function publicReportUrl(req: Request, token: string): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/report/${token}`;
}

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { studentId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = reportLinkBodySchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const body = parsed.data;

  try {
    const uc = getCreateStudentReportLinkUseCase();
    const { token, created } = await uc.execute({
      studentId,
      taskId: body.taskId ?? undefined,
      expiresInDays: body.expiresInDays ?? undefined,
    });
    const shareUrl = publicReportUrl(req, token);
    return NextResponse.json({ ok: true, token, shareUrl, created });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("student_report_tokens") || msg.includes("does not exist")) {
      return NextResponse.json(
        { error: "DB_MISSING_TABLE", detail: "請執行 migration：student_report_tokens" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "SERVER_ERROR", detail: msg }, { status: 500 });
  }
}
