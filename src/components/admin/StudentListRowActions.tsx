"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  studentId: string;
  examScopeId: string | null;
  /** 產生連結後顯示在列下方（可選） */
  showUrlInline?: boolean;
};

export function StudentListRowActions({ studentId, examScopeId, showUrlInline = true }: Props) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reportHref = `/admin/students/${studentId}/report${
    examScopeId ? `?examScopeId=${encodeURIComponent(examScopeId)}` : ""
  }`;

  async function createParentLink() {
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/report-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
        const msg =
          data.created === true
            ? "已建立家長連結，並已複製到剪貼簿"
            : "已使用既有家長連結，並已複製到剪貼簿";
        setNotice(msg);
        setTimeout(() => setNotice(null), 5000);
      } catch {
        setNotice("連結已產生，請手動複製下方網址");
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={reportHref}
          className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-600 bg-white px-3 py-2 text-sm font-medium text-teal-800 shadow-sm sm:px-4"
        >
          查看報告
        </Link>
        <button
          type="button"
          onClick={() => void createParentLink()}
          disabled={loading}
          className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white disabled:pointer-events-none disabled:opacity-60 sm:px-4"
        >
          {loading ? "處理中…" : "產生家長連結"}
        </button>
        {shareUrl ? (
          <button
            type="button"
            onClick={() => void copyAgain()}
            className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm sm:px-4"
          >
            複製
          </button>
        ) : null}
      </div>
      {notice ? (
        <p className="text-sm font-medium text-teal-800" role="status">
          {notice}
        </p>
      ) : null}
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {showUrlInline && shareUrl ? (
        <p className="max-w-md break-all rounded-lg bg-slate-50 px-2 py-1.5 font-mono text-[11px] leading-snug text-slate-700 ring-1 ring-slate-200 sm:text-xs">
          {shareUrl}
        </p>
      ) : null}
    </div>
  );
}
