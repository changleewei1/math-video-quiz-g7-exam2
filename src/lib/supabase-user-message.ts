/**
 * 將 Supabase / PostgREST 錯誤轉成可讀字串（供除錯與使用者提示）
 */
export function getSupabaseErrorMessage(error: unknown): string {
  if (error == null) return "未知錯誤";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const m = (error as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/** 常見：尚未執行 learning_tasks migration */
export function looksLikeMissingLearningTasksTable(error: unknown): boolean {
  const msg = getSupabaseErrorMessage(error).toLowerCase();
  return (
    msg.includes("learning_tasks") ||
    msg.includes("task_videos") ||
    msg.includes("student_task_progress") ||
    msg.includes("schema cache") ||
    msg.includes("could not find the table") ||
    msg.includes("does not exist")
  );
}
