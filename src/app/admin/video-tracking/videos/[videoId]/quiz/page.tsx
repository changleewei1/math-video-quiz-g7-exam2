import { AdminVideoQuizEditor } from "@/components/admin/AdminVideoQuizEditor";
import { getRepositories } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ videoId: string }> };

export default async function AdminVideoQuizEditPage({ params }: Props) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  const { videoId } = await params;
  const { videos } = getRepositories();
  const video = await videos.findById(videoId);
  if (!video) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/video-tracking/videos/${videoId}`}
          className="interactive-nav text-sm font-medium text-teal-700 underline-offset-4 hover:underline"
        >
          ← 返回影片摘要
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">編輯測驗題目</h1>
        <p className="mt-1 text-sm text-slate-600">{video.title}</p>
        <p className="mt-2 text-sm text-slate-600">
          每部影片固定 3 題單選。題幹與選項可只用文字、只用圖片，或兩者並陳；正解仍為 A～D
          之一。圖片將上傳至 Supabase Storage（bucket <code className="rounded bg-slate-100 px-1">quiz-assets</code>
          ）。
        </p>
      </div>
      <AdminVideoQuizEditor videoId={videoId} />
    </div>
  );
}
