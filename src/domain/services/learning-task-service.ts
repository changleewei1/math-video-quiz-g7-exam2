import type { LearningTaskRepository, TaskVideoInsert } from "@/domain/repositories/learning-task-repository";
import type { StudentRepository } from "@/domain/repositories/student-repository";
import type { StudentTaskProgressRepository } from "@/domain/repositories/student-task-progress-repository";
import type { VideoRepository } from "@/domain/repositories/video-repository";
import type { StudentTaskProgressRow } from "@/types/database";

export type CreateLearningTaskInput = {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  className: string;
  videos: { videoId: string; dayIndex: number }[];
};

export type LearningTaskListItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  className: string;
  videoCount: number;
};

export type AdminTaskStudentRow = {
  studentId: string;
  studentCode: string;
  name: string;
  completedCount: number;
  totalVideos: number;
  completionRate: number;
  isBehind: boolean;
};

export type AdminTaskDetail = {
  task: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    className: string;
  };
  videos: { videoId: string; dayIndex: number; title: string }[];
  students: AdminTaskStudentRow[];
};

export type StudentTaskDayVideo = {
  videoId: string;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
};

export type StudentTaskView = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  className: string;
  /** 供後續甘特圖／報表擴充 */
  phase: "upcoming" | "active" | "ended";
  days: { dayIndex: number; videos: StudentTaskDayVideo[] }[];
  completedCount: number;
  totalVideos: number;
  completionRate: number;
};

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 任務第幾天（開始日為第 1 天）；早於開始為 0 */
function taskDayIndex(startYmd: string, todayYmd: string): number {
  const a = new Date(`${startYmd}T12:00:00`);
  const b = new Date(`${todayYmd}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff + 1;
}

function taskPhase(
  startYmd: string,
  endYmd: string,
  todayYmd: string,
): "upcoming" | "active" | "ended" {
  if (todayYmd < startYmd) return "upcoming";
  if (todayYmd > endYmd) return "ended";
  return "active";
}

function isStudentBehind(
  taskStart: string,
  taskEnd: string,
  today: string,
  taskVideos: { videoId: string; dayIndex: number }[],
  completedIds: Set<string>,
): boolean {
  const total = taskVideos.length;
  if (total === 0) return false;
  const done = taskVideos.filter((tv) => completedIds.has(tv.videoId)).length;
  if (done >= total) return false;

  if (today > taskEnd) return true;

  if (today < taskStart) return false;

  const dayNum = taskDayIndex(taskStart, today);
  return taskVideos.some(
    (tv) => tv.dayIndex <= dayNum && !completedIds.has(tv.videoId),
  );
}

export class LearningTaskService {
  constructor(
    private readonly taskRepo: LearningTaskRepository,
    private readonly taskProgressRepo: StudentTaskProgressRepository,
    private readonly students: StudentRepository,
    private readonly videos: VideoRepository,
  ) {}

  /** 影片觀看完成時由 VideoTrackingService 呼叫 */
  async syncOnVideoCompleted(
    studentId: string,
    videoId: string,
    completedAt: Date | null,
  ): Promise<void> {
    const student = await this.students.findById(studentId);
    if (!student?.className) return;

    const links = await this.taskRepo.findLinksByVideoId(videoId);
    const at = (completedAt ?? new Date()).toISOString();

    for (const { taskId } of links) {
      const task = await this.taskRepo.findById(taskId);
      if (!task || task.class_name !== student.className) continue;

      await this.taskProgressRepo.upsert({
        student_id: studentId,
        task_id: taskId,
        video_id: videoId,
        is_completed: true,
        completed_at: at,
      });
    }
  }

  async createTask(input: CreateLearningTaskInput): Promise<{ id: string }> {
    if (input.videos.length === 0) {
      throw new Error("至少需要一支影片");
    }
    const { id } = await this.taskRepo.insertTask({
      title: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      class_name: input.className,
    });

    const rows: TaskVideoInsert[] = input.videos.map((v) => ({
      task_id: id,
      video_id: v.videoId,
      day_index: v.dayIndex,
    }));
    await this.taskRepo.insertTaskVideos(rows);
    return { id };
  }

  async listTasks(): Promise<LearningTaskListItem[]> {
    const tasks = await this.taskRepo.findAll();
    const out: LearningTaskListItem[] = [];
    for (const t of tasks) {
      const tvs = await this.taskRepo.findTaskVideos(t.id);
      out.push({
        id: t.id,
        title: t.title,
        description: t.description,
        startDate: t.start_date,
        endDate: t.end_date,
        className: t.class_name,
        videoCount: tvs.length,
      });
    }
    return out;
  }

  async getAdminTaskDetail(taskId: string): Promise<AdminTaskDetail | null> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return null;

    const tvs = await this.taskRepo.findTaskVideos(taskId);
    const videos: AdminTaskDetail["videos"] = [];
    for (const tv of tvs) {
      const v = await this.videos.findById(tv.video_id);
      videos.push({
        videoId: tv.video_id,
        dayIndex: tv.day_index,
        title: v?.title ?? "(已刪除的影片)",
      });
    }

    const classStudents = await this.students.findByClassName(task.class_name);
    const progressRows = await this.taskProgressRepo.listByTaskId(taskId);
    const byStudent = new Map<string, Set<string>>();
    for (const p of progressRows) {
      if (!p.is_completed) continue;
      if (!byStudent.has(p.student_id)) byStudent.set(p.student_id, new Set());
      byStudent.get(p.student_id)!.add(p.video_id);
    }

    const totalVideos = tvs.length;
    const tvMeta = tvs.map((tv) => ({ videoId: tv.video_id, dayIndex: tv.day_index }));
    const today = todayYmd();

    const students: AdminTaskStudentRow[] = classStudents.map((s) => {
      const completedIds = byStudent.get(s.id) ?? new Set<string>();
      const completedCount = tvMeta.filter((tv) => completedIds.has(tv.videoId)).length;
      const completionRate =
        totalVideos > 0 ? Math.round((completedCount / totalVideos) * 1000) / 10 : 0;
      const behind = isStudentBehind(
        task.start_date,
        task.end_date,
        today,
        tvMeta,
        completedIds,
      );
      return {
        studentId: s.id,
        studentCode: s.studentCode,
        name: s.name,
        completedCount,
        totalVideos,
        completionRate,
        isBehind: behind,
      };
    });

    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        startDate: task.start_date,
        endDate: task.end_date,
        className: task.class_name,
      },
      videos,
      students,
    };
  }

  async getStudentTasks(studentId: string): Promise<StudentTaskView[]> {
    const student = await this.students.findById(studentId);
    if (!student?.className) return [];

    const all = await this.taskRepo.findAll();
    const mine = all.filter((t) => t.class_name === student.className);
    const out: StudentTaskView[] = [];
    const today = todayYmd();

    for (const task of mine) {
      const tvs = await this.taskRepo.findTaskVideos(task.id);
      const progressRows = await this.taskProgressRepo.listByTaskAndStudent(task.id, studentId);
      const progressMap = new Map<string, StudentTaskProgressRow>();
      for (const p of progressRows) {
        progressMap.set(p.video_id, p);
      }

      const dayMap = new Map<number, StudentTaskDayVideo[]>();
      for (const tv of tvs) {
        const v = await this.videos.findById(tv.video_id);
        const pr = progressMap.get(tv.video_id);
        const row: StudentTaskDayVideo = {
          videoId: tv.video_id,
          title: v?.title ?? "(影片)",
          isCompleted: pr?.is_completed ?? false,
          completedAt: pr?.completed_at ?? null,
        };
        const list = dayMap.get(tv.day_index) ?? [];
        list.push(row);
        dayMap.set(tv.day_index, list);
      }

      const days = [...dayMap.keys()]
        .sort((a, b) => a - b)
        .map((dayIndex) => ({
          dayIndex,
          videos: dayMap.get(dayIndex)!,
        }));

      const totalVideos = tvs.length;
      let completedCount = 0;
      for (const tv of tvs) {
        if (progressMap.get(tv.video_id)?.is_completed) completedCount += 1;
      }
      const completionRate =
        totalVideos > 0 ? Math.round((completedCount / totalVideos) * 1000) / 10 : 0;

      out.push({
        id: task.id,
        title: task.title,
        description: task.description,
        startDate: task.start_date,
        endDate: task.end_date,
        className: task.class_name,
        phase: taskPhase(task.start_date, task.end_date, today),
        days,
        completedCount,
        totalVideos,
        completionRate,
      });
    }

    out.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
    return out;
  }
}
