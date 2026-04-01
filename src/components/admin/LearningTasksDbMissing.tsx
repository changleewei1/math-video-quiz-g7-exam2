import Link from "next/link";

type Props = {
  /** 供除錯用，可摺疊顯示 */
  technicalDetail?: string;
};

/**
 * 資料庫尚未建立學習任務相關資料表時的說明（避免整頁 Runtime Error）
 */
export function LearningTasksDbMissing({ technicalDetail }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h2 className="text-lg font-semibold">需先建立資料表</h2>
      <p className="mt-2 text-sm leading-relaxed">
        目前 Supabase 尚無「學習任務」相關資料表，請到{" "}
        <strong>Supabase 專案 → SQL Editor</strong>，將專案內檔案{" "}
        <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">
          supabase/migrations/20250401000000_learning_tasks.sql
        </code>{" "}
        全文貼上並執行（若已執行過仍錯誤，請重新整理或檢查是否連到正確專案）。
      </p>
      <p className="mt-3 text-sm">
        亦需已套用{" "}
        <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">
          20250331000000_initial.sql
        </code>{" "}
        中的 <code className="text-xs">set_updated_at</code> 函式（同一 initial migration）。
      </p>
      <p className="mt-4 text-sm">
        <Link
          href="/admin"
          className="interactive-nav font-medium text-teal-800 underline decoration-teal-800/40 underline-offset-2"
        >
          返回後台首頁
        </Link>
      </p>
      {technicalDetail ? (
        <details className="mt-4 text-xs text-amber-900/80">
          <summary className="cursor-pointer select-none">技術細節</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-white/60 p-2">
            {technicalDetail}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
