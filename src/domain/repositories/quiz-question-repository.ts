import type { QuizQuestion } from "@/domain/entities";

export interface QuizQuestionRepository {
  findByQuizId(quizId: string): Promise<QuizQuestion[]>;
  findById(id: string): Promise<QuizQuestion | null>;
  insertMany(questions: QuizQuestionInsert[]): Promise<void>;
  updateById(id: string, patch: QuizQuestionUpdate): Promise<void>;
}

export type QuizQuestionInsert = {
  id?: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
  explanation: string | null;
  sort_order: number;
  difficulty: string | null;
  skill_code: string;
  question_image_url?: string | null;
  choice_a_image_url?: string | null;
  choice_b_image_url?: string | null;
  choice_c_image_url?: string | null;
  choice_d_image_url?: string | null;
};

export type QuizQuestionUpdate = {
  question_text?: string;
  question_image_url?: string | null;
  choice_a?: string;
  choice_b?: string;
  choice_c?: string;
  choice_d?: string;
  choice_a_image_url?: string | null;
  choice_b_image_url?: string | null;
  choice_c_image_url?: string | null;
  choice_d_image_url?: string | null;
  correct_answer?: string;
  explanation?: string | null;
  skill_code?: string;
};
