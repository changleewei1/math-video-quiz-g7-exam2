import { NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/composition";
import { getAdminSession } from "@/lib/session";

type Params = { videoId: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { videoId } = await ctx.params;
  const { quizzes, quizQuestions, skillTags } = getRepositories();
  const quiz = await quizzes.findByVideoId(videoId);
  if (!quiz) {
    return NextResponse.json({ error: "NO_QUIZ" }, { status: 404 });
  }
  const questions = await quizQuestions.findByQuizId(quiz.id);
  const tags = await skillTags.findAll();
  return NextResponse.json({
    quiz: {
      id: quiz.id,
      videoId: quiz.videoId,
      title: quiz.title,
      passScore: quiz.passScore,
      questionCount: quiz.questionCount,
    },
    questions: questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionImageUrl: q.questionImageUrl,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
      choiceAImageUrl: q.choiceAImageUrl,
      choiceBImageUrl: q.choiceBImageUrl,
      choiceCImageUrl: q.choiceCImageUrl,
      choiceDImageUrl: q.choiceDImageUrl,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sortOrder: q.sortOrder,
      skillCode: q.skillCode,
    })),
    skillTags: tags.map((t) => ({ code: t.code, name: t.name })),
  });
}
