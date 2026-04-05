"use client";

import { useState } from "react";

type Props = {
  studentId: string;
  /** 綁定此學習任務；家長頁會以任務甘特與同班級脈絡顯示報告 */
  taskId: string;
};

/**
 * 學習任務詳情頁：為單一學生產生／複製「此任務」家長報告連結。
 */
export function TaskParentReportLinkButton({ studentId, taskId }: Props) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/report-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data.detail === "string"
            ? data.detail
            : data.error === "DB_MISSING_TABLE"
              ? "請先執行 migration：student_report_tokens"
              : "產生失敗",
        );
        return;
      }
      const url = typeof data.shareUrl === "string" ? data.shareUrl : "";
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setNotice(
          data.created === true
            ? "已建立家長報告連結，並已複製到剪貼簿"
            : "已沿用既有家長報告連結，並已複製到剪貼簿",
        );
        setTimeout(() => setNotice(null), 5000);
      } catch {
        setNotice("連結已產生，請複製下方網址");
        setTimeout(() => setNotice(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyAgain() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice("已複製到剪貼簿");
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setErr("無法複製");
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void onClick()}
          disabled={loading}
          className="interactive-btn inline-flex min-h-9 items-center justify-center rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-60 sm:min-h-10 sm:px-3 sm:text-sm"
        >
          {loading ? "處理中…" : "家長報告連結"}
        </button>
        {shareUrl ? (
          <button
            type="button"
            onClick={() => void copyAgain()}
            className="interactive-btn inline-flex min-h-9 items-center rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 sm:text-sm"
          >
            再複製
          </button>
        ) : null}
      </div>
      {notice ? (
        <p className="max-w-[220px] text-xs font-medium text-teal-800" role="status">
          {notice}
        </p>
      ) : null}
      {err ? <p className="max-w-[220px] text-xs text-red-600">{err}</p> : null}
      {shareUrl ? (
        <p className="max-w-[min(280px,55vw)] break-all rounded bg-slate-50 px-1.5 py-1 font-mono text-[10px] leading-snug text-slate-700 ring-1 ring-slate-200 sm:text-xs">
          {shareUrl}
        </p>
      ) : null}
    </div>
  );
}
