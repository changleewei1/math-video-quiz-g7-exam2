"use client";

import { useCallback, useEffect, useState } from "react";

type SkillOpt = { code: string; name: string };

type QState = {
  id: string;
  questionText: string;
  questionImageUrl: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  choiceAImageUrl: string;
  choiceBImageUrl: string;
  choiceCImageUrl: string;
  choiceDImageUrl: string;
  correctAnswer: string;
  skillCode: string;
  explanation: string;
  sortOrder: number;
};

type Props = {
  videoId: string;
};

function rowFromApi(q: Record<string, unknown>): QState {
  return {
    id: String(q.id),
    questionText: String(q.questionText ?? ""),
    questionImageUrl: q.questionImageUrl ? String(q.questionImageUrl) : "",
    choiceA: String(q.choiceA ?? ""),
    choiceB: String(q.choiceB ?? ""),
    choiceC: String(q.choiceC ?? ""),
    choiceD: String(q.choiceD ?? ""),
    choiceAImageUrl: q.choiceAImageUrl ? String(q.choiceAImageUrl) : "",
    choiceBImageUrl: q.choiceBImageUrl ? String(q.choiceBImageUrl) : "",
    choiceCImageUrl: q.choiceCImageUrl ? String(q.choiceCImageUrl) : "",
    choiceDImageUrl: q.choiceDImageUrl ? String(q.choiceDImageUrl) : "",
    correctAnswer: String(q.correctAnswer ?? "A"),
    skillCode: String(q.skillCode ?? ""),
    explanation: q.explanation != null ? String(q.explanation) : "",
    sortOrder: Number(q.sortOrder ?? 0),
  };
}

