import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminDashboardService, getRepositories } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ videoId: string }> };

export default async function AdminVideoDetailPage({ params }: Props) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const { videoId } = await params;
  const { videos } = getRepositories();
  const video = await videos.findById(videoId);
  const svc = getAdminDashboardService();
  const skills = await svc.getVideoSkillPerformance(videoId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{video?.title ?? videoId}</h1>
        <Link
          href={`/admin/video-tracking/videos/${videoId}/quiz`}
          className="interactive-nav shrink-0 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
        >
          編輯 AI 測驗題目
        </Link>
      </div>
      <section>
        <h2 className="font-medium text-slate-800">Skill 答題表現</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2">skill_code</th>
                <th className="px-4 py-2">作答次數</th>
                <th className="px-4 py-2">答對率</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.skillCode} className="border-t border-slate-100">
                  <td className="px-4 py-2">{s.skillCode}</td>
                  <td className="px-4 py-2">{s.attempts}</td>
                  <td className="px-4 py-2">{s.correctRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
