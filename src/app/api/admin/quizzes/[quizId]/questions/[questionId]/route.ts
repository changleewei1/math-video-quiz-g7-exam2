import { NextResponse } from "next/server";
import type { QuizQuestionUpdate } from "@/domain/repositories";
import { getRepositories } from "@/infrastructure/composition";
import { validateMcqVisualContent } from "@/lib/quiz-content-validation";
import { getAdminSession } from "@/lib/session";
import { quizQuestionPatchSchema } from "@/lib/validation";

type Params = { quizId: string; questionId: string };

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { quizId, questionId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = quizQuestionPatchSchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const b = parsed.data;
  if (Object.keys(b).length === 0) {
    return NextResponse.json({ error: "EMPTY_BODY" }, { status: 400 });
  }

  const { quizQuestions } = getRepositories();
  const existing = await quizQuestions.findById(questionId);
  if (!existing || existing.quizId !== quizId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const merged = {
    questionText: b.questionText !== undefined ? b.questionText : existing.questionText,
    questionImageUrl:
      b.questionImageUrl !== undefined ? b.questionImageUrl : existing.questionImageUrl,
    choiceA: b.choiceA !== undefined ? b.choiceA : existing.choiceA,
    choiceB: b.choiceB !== undefined ? b.choiceB : existing.choiceB,
    choiceC: b.choiceC !== undefined ? b.choiceC : existing.choiceC,
    choiceD: b.choiceD !== undefined ? b.choiceD : existing.choiceD,
    choiceAImageUrl:
      b.choiceAImageUrl !== undefined ? b.choiceAImageUrl : existing.choiceAImageUrl,
    choiceBImageUrl:
      b.choiceBImageUrl !== undefined ? b.choiceBImageUrl : existing.choiceBImageUrl,
    choiceCImageUrl:
      b.choiceCImageUrl !== undefined ? b.choiceCImageUrl : existing.choiceCImageUrl,
    choiceDImageUrl:
      b.choiceDImageUrl !== undefined ? b.choiceDImageUrl : existing.choiceDImageUrl,
    correctAnswer: b.correctAnswer !== undefined ? b.correctAnswer : existing.correctAnswer,
    skillCode: b.skillCode !== undefined ? b.skillCode : existing.skillCode,
    explanation: b.explanation !== undefined ? b.explanation : existing.explanation,
  };

  const invalid = validateMcqVisualContent(merged);
  if (invalid) {
    return NextResponse.json({ error: "VALIDATION", detail: invalid }, { status: 400 });
  }

  const patch: QuizQuestionUpdate = {};
  if (b.questionText !== undefined) patch.question_text = merged.questionText;
  if (b.questionImageUrl !== undefined) patch.question_image_url = merged.questionImageUrl;
  if (b.choiceA !== undefined) patch.choice_a = merged.choiceA;
  if (b.choiceB !== undefined) patch.choice_b = merged.choiceB;
  if (b.choiceC !== undefined) patch.choice_c = merged.choiceC;
  if (b.choiceD !== undefined) patch.choice_d = merged.choiceD;
  if (b.choiceAImageUrl !== undefined) patch.choice_a_image_url = merged.choiceAImageUrl;
  if (b.choiceBImageUrl !== undefined) patch.choice_b_image_url = merged.choiceBImageUrl;
  if (b.choiceCImageUrl !== undefined) patch.choice_c_image_url = merged.choiceCImageUrl;
  if (b.choiceDImageUrl !== undefined) patch.choice_d_image_url = merged.choiceDImageUrl;
  if (b.correctAnswer !== undefined) patch.correct_answer = merged.correctAnswer;
  if (b.skillCode !== undefined) patch.skill_code = merged.skillCode;
  if (b.explanation !== undefined) patch.explanation = merged.explanation;

  await quizQuestions.updateById(questionId, patch);
  return NextResponse.json({ ok: true });
}
