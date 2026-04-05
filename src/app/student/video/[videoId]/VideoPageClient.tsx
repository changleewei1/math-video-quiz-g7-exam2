"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { StudentBackLink } from "@/components/student/StudentBackLink";
import { YouTubeProgressPlayer } from "@/components/student/YouTubeProgressPlayer";

type Props = {
  unitId: string;
  videoId: string;
  youtubeVideoId: string;
  title: string;
  initialPosition: number;
  quizId: string | null;
  canTakeQuiz: boolean;
};

export function VideoPageClient({
  unitId,
  videoId,
  youtubeVideoId,
  title,
  initialPosition,
  quizId,
  canTakeQuiz,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(canTakeQuiz);

  const onProgressSync = useCallback(
    async (payload: {
      currentTimeSeconds: number;
      durationSeconds: number;
      incrementView: boolean;
    }) => {
      const res = await fetch("/api/video-progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          currentTimeSeconds: payload.currentTimeSeconds,
          durationSeconds: payload.durationSeconds,
          incrementView: payload.incrementView,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.canTakeQuiz) {
        setUnlocked(true);
        setStatus("已達觀看門檻，可進行 AI學習診斷。");
      }
    },
    [videoId],
  );

  return (
    <div className="space-y-6">
      <div>
        <StudentBackLink href={`/student/unit/${unitId}`}>返回單元影片列表</StudentBackLink>
      </div>
      <YouTubeProgressPlayer
        videoId={youtubeVideoId}
        title={title}
        initialSeconds={initialPosition}
        onProgressSync={onProgressSync}
      />
      {status && <p className="text-sm text-red-800">{status}</p>}
      <div className="flex flex-wrap gap-3">
        {quizId && (
          <Link
            href={`/student/quiz/${quizId}`}
            className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-red-700 active:scale-[0.98] ${
              unlocked
                ? "bg-red-600 text-white"
                : "pointer-events-none bg-slate-200 text-slate-500 shadow-none"
            }`}
          >
            前往 AI學習診斷（需觀看 ≥90%）
          </Link>
        )}
        <Link
          href="/student/dashboard"
          className="interactive-btn inline-flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          學習總覽
        </Link>
      </div>
    </div>
  );
}
