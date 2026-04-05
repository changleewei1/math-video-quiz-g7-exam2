"use client";

import { useRouter } from "next/navigation";

type Props = {
  /** 無法返回上一頁時（例如新分頁直接開結果）的備援網址 */
  fallbackHref: string;
};

export function QuizResultBackButton({ fallbackHref }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        try {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
        } catch {
          /* fall through */
        }
        router.push(fallbackHref);
      }}
      className="interactive-btn mt-8 inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
    >
      回上一頁
    </button>
  );
}
