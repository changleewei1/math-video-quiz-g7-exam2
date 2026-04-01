import { redirect } from "next/navigation";
import { getAdminDashboardService } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ examScopeId?: string }>;
};

export default async function AdminStudentDetailPage({ params, searchParams }: Props) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const { studentId } = await params;
  const sp = await searchParams;
  const examScopeId = sp.examScopeId;
  if (!examScopeId) {
    return <p className="text-amber-800">請由總覽頁進入（需要 examScopeId）。</p>;
  }

  const svc = getAdminDashboardService();
  const detail = await svc.getStudentDetail(studentId, examScopeId);
  if (!detail) return <p>找不到學生</p>;

  const videoMap = new Map(
    (detail.videos as { id: string; title: string }[]).map((v) => [v.id, v.title]),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {(detail.student as { name: string }).name}
      </h1>
      <section>
        <h2 className="font-medium text-slate-800">影片進度</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(detail.progress as { video_id: string; completion_rate: number; is_completed: boolean }[]).map(
            (p) => (
              <li key={p.video_id}>
                {videoMap.get(p.video_id) ?? p.video_id} — 完成率{" "}
                {Number(p.completion_rate).toFixed(0)}%
                {p.is_completed ? "（已完成）" : ""}
              </li>
            ),
          )}
        </ul>
      </section>
      <section>
        <h2 className="font-medium text-slate-800">測驗紀錄</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(detail.attempts as { quiz_id: string; score: number; is_passed: boolean }[]).map(
            (a, i) => (
              <li key={i}>
                測驗 {a.quiz_id.slice(0, 8)}… — 得分 {a.score} —{" "}
                {a.is_passed ? "通過" : "未通過"}
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
