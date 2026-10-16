// 게임 메타데이터 — GameZone 카드, sitemap, 리더보드, 테스트가 공유
export type GameCategory = '보드' | '카드' | '아케이드' | '퍼즐' | '챌린지';
export type GameFilter = '전체' | '최근' | '즐겨찾기' | GameCategory;

export type Game = {
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    accentColor: string;
    cornerAccentColor: string;
    category: GameCategory;
    isLarge?: boolean;
};

export const games: Game[] = [
    { title: '체스', description: 'AI와 대전하는 클래식 전략 게임', icon: 'grid_on', color: 'text-lime-700 dark:text-lime-400', bgColor: 'bg-lime-100 dark:bg-lime-900/30', accentColor: 'bg-lime-600', cornerAccentColor: 'bg-lime-600/10', category: '보드' },
    { title: '포커', description: 'AI와 텍사스 홀덤 대결', icon: 'casino', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-600/10', category: '카드' },
    { title: '고스톱', description: 'AI와 1:1 맞고 대결', icon: 'filter_vintage', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-600', cornerAccentColor: 'bg-orange-600/10', category: '카드' },
    { title: '스네이크', description: '클래식 레트로 도전 게임', icon: 'gesture', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', accentColor: 'bg-emerald-500', cornerAccentColor: 'bg-emerald-500/10', category: '아케이드' },
    { title: '테트리스', description: '블록을 완벽하게 맞춰라', icon: 'view_module', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-500', cornerAccentColor: 'bg-blue-500/10', category: '아케이드' },
    { title: '2048', description: '숫자를 합쳐 2048을 만들어라', icon: 'grid_4x4', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-500', cornerAccentColor: 'bg-amber-500/10', category: '퍼즐' },
    { title: '지뢰찾기', description: '지뢰밭을 안전하게 정리하라', icon: 'flag', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/30', accentColor: 'bg-rose-500', cornerAccentColor: 'bg-rose-500/10', category: '퍼즐' },
    { title: '스도쿠', description: '9x9 격자 논리 퍼즐', icon: 'calculate', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', accentColor: 'bg-indigo-500', cornerAccentColor: 'bg-indigo-500/10', category: '퍼즐' },
    { title: '카드 뒤집기', description: '두뇌력을 테스트하라', icon: 'style', color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30', accentColor: 'bg-pink-500', cornerAccentColor: 'bg-pink-500/10', category: '퍼즐' },
    { title: '틱택토', description: 'AI와 빠른 대결', icon: 'close', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', accentColor: 'bg-cyan-500', cornerAccentColor: 'bg-cyan-500/10', category: '보드' },
    { title: '단어 퍼즐', description: '5글자 영단어를 맞춰라', icon: 'abc', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-500', cornerAccentColor: 'bg-orange-500/10', category: '퍼즐' },
    { title: '팩맨', description: '유령을 피해 점을 먹어라', icon: 'radio_button_checked', color: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', accentColor: 'bg-yellow-500', cornerAccentColor: 'bg-yellow-500/10', category: '아케이드' },
    { title: '브레이크아웃', description: '공으로 벽돌을 깨부숴라', icon: 'view_compact', color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-500', cornerAccentColor: 'bg-red-500/10', category: '아케이드' },
    { title: '핑퐁', description: 'AI와 탁구 대결', icon: 'sports_tennis', color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-500', cornerAccentColor: 'bg-green-500/10', category: '아케이드' },
    { title: '플래피버드', description: '장애물을 피해 날아라', icon: 'flutter_dash', color: 'text-sky-500 dark:text-sky-400', bgColor: 'bg-sky-100 dark:bg-sky-900/30', accentColor: 'bg-sky-500', cornerAccentColor: 'bg-sky-500/10', category: '아케이드' },
    { title: '스페이스 인베이더', description: '외계인 침략을 막아라', icon: 'rocket_launch', color: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-500', cornerAccentColor: 'bg-purple-500/10', category: '아케이드' },
    { title: '점프 다이노', description: '장애물을 뛰어넘어라', icon: 'pets', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-600', cornerAccentColor: 'bg-slate-500/10', category: '아케이드' },
    { title: '행맨', description: '단어를 맞춰 목숨을 구해라', icon: 'person', color: 'text-teal-500 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/30', accentColor: 'bg-teal-500', cornerAccentColor: 'bg-teal-500/10', category: '퍼즐' },
    { title: '오목', description: 'AI와 5목 대결', icon: 'blur_on', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-500/10', category: '보드' },
    { title: '반응속도', description: '얼마나 빠르게 반응하나?', icon: 'speed', color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-500', cornerAccentColor: 'bg-red-500/10', category: '챌린지' },
    { title: '타자연습', description: '한국어 타이핑 실력 테스트', icon: 'keyboard', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-500/10', category: '챌린지' },
    { title: '블랙잭', description: '21을 향한 카드 게임', icon: 'casino', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/30', accentColor: 'bg-violet-600', cornerAccentColor: 'bg-violet-500/10', category: '카드' },
    { title: '퀴즈', description: '어려운 상식 문제 도전', icon: 'quiz', color: 'text-fuchsia-600 dark:text-fuchsia-400', bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', accentColor: 'bg-fuchsia-600', cornerAccentColor: 'bg-fuchsia-500/10', category: '챌린지' },
    { title: '암산', description: '60초 수학 계산 챌린지', icon: 'functions', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-500/10', category: '챌린지' },
    { title: '슬라이딩 퍼즐', description: '숫자 타일을 순서대로 정렬', icon: 'grid_4x4', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', accentColor: 'bg-indigo-600', cornerAccentColor: 'bg-indigo-500/10', category: '퍼즐' },
    { title: '다트', description: '정확하게 과녁을 맞춰라', icon: 'gps_fixed', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-500/10', category: '아케이드' },
    { title: '체커', description: '점프로 상대를 잡아라', icon: 'grid_view', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-500/10', category: '보드' },
    { title: '솔리테어', description: '클래식 카드 정리 게임', icon: 'style', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-500/10', category: '카드' },
    { title: '프리셀', description: '모든 카드가 보이는 전략 게임', icon: 'view_column', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-500/10', category: '카드' },
    { title: '당구', description: '2D 당구 시뮬레이션', icon: 'sports_baseball', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', accentColor: 'bg-emerald-600', cornerAccentColor: 'bg-emerald-500/10', category: '아케이드' },
    { title: '바둑', description: 'AI와 고대 전략 대결', icon: 'blur_on', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-700', cornerAccentColor: 'bg-slate-500/10', category: '보드' },
    { title: '루빅스 큐브', description: '3D 큐브 퍼즐 도전', icon: 'view_in_ar', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-600', cornerAccentColor: 'bg-purple-500/10', category: '퍼즐' },
    { title: '오셀로', description: '돌을 뒤집어 영역을 차지하라', icon: 'radio_button_checked', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-600/10', category: '보드' },
    { title: '커넥트4', description: '4개를 연속으로 만들어라', icon: 'view_week', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-600/10', category: '보드' },
    { title: '배틀쉽', description: '적 함대를 격침시켜라', icon: 'directions_boat', color: 'text-slate-700 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-900/30', accentColor: 'bg-slate-600', cornerAccentColor: 'bg-slate-600/10', category: '보드' },
    { title: '요트', description: '주사위로 최고 점수를 만들어라', icon: 'casino', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-600/10', category: '아케이드' },
    { title: '도미노', description: 'AI와 숫자 매칭 대결', icon: 'view_carousel', color: 'text-slate-800 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-700', cornerAccentColor: 'bg-slate-600/10', category: '보드' },
    { title: '사이먼', description: '패턴을 기억하고 따라하세요', icon: 'blur_circular', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-600', cornerAccentColor: 'bg-purple-600/10', category: '챌린지' },
    { title: '단어 찾기', description: '숨겨진 단어를 드래그해서 찾아라', icon: 'search', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-600/10', category: '퍼즐' },
    { title: '스피드 카드', description: '빠르게 카드를 매칭하라', icon: 'bolt', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-600', cornerAccentColor: 'bg-orange-600/10', category: '카드' },
    { title: '장기', description: '한국 전통 보드게임', icon: 'castle', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-700', cornerAccentColor: 'bg-amber-600/10', category: '보드' },
    { title: '마작 솔리테어', description: '같은 타일을 매칭하여 제거', icon: 'extension', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/30', accentColor: 'bg-rose-600', cornerAccentColor: 'bg-rose-600/10', category: '퍼즐' },
    { title: '카드 전쟁', description: '높은 카드로 상대를 이겨라', icon: 'military_tech', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-600/10', category: '카드' },
];

export const filters: GameFilter[] = ['전체', '최근', '즐겨찾기', '보드', '카드', '아케이드', '퍼즐', '챌린지'];

export const gameLink = (title: string) =>
    `${window.location.origin}/gamezone/${encodeURIComponent(title)}`;

export const gameThumb = (title: string) =>
    `/games/${encodeURIComponent(title)}.webp`;
