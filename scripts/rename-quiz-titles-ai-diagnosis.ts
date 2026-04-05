/**
 * 批次將 quizzes.title 中的「理解檢核」改為「AI學習診斷」（與前端用詞一致）。
 *
 * 使用：
 *   npx tsx --tsconfig tsconfig.json scripts/rename-quiz-titles-ai-diagnosis.ts
 *   npx tsx --tsconfig tsconfig.json scripts/rename-quiz-titles-ai-diagnosis.ts --dry-run
 *
 * 需 .env.local：NEXT_PUBLIC_SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { getSupabaseAdmin } from "../src/infrastructure/supabase/admin-client";

const FROM = "理解檢核";
const TO = "AI學習診斷";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const supabase = getSupabaseAdmin();

  const { data: rows, error: fetchError } = await supabase
    .from("quizzes")
    .select("id, title")
    .like("title", `%${FROM}%`);

  if (fetchError) throw fetchError;
  const list = rows ?? [];
  if (list.length === 0) {
    console.log("沒有需要更新的測驗標題（未包含「理解檢核」）。");
    return;
  }

  console.log(`找到 ${list.length} 筆，${dryRun ? "【僅預覽，未寫入】" : "將更新資料庫"}：\n`);

  for (const row of list as { id: string; title: string }[]) {
    const next = row.title.split(FROM).join(TO);
    console.log("-", row.id.slice(0, 8) + "…");
    console.log("  前:", row.title);
    console.log("  後:", next);
    if (!dryRun) {
      const { error } = await supabase.from("quizzes").update({ title: next }).eq("id", row.id);
      if (error) throw error;
    }
  }

  console.log(
    dryRun
      ? `\n已預覽 ${list.length} 筆。若確認無誤，請不加 --dry-run 再執行一次。`
      : `\n完成：已更新 ${list.length} 筆。`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
