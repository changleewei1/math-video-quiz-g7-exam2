import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeBackLink } from "@/components/ui/HomeBackLink";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const cards: {
  href: string;
  title: string;
  description: string;
}[] = [
  {
    href: "/admin/students",
    title: "學生名單管理",
    description: "查看學生、進入學習報告與家長分享連結（依貴校流程可再擴充匯入／密碼重設）。",
  },
  {
    href: "/admin/video-tracking",
    title: "學習進度追蹤",
    description: "檢視全班影片完成與測驗通過等整體狀況，並可進入學生／影片明細。",
  },
  {
    href: "/admin/tasks",
    title: "學習任務設定",
    description: "建立學習任務、指派班級與每日影片，並追蹤學生完成度與家長報告連結。",
  },
  {
    href: "/admin/video-tracking/students",
    title: "學習分析總覽",
    description: "由觀課脈絡進入學生列表，開啟個人學習報告（圖表、甘特、摘要）與家長連結。",
  },
  {
    href: "/admin/video-tracking/videos",
    title: "影片測驗題編輯",
    description: "依影片列表進入，修改每部影片的 3 題單選、正解與題目／選項圖片。",
  },
];

export default async function AdminHomePage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-6">
          <div className="justify-self-start">
            <HomeBackLink />
          </div>
          <h1 className="px-1 text-center text-lg font-semibold text-slate-900 sm:text-xl">老師後台</h1>
          <div className="flex justify-end justify-self-end">
            <span className="hidden max-w-[10rem] text-right text-xs leading-snug text-slate-500 sm:block sm:text-sm">
              選擇要管理的項目
            </span>
            <span className="inline-block w-[7.5rem] shrink-0 sm:hidden" aria-hidden />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">歡迎使用</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          請從下方進入常用功能；學習進度與任務設定分屬不同頁面。
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.href + c.title}>
              <Link
                href={c.href}
                className="interactive-btn flex min-h-[132px] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-teal-200/80 hover:shadow-md sm:min-h-[140px] sm:p-6"
              >
                <span className="font-semibold text-slate-900">{c.title}</span>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-xs text-slate-500">
          登入網址：<span className="font-mono">/admin/login</span>
        </p>
      </div>
    </div>
  );
}
