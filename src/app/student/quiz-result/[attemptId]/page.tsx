import { QuizQuestionStem } from "@/components/quiz/QuizQuestionDisplay";
import { redirect, notFound } from "next/navigation";
import { QuizResultBackButton } from "@/components/student/QuizResultBackButton";
import { StudentBackLink } from "@/components/student/StudentBackLink";
import { getQuizAttemptDetailUseCase } from "@/infrastructure/composition";
import { getStudentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ attemptId: string }> };

export default async function QuizResultPage({ params }: Props) {
  const session = await getStudentSession();
  if (!session) redirect("/login");
  const { attemptId } = await params;
  const uc = getQuizAttemptDetailUseCase();
  const data = await uc.execute(attemptId, session.studentId);
  if (!data) notFound();

  const { attempt, quiz, video, questions } = data;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        {video ? (
          <StudentBackLink href={`/student/video/${video.id}`}>返回影片</StudentBackLink>
        ) : (
          <StudentBackLink href="/student/dashboard">返回學習總覽</StudentBackLink>
        )}
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">測驗結果</h1>
      <p className="mt-2 text-slate-600">
        影片：{video?.title ?? "—"}
      </p>
      <p className="mt-4 text-lg">
        得分：<span className="font-semibold text-teal-700">{attempt.score}</span> /{" "}
        {questions.length}（通過門檻 {quiz.passScore} 題）
      </p>
      <p className="mt-2 text-lg font-medium">
        {attempt.isPassed ? (
          <span className="text-teal-700">通過</span>
        ) : (
          <span className="text-amber-700">未通過</span>
        )}
      </p>
      <ul className="mt-8 space-y-4">
        {questions.map((q, idx) => {
          const ans = data.answers.get(q.id);
          const ok = ans?.is_correct ?? false;
          return (
            <li
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
            >
              <QuizQuestionStem
                index={idx}
                questionText={q.questionText}
                questionImageUrl={q.questionImageUrl}
              />
              <p className="mt-1 text-xs text-slate-500">技能：{q.skillCode}</p>
              <p className="mt-2">
                你的答案：{ans?.selected_answer ?? "—"}{" "}
                {ok ? (
                  <span className="text-teal-600">（正確）</span>
                ) : (
                  <span className="text-red-600">（錯誤，正解 {q.correctAnswer}）</span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
      <QuizResultBackButton
        fallbackHref={video ? `/student/video/${video.id}` : "/student/dashboard"}
      />
    </main>
  );
}
