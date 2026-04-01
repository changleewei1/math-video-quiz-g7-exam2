import { AdminStudentsTable } from "@/components/admin/AdminStudentsTable";
import { getRepositories } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";
import { getDefaultExamScopeId } from "@/lib/constants";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminStudentsIndexPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const envScope = getDefaultExamScopeId();
  const { examScopes, students } = getRepositories();
  const scopes = await examScopes.findAllActive();
  const examScopeId = envScope ?? scopes[0]?.id ?? null;
  const list = await students.findAll();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">學生列表</h1>
      <p className="mt-1 text-sm text-slate-600">
        可查看個別學習報告或產生家長分享連結（未過期時會沿用同一連結）。
      </p>
      <div className="mt-6">
        <AdminStudentsTable students={list} examScopeId={examScopeId} />
      </div>
    </div>
  );
}
