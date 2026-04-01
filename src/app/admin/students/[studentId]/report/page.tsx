import { ReportCharts } from "@/components/report/ReportCharts";
import { ReportFilters } from "@/components/report/ReportFilters";
import { ReportSharePanel } from "@/components/report/ReportSharePanel";
import { getAdminStudentReportUseCase } from "@/infrastructure/composition";
import { getRepositories } from "@/infrastructure/composition";
import { getDefaultExamScopeId } from "@/lib/constants";
import { getAdminSession } from "@/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ examScopeId?: string; taskId?: string }>;
};

export default async function AdminStudentReportPage({ params, searchParams }: Props) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const { studentId } = await params;
  const sp = await searchParams;

  const { students, examScopes, learningTasks } = getRepositories();
  const student = await students.findById(studentId);
  if (!student) notFound();

  const scopes = await examScopes.findAllActive();
  const envScope = getDefaultExamScopeId();
  const examScopeId =
    sp.examScopeId ?? envScope ?? scopes[0]?.id ?? null;

  const allTasks = await learningTasks.findAll();
  const tasksForClass = allTasks.filter((t) => t.class_name === student.className);

  const uc = getAdminStudentReportUseCase();
  const report = await uc.execute({
    studentId,
    examScopeId,
    taskId: sp.taskId ?? undefined,
  });
  if (!report) notFound();

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/video-tracking"
              className="interactive-nav text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
            >
              ← 返回觀課追蹤
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              學生學習報告
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {student.name}{" "}
              <span className="font-mono text-slate-500">（{student.studentCode}）</span>
              {student.className ? ` · ${student.className} 班` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-lg bg-slate-200/80" />}>
          <ReportFilters
            studentId={studentId}
            examScopes={scopes.map((s) => ({ id: s.id, title: s.title }))}
            tasks={tasksForClass.map((t) => ({
              id: t.id,
              title: t.title,
              startDate: t.start_date,
            }))}
            currentExamScopeId={examScopeId}
            currentTaskId={sp.taskId ?? null}
          />
        </Suspense>

        <ReportSharePanel studentId={studentId} taskId={sp.taskId ?? null} />

        {report.examScope ? (
          <p className="text-sm text-slate-600">
            圖表範圍：<span className="font-medium text-slate-800">{report.examScope.title}</span>
          </p>
        ) : (
          <p className="text-sm text-amber-800">尚未設定段考 scope，部分圖表可能為空。</p>
        )}

        <ReportCharts report={report} />
      </div>
    </div>
  );
}
