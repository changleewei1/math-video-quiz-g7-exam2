import { z } from "zod";

export const loginBodySchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("student"),
    studentCode: z.string().min(1),
    /** 設有 password_hash 時必填 */
    password: z.string().optional(),
  }),
  z.object({
    role: z.literal("admin"),
    adminSecret: z.string().min(1),
  }),
]);

export const videoProgressBodySchema = z.object({
  videoId: z.string().uuid(),
  currentTimeSeconds: z.number().nonnegative(),
  durationSeconds: z.number().positive(),
  incrementView: z.boolean().optional(),
});

export const submitQuizBodySchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export const reportLinkBodySchema = z.object({
  taskId: z.string().uuid().nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
});

export const createLearningTaskBodySchema = z
  .object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    className: z.string().min(1),
    videos: z
      .array(
        z.object({
          videoId: z.string().uuid(),
          dayIndex: z.number().int().min(1),
        }),
      )
      .min(1),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "結束日不可早於開始日",
    path: ["endDate"],
  });

const optionalImageUrl = z.union([z.string().url(), z.null()]);

export const quizQuestionPatchSchema = z.object({
  questionText: z.string().optional(),
  questionImageUrl: optionalImageUrl.optional(),
  choiceA: z.string().optional(),
  choiceB: z.string().optional(),
  choiceC: z.string().optional(),
  choiceD: z.string().optional(),
  choiceAImageUrl: optionalImageUrl.optional(),
  choiceBImageUrl: optionalImageUrl.optional(),
  choiceCImageUrl: optionalImageUrl.optional(),
  choiceDImageUrl: optionalImageUrl.optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
  skillCode: z.string().min(1).optional(),
  explanation: z.string().nullable().optional(),
});

export const quizAssetUploadFieldSchema = z.enum([
  "question",
  "choice_a",
  "choice_b",
  "choice_c",
  "choice_d",
]);
