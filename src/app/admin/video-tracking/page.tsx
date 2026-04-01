import { getAdminDashboardService } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDefaultExamScopeId } from "@/lib/constants";
import { getRepositories } from "@/infrastructure/composition";

export const dynamic = "force-dynamic";

export default async function AdminVideoTrackingPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const envScope = getDefaultExamScopeId();
  const { examScopes } = getRepositories();
  const scopes = await examScopes.findAllActive();
  const examScopeId = envScope ?? scopes[0]?.id;
  if (!examScopeId) {
    return <p className="text-slate-600">尚未設定 exam scope。</p>;
  }

  const svc = getAdminDashboardService();
  const students = await svc.getOverview(examScopeId);
  const videos = await svc.getVideoWatchStats(examScopeId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">總覽</h1>
        <p className="mt-1 text-sm text-slate-600">段考 scope：{examScopeId}</p>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">全班學生</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">學號</th>
                <th className="px-4 py-2">姓名</th>
                <th className="px-4 py-2">班級</th>
                <th className="px-4 py-2">影片完成率</th>
                <th className="px-4 py-2">測驗通過率</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.studentId} className="border-t border-slate-100">
                  <td className="px-4 py-2">{s.studentCode}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.className ?? "—"}</td>
                  <td className="px-4 py-2">{s.videoCompletionRate}%</td>
                  <td className="px-4 py-2">{s.quizPassRate}%</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <a
                        className="interactive-nav font-medium text-teal-700 underline decoration-teal-700/40 underline-offset-2"
                        href={`/admin/video-tracking/students/${s.studentId}?examScopeId=${examScopeId}`}
                      >
                        詳情
                      </a>
                      <a
                        className="interactive-nav font-medium text-teal-700 underline decoration-teal-700/40 underline-offset-2"
                        href={`/admin/students/${s.studentId}/report?examScopeId=${examScopeId}`}
                      >
                        學習報告
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">影片觀看</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">影片</th>
                <th className="px-4 py-2">完成人數</th>
                <th className="px-4 py-2">全班完成率</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.videoId} className="border-t border-slate-100">
                  <td className="px-4 py-2">{v.title}</td>
                  <td className="px-4 py-2">
                    {v.completedCount}/{v.totalStudents}
                  </td>
                  <td className="px-4 py-2">{v.completionRate}%</td>
                  <td className="px-4 py-2">
                    <a
                      className="interactive-nav font-medium text-teal-700 underline decoration-teal-700/40 underline-offset-2"
                      href={`/admin/video-tracking/videos/${v.videoId}`}
                    >
                      skill 表現
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
