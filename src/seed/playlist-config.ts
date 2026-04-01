/**
 * YouTube 播放清單匯入設定（供 scripts/import-playlists.ts 使用）
 */
export const PLAYLIST_IMPORT_CONFIG = [
  {
    unitId: "a0000001-0000-4000-8000-000000000002",
    playlistId: "PLE4eQs8dZrfTRM21GA3nN5IimBbdk-tqh",
    includeRule: { type: "all" as const },
    defaultSkillCode: "R01",
    defaultSkillName: "比與比值",
  },
  {
    unitId: "a0000001-0000-4000-8000-000000000003",
    playlistId: "PLE4eQs8dZrfRbMMOebexqSsguMWy7fWVx",
    includeRule: { type: "range" as const, start: 14, end: 31 },
    defaultSkillCode: "C01",
    defaultSkillName: "直線概念",
  },
] as const;
