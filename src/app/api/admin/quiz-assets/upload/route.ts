import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/infrastructure/supabase/admin-client";
import { getAdminSession } from "@/lib/session";
import { quizAssetUploadFieldSchema } from "@/lib/validation";

const BUCKET = "quiz-assets";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }

  const file = form.get("file");
  const quizId = form.get("quizId");
  const questionId = form.get("questionId");
  const fieldRaw = form.get("field");

  if (!(file instanceof File) || typeof quizId !== "string" || typeof questionId !== "string") {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const field = quizAssetUploadFieldSchema.safeParse(fieldRaw);
  if (!field.success) {
    return NextResponse.json({ error: "INVALID_FIELD" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "INVALID_TYPE", detail: "僅支援 JPEG、PNG、WebP、GIF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "TOO_LARGE", detail: "單檔上限 5MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extFromMime(file.type);
  const path = `${quizId}/${questionId}/${field.data}-${randomUUID()}.${ext}`;

  const supabase = getSupabaseAdmin();
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) {
    return NextResponse.json(
      {
        error: "UPLOAD_FAILED",
        detail: upErr.message,
      },
      { status: 503 },
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
