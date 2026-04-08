import { compareVideoTitleNumeric } from "@/lib/video-title-sort";
import { getSupabaseAdmin } from "@/infrastructure/supabase/admin-client";

export type StudentOverviewRow = {
  studentId: string;
  studentCode: string;
  name: string;
  className: string | null;
  videoCompletionRate: number;
  quizPassRate: number;
};

export type VideoWatchStats = {
  videoId: string;
  title: string;
  totalStudents: number;
  completedCount: number;
  completionRate: number;
};

export type SkillPerformanceRow = {
  skillCode: string;
  correctRate: number;
  attempts: number;
};

/**
 * 老師儀表板：全班完成／通過概況、單支影片統計、skill 答題表現。
 */
export class AdminDashboardService {
  async getOverview(examScopeId: string): Promise<StudentOverviewRow[]> {
    const supabase = getSupabaseAdmin();
    const { data: students } = await supabase
      .from("students")
      .select("id, student_code, name, class_name")
      .eq("is_active", true)
      .order("student_code");

    const { data: units } = await supabase
      .from("scope_units")
      .select("id")
      .eq("exam_scope_id", examScopeId);
    const unitIds = (units ?? []).map((u: { id: string }) => u.id);
    if (unitIds.length === 0) return [];

    const { data: videos } = await supabase.from("videos").select("id").in("unit_id", unitIds);
    const videoIds = (videos ?? []).map((v: { id: string }) => v.id);
    const totalVideos = videoIds.length;

    const { data: quizzes } = await supabase.from("quizzes").select("id").in("video_id", videoIds);
    const quizIds = (quizzes ?? []).map((q: { id: string }) => q.id);

    const out: StudentOverviewRow[] = [];
    for (const s of students ?? []) {
      const st = s as {
        id: string;
        student_code: string;
        name: string;
        class_name: string | null;
      };

      let videoCompletionRate = 0;
      if (totalVideos > 0) {
        const { data: vp } = await supabase
          .from("student_video_progress")
          .select("is_completed")
          .eq("student_id", st.id)
          .in("video_id", videoIds);
        const done = (vp ?? []).filter((x: { is_completed: boolean }) => x.is_completed).length;
        videoCompletionRate = Math.round((done / totalVideos) * 1000) / 10;
      }

      let quizPassRate = 0;
      if (quizIds.length > 0) {
        const { data: att } = await supabase
          .from("student_quiz_attempts")
          .select("is_passed")
          .eq("student_id", st.id)
          .in("quiz_id", quizIds)
          .not("submitted_at", "is", null);
        const list = att ?? [];
        if (list.length > 0) {
          const passed = list.filter((x: { is_passed: boolean }) => x.is_passed).length;
          quizPassRate = Math.round((passed / list.length) * 1000) / 10;
        }
      }

      out.push({
        studentId: st.id,
        studentCode: st.student_code,
        name: st.name,
        className: st.class_name,
        videoCompletionRate,
        quizPassRate,
      });
    }
    return out;
  }

  async getStudentDetail(studentId: string, examScopeId: string) {
    const supabase = getSupabaseAdmin();
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .maybeSingle();
    if (!student) return null;

    const { data: units } = await supabase
      .from("scope_units")
      .select("*")
      .eq("exam_scope_id", examScopeId)
      .order("sort_order");

    const unitIds = (units ?? []).map((u: { id: string }) => u.id);
    const { data: videos } = await supabase
      .from("videos")
      .select("*")
      .in("unit_id", unitIds)
      .order("sort_order");

    const videoIds = (videos ?? []).map((v: { id: string }) => v.id);
    const { data: progress } = await supabase
      .from("student_video_progress")
      .select("*")
      .eq("student_id", studentId)
      .in("video_id", videoIds);

    const { data: quizzes } = await supabase.from("quizzes").select("*").in("video_id", videoIds);
    const quizIds = (quizzes ?? []).map((q: { id: string }) => q.id);
    const { data: attempts } = await supabase
      .from("student_quiz_attempts")
      .select("*")
      .eq("student_id", studentId)
      .in("quiz_id", quizIds);

    return {
      student,
      units,
      videos,
      progress: progress ?? [],
      quizzes: quizzes ?? [],
      attempts: attempts ?? [],
    };
  }

  async getVideoWatchStats(examScopeId: string): Promise<VideoWatchStats[]> {
    const supabase = getSupabaseAdmin();
    const { data: units } = await supabase
      .from("scope_units")
      .select("id")
      .eq("exam_scope_id", examScopeId);
    const unitIds = (units ?? []).map((u: { id: string }) => u.id);
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title")
      .in("unit_id", unitIds)
      .order("sort_order");

    const { count: totalStudents } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const ts = totalStudents ?? 0;
    const out: VideoWatchStats[] = [];

    for (const v of videos ?? []) {
      const vid = v as { id: string; title: string };
      const { data: vp } = await supabase
        .from("student_video_progress")
        .select("is_completed")
        .eq("video_id", vid.id);
      const completed = (vp ?? []).filter((x: { is_completed: boolean }) => x.is_completed)
        .length;
      const completionRate = ts === 0 ? 0 : Math.round((completed / ts) * 1000) / 10;
      out.push({
        videoId: vid.id,
        title: vid.title,
        totalStudents: ts,
        completedCount: completed,
        completionRate,
      });
    }
    out.sort((a, b) => compareVideoTitleNumeric(a.title, b.title));
    return out;
  }

  async getVideoSkillPerformance(videoId: string): Promise<SkillPerformanceRow[]> {
    const supabase = getSupabaseAdmin();
    const { data: quiz } = await supabase.from("quizzes").select("id").eq("video_id", videoId).maybeSingle();
    if (!quiz) return [];
    const quizId = (quiz as { id: string }).id;

    const { data: attempts } = await supabase.from("student_quiz_attempts").select("id").eq("quiz_id", quizId);
    const attemptIds = (attempts ?? []).map((a: { id: string }) => a.id);
    if (attemptIds.length === 0) return [];

    const { data: answers } = await supabase
      .from("student_quiz_answers")
      .select("is_correct, quiz_questions(skill_code)")
      .in("attempt_id", attemptIds);

    const map = new Map<string, { ok: number; n: number }>();
    for (const row of answers ?? []) {
      const r = row as unknown as {
        is_correct: boolean;
        quiz_questions: { skill_code: string } | null;
      };
      const code = r.quiz_questions?.skill_code ?? "—";
      const cur = map.get(code) ?? { ok: 0, n: 0 };
      cur.n += 1;
      if (r.is_correct) cur.ok += 1;
      map.set(code, cur);
    }

    return [...map.entries()].map(([skillCode, v]) => ({
      skillCode,
      attempts: v.n,
      correctRate: v.n === 0 ? 0 : Math.round((v.ok / v.n) * 1000) / 10,
    }));
  }
}
