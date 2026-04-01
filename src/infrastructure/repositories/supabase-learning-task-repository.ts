import type {
  LearningTaskInsert,
  LearningTaskRepository,
  TaskVideoInsert,
} from "@/domain/repositories/learning-task-repository";
import { getSupabaseAdmin } from "@/infrastructure/supabase/admin-client";
import type { LearningTaskRow, TaskVideoRow } from "@/types/database";

export class SupabaseLearningTaskRepository implements LearningTaskRepository {
  async insertTask(row: LearningTaskInsert) {
    const { data, error } = await getSupabaseAdmin()
      .from("learning_tasks")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;
    return data as { id: string };
  }

  async insertTaskVideos(rows: TaskVideoInsert[]) {
    if (rows.length === 0) return;
    const { error } = await getSupabaseAdmin().from("task_videos").insert(rows);
    if (error) throw error;
  }

  async findAll() {
    const { data, error } = await getSupabaseAdmin()
      .from("learning_tasks")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data as LearningTaskRow[];
  }

  async findById(id: string) {
    const { data, error } = await getSupabaseAdmin()
      .from("learning_tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as LearningTaskRow | null) ?? null;
  }

  async findTaskVideos(taskId: string) {
    const { data, error } = await getSupabaseAdmin()
      .from("task_videos")
      .select("*")
      .eq("task_id", taskId)
      .order("day_index", { ascending: true })
      .order("video_id", { ascending: true });
    if (error) throw error;
    return data as TaskVideoRow[];
  }

  async findLinksByVideoId(videoId: string) {
    const { data, error } = await getSupabaseAdmin()
      .from("task_videos")
      .select("task_id")
      .eq("video_id", videoId);
    if (error) throw error;
    return (data as { task_id: string }[]).map((r) => ({ taskId: r.task_id }));
  }
}
