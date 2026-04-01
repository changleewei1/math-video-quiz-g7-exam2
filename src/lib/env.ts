/**
 * 僅在執行期讀取環境變數，避免 import 時拋錯。
 */
export function getEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

export function requireEnv(name: string): string {
  const v = getEnv(name);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}
