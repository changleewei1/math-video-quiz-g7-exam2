"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type VideoOption = { id: string; title: string };

type Row = { videoId: string; dayIndex: number };

export function TaskCreateForm({ videos }: { videos: VideoOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [className, setClassName] = useState("");
  const [rows, setRows] = useState<Row[]>([{ videoId: videos[0]?.id ?? "", dayIndex: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    setRows((r) => [...r, { videoId: videos[0]?.id ?? "", dayIndex: 1 }]);
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, j) => j !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          startDate,
          endDate,
          className,
          videos: rows.filter((x) => x.videoId),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "建立失敗");
        return;
      }
      router.push(`/admin/tasks/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (videos.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        尚無可用影片，請先匯入播放清單。
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">建立任務</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-600">標題</span>
          <input
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">班級（須與學生資料 class_name 一致）</span>
          <input
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="例如：701"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-slate-600">說明（選填）</span>
        <textarea
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-600">開始日</span>
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">結束日</span>
          <input
            required
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">影片與 day_index</span>
          <button
            type="button"
            onClick={addRow}
            className="interactive-nav rounded-md px-2 py-1 text-sm font-medium text-teal-700 underline decoration-teal-700/40 underline-offset-2"
          >
            新增一列
          </button>
        </div>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li key={i} className="flex flex-wrap items-end gap-2">
              <label className="min-w-[200px] flex-1 text-sm">
                <span className="text-slate-600">影片</span>
                <select
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"
                  value={row.videoId}
                  onChange={(e) => updateRow(i, { videoId: e.target.value })}
                >
                  {videos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-28 text-sm">
                <span className="text-slate-600">day_index</span>
                <input
                  required
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-2"
                  value={row.dayIndex}
                  onChange={(e) => updateRow(i, { dayIndex: Number(e.target.value) || 1 })}
                />
              </label>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="interactive-nav mb-1 rounded-md px-2 py-1 text-sm font-medium text-red-600 underline decoration-red-600/40 underline-offset-2"
                >
                  移除
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="interactive-btn rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "建立中…" : "建立任務"}
      </button>
    </form>
  );
}