export function AdminVideoQuizEditor({ videoId }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QState[]>([]);
  const [skillTags, setSkillTags] = useState<SkillOpt[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/admin/videos/${videoId}/quiz`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404 && data.error === "NO_QUIZ") {
      setErr("no_quiz");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setErr(typeof data.detail === "string" ? data.detail : "無法載入測驗");
      setLoading(false);
      return;
    }
    setQuizId(String(data.quiz?.id ?? ""));
    setQuestions((data.questions ?? []).map((q: Record<string, unknown>) => rowFromApi(q)));
    setSkillTags(data.skillTags ?? []);
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadAsset(
    q: QState,
    field: "question" | "choice_a" | "choice_b" | "choice_c" | "choice_d",
    file: File,
  ) {
    if (!quizId) return;
    const key = `${q.id}-${field}`;
    setUploading(key);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("quizId", quizId);
      fd.append("questionId", q.id);
      fd.append("field", field);
      const res = await fetch("/api/admin/quiz-assets/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.detail === "string" ? data.detail : "上傳失敗");
        return;
      }
      const url = typeof data.url === "string" ? data.url : "";
      setQuestions((prev) =>
        prev.map((row) => {
          if (row.id !== q.id) return row;
          if (field === "question") return { ...row, questionImageUrl: url };
          if (field === "choice_a") return { ...row, choiceAImageUrl: url };
          if (field === "choice_b") return { ...row, choiceBImageUrl: url };
          if (field === "choice_c") return { ...row, choiceCImageUrl: url };
          return { ...row, choiceDImageUrl: url };
        }),
      );
    } finally {
      setUploading(null);
    }
  }

  async function saveQuestion(q: QState) {
    if (!quizId) return;
    setSavingId(q.id);
    setErr(null);
    const body = {
      questionText: q.questionText,
      questionImageUrl: q.questionImageUrl.trim() ? q.questionImageUrl.trim() : null,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
      choiceAImageUrl: q.choiceAImageUrl.trim() ? q.choiceAImageUrl.trim() : null,
      choiceBImageUrl: q.choiceBImageUrl.trim() ? q.choiceBImageUrl.trim() : null,
      choiceCImageUrl: q.choiceCImageUrl.trim() ? q.choiceCImageUrl.trim() : null,
      choiceDImageUrl: q.choiceDImageUrl.trim() ? q.choiceDImageUrl.trim() : null,
      correctAnswer: q.correctAnswer as "A" | "B" | "C" | "D",
      skillCode: q.skillCode,
      explanation: q.explanation.trim() ? q.explanation : null,
    };
    const res = await fetch(`/api/admin/quizzes/${quizId}/questions/${q.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSavingId(null);
    if (!res.ok) {
      setErr(typeof data.detail === "string" ? data.detail : "儲存失敗");
      return;
    }
  }

  function updateQuestion(id: string, patch: Partial<QState>) {
    setQuestions((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  if (loading) {
    return <p className="text-slate-600">載入測驗…</p>;
  }
  if (err === "no_quiz") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        此影片尚無測驗資料。請先透過匯入播放清單或其他方式建立該影片的 AI 學習診斷測驗後，再編輯題目。
      </div>
    );
  }
  if (err && questions.length === 0) {
    return <p className="text-red-700">{err}</p>;
  }

  return (
    <div className="space-y-8">
      {err && questions.length > 0 ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
      ) : null}

      {questions.map((q, idx) => (
        <section
          key={q.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900">第 {idx + 1} 題</h2>
          <p className="mt-1 text-xs text-slate-500">sort_order: {q.sortOrder}</p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">題幹文字（可留空若僅用圖片）</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                value={q.questionText}
                onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">題幹圖片</span>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                {q.questionImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.questionImageUrl}
                    alt=""
                    className="max-h-40 rounded-lg border border-slate-200 object-contain"
                  />
                ) : null}
                <label className="inline-flex cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">
                  {uploading === `${q.id}-question` ? "上傳中…" : "上傳圖片"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void uploadAsset(q, "question", f);
                    }}
                  />
                </label>
                {q.questionImageUrl ? (
                  <button
                    type="button"
                    className="text-sm text-red-700 underline"
                    onClick={() => updateQuestion(q.id, { questionImageUrl: "" })}
                  >
                    移除題幹圖
                  </button>
                ) : null}
              </div>
            </div>

            {(["A", "B", "C", "D"] as const).map((letter) => {
              const field = `choice${letter}` as keyof QState;
              const imgField = `choice${letter}ImageUrl` as keyof QState;
              const choiceKey = `choice_${letter.toLowerCase()}` as
                | "choice_a"
                | "choice_b"
                | "choice_c"
                | "choice_d";
              return (
                <div key={letter} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                  <p className="text-sm font-medium text-slate-800">選項 {letter}</p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="文字（可與圖片並存或擇一）"
                    value={String(q[field])}
                    onChange={(e) => updateQuestion(q.id, { [field]: e.target.value } as Partial<QState>)}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {String(q[imgField]) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(q[imgField])}
                        alt=""
                        className="max-h-20 rounded border border-slate-200 object-contain"
                      />
                    ) : null}
                    <label className="inline-flex cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium">
                      {uploading === `${q.id}-${choiceKey}` ? "上傳中…" : "上傳選項圖"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadAsset(q, choiceKey, f);
                        }}
                      />
                    </label>
                    {String(q[imgField]) ? (
                      <button
                        type="button"
                        className="text-xs text-red-700 underline"
                        onClick={() => updateQuestion(q.id, { [imgField]: "" } as Partial<QState>)}
                      >
                        移除圖
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">正解</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                >
                  {(["A", "B", "C", "D"] as const).map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">技能代碼</label>
                {skillTags.length === 0 ? (
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                    value={q.skillCode}
                    onChange={(e) => updateQuestion(q.id, { skillCode: e.target.value })}
                    placeholder="例如 R01"
                  />
                ) : (
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={q.skillCode}
                    onChange={(e) => updateQuestion(q.id, { skillCode: e.target.value })}
                  >
                    {skillTags.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">解析（選填）</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={2}
                value={q.explanation}
                onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
              />
            </div>

            <button
              type="button"
              disabled={savingId === q.id}
              onClick={() => void saveQuestion(q)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {savingId === q.id ? "儲存中…" : "儲存本題"}
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
