// 게임별 로컬 최고기록 (localStorage) — 로그인 없이 기기에만 저장
const KEY = 'gamezone-best';

type BestEntry = { score: number; at: number };
const load = (): Record<string, BestEntry> => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};

/** 최고기록 조회 (없으면 undefined) */
export const getBestScore = (gameId: string): number | undefined =>
  load()[gameId]?.score;

/**
 * 점수 기록. 기존 기록보다 좋으면 저장하고 true 반환.
 * opts.lowerIsBetter: 시간/시도횟수처럼 낮을수록 좋은 게임용.
 */
export const recordBestScore = (gameId: string, score: number, opts?: { lowerIsBetter?: boolean }): boolean => {
  const all = load();
  const prev = all[gameId]?.score;
  const better = prev === undefined
    || (opts?.lowerIsBetter ? score < prev : score > prev);
  if (!better) return false;
  all[gameId] = { score, at: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* 무시 */ }
  return true;
};
