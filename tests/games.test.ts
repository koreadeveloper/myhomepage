import { describe, it, expect, beforeEach } from 'vitest';
import { games, filters, gameThumb, type GameCategory } from '../data/games';
import { gameHelp } from '../lib/gameHelp';
import { recordBestScore, getBestScore } from '../lib/highScore';

// --- 게임 메타데이터 무결성 ---
describe('게임 메타데이터', () => {
  it('제목이 중복되지 않는다', () => {
    const titles = games.map((g) => g.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('모든 게임에 카테고리와 아이콘이 있다', () => {
    const valid: GameCategory[] = ['보드', '카드', '아케이드', '퍼즐', '챌린지'];
    for (const g of games) {
      expect(valid).toContain(g.category);
      expect(g.icon.length).toBeGreaterThan(0);
      expect(g.description.length).toBeGreaterThan(0);
    }
  });

  it('모든 게임에 도움말(조작법)이 있다', () => {
    for (const g of games) {
      const h = gameHelp[g.title];
      expect(h, `${g.title} 도움말 누락`).toBeDefined();
      expect(h.goal.length).toBeGreaterThan(0);
      expect(h.controls.length).toBeGreaterThan(0);
    }
  });

  it('필터에 있는 카테고리가 실제 게임에 존재한다', () => {
    const cats = new Set(games.map((g) => g.category));
    for (const f of filters) {
      if (f === '전체' || f === '최근' || f === '즐겨찾기') continue;
      expect(cats.has(f as GameCategory), `카테고리 ${f}에 게임 없음`).toBe(true);
    }
  });

  it('썸네일 경로가 URL 인코딩된다', () => {
    expect(gameThumb('체스')).toBe('/games/%EC%B2%B4%EC%8A%A4.webp');
    expect(gameThumb('2048')).toBe('/games/2048.webp');
  });
});

// --- 로컬 최고기록 ---
describe('최고기록 (localStorage)', () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    // @ts-expect-error 테스트용 localStorage 스텁
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    };
    // dispatchEvent 스텁 (jsdom 없이)
    // @ts-expect-error 테스트용 window 스텁
    globalThis.window = { dispatchEvent: () => true };
  });

  it('첫 점수는 항상 기록된다', () => {
    expect(recordBestScore('테스트게임', 100)).toBe(true);
    expect(getBestScore('테스트게임')).toBe(100);
  });

  it('더 높은 점수만 갱신된다', () => {
    recordBestScore('g1', 100);
    expect(recordBestScore('g1', 50)).toBe(false);
    expect(recordBestScore('g1', 150)).toBe(true);
    expect(getBestScore('g1')).toBe(150);
  });

  it('lowerIsBetter는 낮은 점수가 이긴다', () => {
    recordBestScore('g2', 500, { lowerIsBetter: true });
    expect(recordBestScore('g2', 600, { lowerIsBetter: true })).toBe(false);
    expect(recordBestScore('g2', 300, { lowerIsBetter: true })).toBe(true);
    expect(getBestScore('g2')).toBe(300);
  });

  it('게임별로 독립적으로 기록된다', () => {
    recordBestScore('a', 10);
    recordBestScore('b', 20);
    expect(getBestScore('a')).toBe(10);
    expect(getBestScore('b')).toBe(20);
  });
});
