"use client";

import type { StudentReportDto } from "@/domain/services/student-report-service";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COL_TEAL = "#0d9488";
const COL_SLATE = "#94a3b8";
const COL_AMBER = "#d97706";

type Props = {
  report: StudentReportDto;
};

export function ReportCharts({ report }: Props) {
  const taskScope = report.scopedToTask;
  const radarData = report.radar.map((r) => ({
    skill: r.skillName.length > 12 ? `${r.skillName.slice(0, 12)}…` : r.skillName,
    accuracy: r.accuracy,
    full: r.skillName,
  }));

  const pieRaw = [
    { name: "已完成", value: report.pieVideo.completed, fill: COL_TEAL },
    { name: "未完成", value: report.pieVideo.incomplete, fill: COL_SLATE },
  ];
  const pieData =
    pieRaw.some((d) => d.value > 0) ? pieRaw.filter((d) => d.value > 0) : [{ name: "尚無影片", value: 1, fill: "#e2e8f0" }];

  const barData = report.barUnits.map((u) => ({
    name: u.unitTitle.length > 8 ? `${u.unitTitle.slice(0, 8)}…` : u.unitTitle,
    full: u.unitTitle,
    影片完成率: u.videoCompletionRate,
    測驗通過率: u.quizPassRate,
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {taskScope ? "本任務 · 技能雷達（測驗正答率）" : "技能雷達（測驗正答率）"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {taskScope
            ? "僅統計本任務影片所綁定測驗；依各 skill 題目答對比例換算為 0～100。"
            : "依各 skill 題目答對比例換算為 0～100。"}
        </p>
        {radarData.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">尚無測驗作答紀錄。</p>
        ) : (
          <div className="mt-4 h-[min(360px,70vw)] w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="正答率"
                  dataKey="accuracy"
                  stroke={COL_TEAL}
                  fill={COL_TEAL}
                  fillOpacity={0.35}
                />
                <Tooltip formatter={(value) => [`${Number(value ?? 0)}%`, "正答率"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">學習任務 · 影片進度（甘特示意）</h2>
        {report.gantt ? (
          <GanttSection gantt={report.gantt} />
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            無對應班級任務資料，或尚未建立學習任務。
          </p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {taskScope ? "本任務 · 影片完成比例" : "影片完成比例"}
          </h2>
          <div className="mt-4 h-56 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {pieData.map((e, i) => (
                    <Cell key={`c-${i}`} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {taskScope ? "本任務 · 各影片觀看與測驗" : "各單元完成與測驗"}
          </h2>
          {barData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              {taskScope ? "尚無任務影片資料。" : "無段考範圍單元資料。"}
            </p>
          ) : (
            <div className="mt-4 h-64 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={48} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${Number(v ?? 0)}%`, ""]}
                    labelFormatter={(_, p) => {
                      const pl = p as { payload?: { full?: string } } | undefined;
                      return pl?.payload?.full ?? "";
                    }}
                  />
                  <Legend />
                  <Bar dataKey="影片完成率" fill={COL_TEAL} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="測驗通過率" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {taskScope ? "本任務 · 學習建議摘要" : "學習摘要"}
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          {report.summary.paragraphs.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        {report.summary.suggestedVideos.length > 0 ? (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-800">建議複習</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {report.summary.suggestedVideos.map((s) => (
                <li key={s.videoId}>
                  《{s.title}》— {s.reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GanttSection({ gantt }: { gantt: NonNullable<StudentReportDto["gantt"]> }) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-600">
        任務：{gantt.taskTitle}（{gantt.startDate} — {gantt.endDate}）
      </p>
      <ul className="space-y-3">
        {gantt.items.map((item) => (
          <li
            key={item.videoId}
            className="rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-3 sm:px-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  第 {item.dayIndex} 天 · 預定 {item.plannedDate}
                  {item.completedAt
                    ? ` · 完成 ${item.completedAt.slice(0, 10)}`
                    : " · 尚未完成"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "on_time"
                    ? "bg-teal-100 text-teal-800"
                    : item.status === "late"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {item.status === "on_time"
                  ? "準時完成"
                  : item.status === "late"
                    ? "延遲完成"
                    : "未完成"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/90">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width:
                    item.status === "incomplete"
                      ? "28%"
                      : item.status === "late"
                        ? "85%"
                        : "100%",
                  backgroundColor:
                    item.status === "incomplete"
                      ? COL_SLATE
                      : item.status === "late"
                        ? COL_AMBER
                        : COL_TEAL,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
