/** 學生端／結果頁：題幹與選項（支援純圖、純文字或並陳） */

export function QuizQuestionStem({
  index,
  questionText,
  questionImageUrl,
}: {
  index: number;
  questionText: string;
  questionImageUrl: string | null;
}) {
  const hasText = questionText.trim().length > 0;
  return (
    <div className="space-y-2">
      <div className="font-medium text-slate-900">
        <span>{index + 1}. </span>
        {hasText ? <span className="whitespace-pre-wrap">{questionText}</span> : null}
        {!hasText && !questionImageUrl ? (
          <span className="text-slate-400">（題幹僅圖片）</span>
        ) : null}
      </div>
      {questionImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 動態 Supabase 公開 URL
        <img
          src={questionImageUrl}
          alt="題目附圖"
          className="max-h-64 max-w-full rounded-lg border border-slate-200 object-contain"
        />
      ) : null}
    </div>
  );
}

export function QuizChoiceLabel({
  letter,
  text,
  imageUrl,
}: {
  letter: string;
  text: string;
  imageUrl: string | null;
}) {
  const hasText = text.trim().length > 0;
  return (
    <span className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <span className="shrink-0 font-medium text-slate-800">{letter}.</span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`選項 ${letter}`}
          className="max-h-24 max-w-[min(100%,320px)] rounded border border-slate-200 object-contain"
        />
      ) : null}
      {hasText ? <span className="text-slate-800">{text}</span> : null}
      {!hasText && !imageUrl ? <span className="text-slate-400">（未設定）</span> : null}
    </span>
  );
}
