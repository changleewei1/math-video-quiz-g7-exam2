/**
 * 將 data/g7_class_701_credentials.json 寫入 Supabase students（班級 701、grade 7）
 * 使用：npx tsx scripts/seed-g7-class-students.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { hashPassword } from "../src/lib/password";
import { getSupabaseAdmin } from "../src/infrastructure/supabase/admin-client";

type Row = { studentCode: string; name: string; password: string };

async function main() {
  const path = join(process.cwd(), "data/g7_class_701_credentials.json");
  const rows = JSON.parse(readFileSync(path, "utf8")) as Row[];
  const supabase = getSupabaseAdmin();

  for (const r of rows) {
    const password_hash = hashPassword(r.password);
    const { error } = await supabase.from("students").upsert(
      {
        student_code: r.studentCode,
        name: r.name,
        grade: 7,
        class_name: "701",
        is_active: true,
        password_hash,
      },
      { onConflict: "student_code" },
    );
    if (error) throw error;
    console.log("OK", r.studentCode, r.name);
  }

  console.log("完成：", rows.length, "人。帳密見 data/g7_class_701_credentials.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
