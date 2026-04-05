import { TaskParentReportLinkButton } from "@/components/admin/TaskParentReportLinkButton";
import { LearningTasksDbMissing } from "@/components/admin/LearningTasksDbMissing";
import { ReportCharts } from "@/components/report/ReportCharts";
import { getDefaultExamScopeId } from "@/lib/constants";
import {
  getAdminStudentReportUseCase,
  getAdminTaskStudentDetailUseCase,
  getRepositories,
} from "@/infrastructure/composition";
import {
  getSupabaseErrorMessage,
  looksLikeMissingLearningTasksTable,
} from "@/lib/supabase-user-message";
import { getAdminSession } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ taskId: string; studentId: string }> };

export default async function AdminTaskStudentDetailPage({ params }: Props) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const { taskId, studentId } = await params;
  const uc = getAdminTaskStudentDetailUseCase();
  const { examScopes } = getRepositories();
  const scopes = await examScopes.findAllActive();
  const envScope = getDefaultExamScopeId();
  const examScopeId = envScope ?? scopes[0]?.id ?? null;
  const reportUc = getAdminStudentReportUseCase();

  let detail: Awaited<ReturnType<typeof uc.execute>>;
  try {
    detail = await uc.execute(taskId, studentId);
  } catch (e) {
    const msg = getSupabaseErrorMessage(e);
    if (looksLikeMissingLearningTasksTable(msg)) {
      return <LearningTasksDbMissing technicalDetail={msg} />;
    }
    throw e;
  }

  if (!detail) notFound();

  const { task, student, videos } = detail;

  const report = await reportUc.execute({
    studentId,
    examScopeId,
    taskId,
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/admin/tasks/${taskId}`}
          className="interactive-nav text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
        >
          ← 返回任務進度
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          學生任務詳情
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          任務：{task.title}（{task.startDate} — {task.endDate}，{task.className} 班）
        </p>
        <p className="mt-2 text-base font-medium text-slate-900">
          {student.name}{" "}
          <span className="font-mono text-sm font-normal text-slate-500">({student.studentCode})</span>
        </p>
      </div>

      {report ? (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">家長學習報告連結</h2>
            <p className="mt-1 text-sm text-slate-600">
              產生連結並複製給家長；家長開啟後可見與本頁相同任務脈絡下的圖表與摘要（無需登入）。
            </p>
            <div className="mt-4">
              <TaskParentReportLinkButton studentId={studentId} taskId={taskId} />
            </div>
          </div>

          {report.scopedToTask ? (
            <p className="text-sm text-slate-600">
              以下雷達圖、統計圖與學習建議僅限本任務「{task.title}」之影片與測驗。
            </p>
          ) : report.examScope ? (
            <p className="text-sm text-slate-600">
              圖表段考範圍：
              <span className="font-medium text-slate-800">{report.examScope.title}</span>
            </p>
          ) : (
            <p className="text-sm text-amber-800">
              尚未設定段考 scope 或任務內尚無影片，部分圖表可能為空。
            </p>
          )}

          <ReportCharts report={report} />
        </section>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-lg font-medium text-slate-800">影片與 AI 學習診斷（逐題）</h2>
        <p className="text-sm text-slate-600">
          依任務天數與影片標題編號排序；測驗為該影片綁定之最新一次已提交紀錄。
        </p>

        <ul className="space-y-6">
          {videos.map((row) => (
            <li
              key={row.videoId}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded bg-slate-200/90 px-2 py-0.5 text-xs font-medium text-slate-700">
                      第 {row.dayIndex} 天
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">
                      {row.title}
                    </h3>
                  </div>
                  <div className="text-right text-sm">
                    {row.watchCompleted ? (
                      <span className="text-teal-700">
                        已觀看完畢
                        {row.watchCompletedAt ? (
                          <span className="block text-xs font-normal text-slate-500">
                            {row.watchCompletedAt.slice(0, 19).replace("T", " ")}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-slate-500">尚未完成觀看</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-5">
                {!row.quiz ? (
                  <p className="text-sm text-slate-500">此影片未綁定測驗。</p>
                ) : !row.quiz.submitted ? (
                  <p className="text-sm text-amber-800">
                    AI 學習診斷：尚未提交（通過門檻 {row.quiz.passScore}／{row.quiz.questionCount}{" "}
                    題）
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-800">
                      AI 學習診斷：得分{" "}
                      <span className="text-teal-700">
                        {row.quiz.score ?? "—"} / {row.quiz.questionCount}
                      </span>
                      {" · "}
                      {row.quiz.isPassed ? (
                        <span className="text-teal-700">通過</span>
                      ) : (
                        <span className="text-amber-700">未通過</span>
                      )}
                      {row.quiz.submittedAt ? (
                        <span className="ml-2 font-normal text-slate-500">
                          （
                          {row.quiz.submittedAt.slice(0, 19).replace("T", " ")}
                          ）
                        </span>
                      ) : null}
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                          <tr>
                            <th className="px-3 py-2">題目</th>
                            <th className="px-3 py-2">技能</th>
                            <th className="px-3 py-2">學生答案</th>
                            <th className="px-3 py-2">正解</th>
                            <th className="px-3 py-2">結果</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.quiz.answers.map((a, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              <td className="max-w-xs px-3 py-2 text-slate-800">{a.questionText}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">
                                {a.skillCode}
                              </td>
                              <td className="px-3 py-2 font-mono text-slate-800">{a.selectedAnswer}</td>
                              <td className="px-3 py-2 font-mono text-slate-600">{a.correctAnswer}</td>
                              <td className="px-3 py-2">
                                {a.isCorrect ? (
                                  <span className="text-teal-700">正確</span>
                                ) : (
                                  <span className="text-red-600">錯誤</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
