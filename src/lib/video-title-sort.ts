/**
 * 影片標題常為「編號＋課程名」前綴（例：`1國中…`、`14數學…`、`6~7國中…`）。
 * 依開頭數字排序，避免字串排序造成 14 排在 2 前面。
 */

/** 取標題開頭數字作為排序鍵（`6~7…` 取 6）。無開頭數字則排最後。 */
export function leadingNumberFromVideoTitle(title: string): number {
  const t = title.trim();
  const m = t.match(/^(\d+)(?:~\d+)?/);
  if (m) return parseInt(m[1], 10);
  return Number.MAX_SAFE_INTEGER;
}

/** 先比開頭數字，再比完整標題（繁中 locale） */
export function compareVideoTitleNumeric(aTitle: string, bTitle: string): number {
  const ka = leadingNumberFromVideoTitle(aTitle);
  const kb = leadingNumberFromVideoTitle(bTitle);
  if (ka !== kb) return ka - kb;
  return aTitle.localeCompare(bTitle, "zh-Hant");
}
