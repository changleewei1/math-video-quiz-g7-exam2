import { LearningTasksDbMissing } from "@/components/admin/LearningTasksDbMissing";
import { getAdminLearningTaskDetailUseCase } from "@/infrastructure/composition";
import {
  getSupabaseErrorMessage,
  looksLikeMissingLearningTasksTable,
} from "@/lib/supabase-user-message";
import { getAdminSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Params = { taskId: string };

export default async function AdminTaskDetailPage({ params }: { params: Promise<Params> }) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const { taskId } = await params;
  const uc = getAdminLearningTaskDetailUseCase();

  let detail: Awaited<ReturnType<typeof uc.execute>>;
  try {
    detail = await uc.execute(taskId);
  } catch (e) {
    const msg = getSupabaseErrorMessage(e);
    if (looksLikeMissingLearningTasksTable(msg)) {
      return <LearningTasksDbMissing technicalDetail={msg} />;
    }
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-medium">無法載入任務</p>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm">{msg}</pre>
        <Link
          href="/admin/tasks"
          className="interactive-nav mt-4 inline-block text-sm font-medium text-teal-800 underline decoration-teal-800/40 underline-offset-2"
        >
          返回任務列表
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <p className="text-slate-600">
        找不到任務。{" "}
        <Link
          href="/admin/tasks"
          className="interactive-nav font-medium text-teal-700 underline-offset-4 hover:underline"
        >
          返回列表
        </Link>
      </p>
    );
  }

  const { task, videos, students } = detail;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/tasks"
          className="interactive-nav text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
        >
          ← 任務列表
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{task.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          班級：{task.className}｜{task.startDate} — {task.endDate}
        </p>
        {task.description && <p className="mt-2 text-slate-700">{task.description}</p>}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">任務影片（依 day_index）</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">day_index</th>
                <th className="px-4 py-2">影片</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={`${v.videoId}-${v.dayIndex}`} className="border-t border-slate-100">
                  <td className="px-4 py-2">{v.dayIndex}</td>
                  <td className="px-4 py-2">{v.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">學生進度</h2>
        <p className="mb-3 text-sm text-slate-600">
          落後：依目前日期應完成之 day_index 內影片尚未觀看完畢，或任務已結束仍未達 100%。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">學號</th>
                <th className="px-4 py-2">姓名</th>
                <th className="px-4 py-2">完成支數</th>
                <th className="px-4 py-2">完成率</th>
                <th className="px-4 py-2">落後</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    此班級尚無學生資料
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.studentId} className="border-t border-slate-100">
                    <td className="px-4 py-2">{s.studentCode}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">
                      {s.completedCount}/{s.totalVideos}
                    </td>
                    <td className="px-4 py-2">{s.completionRate}%</td>
                    <td className="px-4 py-2">
                      {s.isBehind ? (
                        <span className="text-amber-700">是</span>
                      ) : (
                        <span className="text-slate-500">否</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
