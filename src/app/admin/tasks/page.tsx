import { LearningTasksDbMissing } from "@/components/admin/LearningTasksDbMissing";
import { getListLearningTasksUseCase, getRepositories } from "@/infrastructure/composition";
import {
  getSupabaseErrorMessage,
  looksLikeMissingLearningTasksTable,
} from "@/lib/supabase-user-message";
import { getAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { TaskCreateForm } from "./TaskCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const listUc = getListLearningTasksUseCase();
  const { videos: videoRepo } = getRepositories();

  let tasks: Awaited<ReturnType<typeof listUc.execute>> = [];
  let videos: { id: string; title: string }[] = [];
  let loadError: string | null = null;

  try {
    tasks = await listUc.execute();
    const videoEntities = await videoRepo.findAllActive();
    videos = videoEntities.map((v) => ({ id: v.id, title: v.title }));
  } catch (e) {
    loadError = getSupabaseErrorMessage(e);
  }

  if (loadError) {
    const missingTable = looksLikeMissingLearningTasksTable(loadError);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">學習任務</h1>
          <p className="mt-1 text-sm text-slate-600">
            設定期間內學生應觀看的影片；完成觀看（90%）後會自動勾選進度。
          </p>
        </div>
        {missingTable ? (
          <LearningTasksDbMissing technicalDetail={loadError} />
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
            <p className="font-medium">無法載入學習任務</p>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm">
              {loadError}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">學習任務</h1>
        <p className="mt-1 text-sm text-slate-600">
          設定期間內學生應觀看的影片；完成觀看（90%）後會自動勾選進度。
        </p>
      </div>

      <TaskCreateForm videos={videos} />

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-800">任務列表</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2">標題</th>
                <th className="px-4 py-2">班級</th>
                <th className="px-4 py-2">期間</th>
                <th className="px-4 py-2">影片數</th>
                <th className="px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    尚無任務
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">{t.title}</td>
                    <td className="px-4 py-2">{t.className}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {t.startDate} — {t.endDate}
                    </td>
                    <td className="px-4 py-2">{t.videoCount}</td>
                    <td className="px-4 py-2">
                      <a
                        className="interactive-nav font-medium text-teal-700 underline decoration-teal-700/40 underline-offset-2"
                        href={`/admin/tasks/${t.id}`}
                      >
                        進度總覽
                      </a>
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
