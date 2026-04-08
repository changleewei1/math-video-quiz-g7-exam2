/** 題幹與四選項：至少需文字或圖片其中一種 */
export function validateMcqVisualContent(input: {
  questionText: string;
  questionImageUrl: string | null;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  choiceAImageUrl: string | null;
  choiceBImageUrl: string | null;
  choiceCImageUrl: string | null;
  choiceDImageUrl: string | null;
}): string | null {
  const stemOk =
    input.questionText.trim().length > 0 || Boolean(input.questionImageUrl?.trim());
  if (!stemOk) return "題幹需至少包含文字或圖片其中一種";

  const opts: { letter: string; text: string; img: string | null }[] = [
    { letter: "A", text: input.choiceA, img: input.choiceAImageUrl },
    { letter: "B", text: input.choiceB, img: input.choiceBImageUrl },
    { letter: "C", text: input.choiceC, img: input.choiceCImageUrl },
    { letter: "D", text: input.choiceD, img: input.choiceDImageUrl },
  ];
  for (const o of opts) {
    const ok = o.text.trim().length > 0 || Boolean(o.img?.trim());
    if (!ok) return `選項 ${o.letter} 需至少包含文字或圖片其中一種`;
  }
  return null;
}
