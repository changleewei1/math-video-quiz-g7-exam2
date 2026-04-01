"use client";

import { useState } from "react";

type Props = {
  studentId: string;
  /** 產生連結時綁定任務甘特圖脈絡（可為空） */
  taskId: string | null;
};

export function ReportSharePanel({ studentId, taskId }: Props) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function generateLink() {
    setLoading(true);
    setErr(null);
    setCopied(false);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/report-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: taskId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data.detail === "string"
            ? data.detail
            : data.error === "DB_MISSING_TABLE"
              ? "請先執行資料庫 migration（student_report_tokens）"
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
            ? "已建立家長連結，並已複製到剪貼簿"
            : "已使用既有家長連結，並已複製到剪貼簿",
        );
        setTimeout(() => setNotice(null), 5000);
      } catch {
        setNotice("連結已產生，請使用「複製連結」");
        setTimeout(() => setNotice(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr("無法複製，請手動選取網址");
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">家長分享連結</h2>
      <p className="mt-1 text-xs text-slate-600">
        產生連結後可傳給家長；家長無需登入即可檢視圖表摘要。
        {taskId ? " 目前連結會帶入下方選定任務的甘特進度。" : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void generateLink()}
          disabled={loading}
          className="interactive-btn rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "產生中…" : "產生家長連結"}
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          disabled={!shareUrl}
          className="interactive-btn rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm disabled:opacity-50"
        >
          {copied ? "已複製" : "複製連結"}
        </button>
      </div>
      {notice ? (
        <p className="mt-3 text-sm font-medium text-teal-800" role="status">
          {notice}
        </p>
      ) : null}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {shareUrl ? (
        <p className="mt-3 break-all rounded-lg bg-white/90 px-3 py-2 font-mono text-xs text-slate-700 ring-1 ring-slate-200">
          {shareUrl}
        </p>
      ) : null}
    </div>
  );
}
