import React, { Component, useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
// 게임 컴포넌트는 각각 lazy — 선택한 게임 코드만 로드
const ChessGameNew = lazy(() => import('../components/ChessGame'));
const PacmanGame = lazy(() => import('../components/PacmanGame'));
const BreakoutGame = lazy(() => import('../components/BreakoutGame'));
const PongGame = lazy(() => import('../components/PongGame'));
const FlappyBirdGame = lazy(() => import('../components/FlappyBirdGame'));
const SpaceInvadersGame = lazy(() => import('../components/SpaceInvadersGame'));
const DinoJumpGame = lazy(() => import('../components/DinoJumpGame'));
const HangmanGame = lazy(() => import('../components/HangmanGame'));
const GomokuGame = lazy(() => import('../components/GomokuGame'));
const ReactionTest = lazy(() => import('../components/ReactionTest'));
const TypingGame = lazy(() => import('../components/TypingGame'));
const BlackjackGame = lazy(() => import('../components/BlackjackGame'));
const PokerGame = lazy(() => import('../components/PokerGame'));
const GoStopGame = lazy(() => import('../components/GoStopGame'));
const QuizGame = lazy(() => import('../components/QuizGame'));
const MathGame = lazy(() => import('../components/MathGame'));
const SlidingPuzzleGame = lazy(() => import('../components/SlidingPuzzleGame'));
const DartsGame = lazy(() => import('../components/DartsGame'));
const CheckersGame = lazy(() => import('../components/CheckersGame'));
const SolitaireGame = lazy(() => import('../components/SolitaireGame'));
const FreecellGame = lazy(() => import('../components/FreecellGame'));
const PoolGame = lazy(() => import('../components/PoolGame'));
const GoGame = lazy(() => import('../components/GoGame'));
const RubiksCubeGame = lazy(() => import('../components/RubiksCubeGame'));
const OthelloGame = lazy(() => import('../components/OthelloGame'));
const ConnectFourGame = lazy(() => import('../components/ConnectFourGame'));
const BattleshipGame = lazy(() => import('../components/BattleshipGame'));
const YachtGame = lazy(() => import('../components/YachtGame'));
const DominoGame = lazy(() => import('../components/DominoGame'));
const SimonGame = lazy(() => import('../components/SimonGame'));
const WordSearchGame = lazy(() => import('../components/WordSearchGame'));
const SpeedCardGame = lazy(() => import('../components/SpeedCardGame'));
const JanggiGame = lazy(() => import('../components/JanggiGame'));
const MahjongSolitaireGame = lazy(() => import('../components/MahjongSolitaireGame'));
const WarCardGame = lazy(() => import('../components/WarCardGame'));
import MobileControls from '../components/MobileControls';
import { logGamePlay, saveGameScore } from '../services/api';

// --- Shared Types & Constants ---
type Game = {
    title: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    accentColor: string;
    cornerAccentColor: string;
    isLarge?: boolean;
};

const games: Game[] = [
    { title: '체스', description: 'AI와 대전하는 클래식 전략 게임', icon: 'grid_on', color: 'text-lime-700 dark:text-lime-400', bgColor: 'bg-lime-100 dark:bg-lime-900/30', accentColor: 'bg-lime-600', cornerAccentColor: 'bg-lime-600/10' },
    { title: '포커', description: 'AI와 텍사스 홀덤 대결', icon: 'casino', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-600/10' },
    { title: '고스톱', description: 'AI와 1:1 맞고 대결', icon: 'filter_vintage', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-600', cornerAccentColor: 'bg-orange-600/10' },
    { title: '스네이크', description: '클래식 레트로 도전 게임', icon: 'gesture', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', accentColor: 'bg-emerald-500', cornerAccentColor: 'bg-emerald-500/10' },
    { title: '테트리스', description: '블록을 완벽하게 맞춰라', icon: 'view_module', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-500', cornerAccentColor: 'bg-blue-500/10' },
    { title: '2048', description: '숫자를 합쳐 2048을 만들어라', icon: 'grid_4x4', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-500', cornerAccentColor: 'bg-amber-500/10' },
    { title: '지뢰찾기', description: '지뢰밭을 안전하게 정리하라', icon: 'flag', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/30', accentColor: 'bg-rose-500', cornerAccentColor: 'bg-rose-500/10' },
    { title: '스도쿠', description: '9x9 격자 논리 퍼즐', icon: 'calculate', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', accentColor: 'bg-indigo-500', cornerAccentColor: 'bg-indigo-500/10' },
    { title: '카드 뒤집기', description: '두뇌력을 테스트하라', icon: 'style', color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30', accentColor: 'bg-pink-500', cornerAccentColor: 'bg-pink-500/10' },
    { title: '틱택토', description: 'AI와 빠른 대결', icon: 'close', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', accentColor: 'bg-cyan-500', cornerAccentColor: 'bg-cyan-500/10' },
    { title: '단어 퍼즐', description: '5글자 영단어를 맞춰라', icon: 'abc', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-500', cornerAccentColor: 'bg-orange-500/10' },
    // New classic games
    { title: '팩맨', description: '유령을 피해 점을 먹어라', icon: 'radio_button_checked', color: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', accentColor: 'bg-yellow-500', cornerAccentColor: 'bg-yellow-500/10' },
    { title: '브레이크아웃', description: '공으로 벽돌을 깨부숴라', icon: 'view_compact', color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-500', cornerAccentColor: 'bg-red-500/10' },
    { title: '핑퐁', description: 'AI와 탁구 대결', icon: 'sports_tennis', color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-500', cornerAccentColor: 'bg-green-500/10' },
    { title: '플래피버드', description: '장애물을 피해 날아라', icon: 'flutter_dash', color: 'text-sky-500 dark:text-sky-400', bgColor: 'bg-sky-100 dark:bg-sky-900/30', accentColor: 'bg-sky-500', cornerAccentColor: 'bg-sky-500/10' },
    { title: '스페이스 인베이더', description: '외계인 침략을 막아라', icon: 'rocket_launch', color: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-500', cornerAccentColor: 'bg-purple-500/10' },
    { title: '점프 다이노', description: '장애물을 뛰어넘어라', icon: 'pets', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-600', cornerAccentColor: 'bg-slate-500/10' },
    { title: '행맨', description: '단어를 맞춰 목숨을 구해라', icon: 'person', color: 'text-teal-500 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/30', accentColor: 'bg-teal-500', cornerAccentColor: 'bg-teal-500/10' },
    // New games - Wave 2
    { title: '오목', description: 'AI와 5목 대결', icon: 'blur_on', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-500/10' },
    { title: '반응속도', description: '얼마나 빠르게 반응하나?', icon: 'speed', color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-500', cornerAccentColor: 'bg-red-500/10' },
    { title: '타자연습', description: '한국어 타이핑 실력 테스트', icon: 'keyboard', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-500/10' },
    { title: '블랙잭', description: '21을 향한 카드 게임', icon: 'casino', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/30', accentColor: 'bg-violet-600', cornerAccentColor: 'bg-violet-500/10' },
    { title: '퀴즈', description: '어려운 상식 문제 도전', icon: 'quiz', color: 'text-fuchsia-600 dark:text-fuchsia-400', bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', accentColor: 'bg-fuchsia-600', cornerAccentColor: 'bg-fuchsia-500/10' },
    { title: '암산', description: '60초 수학 계산 챌린지', icon: 'functions', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-500/10' },
    { title: '슬라이딩 퍼즐', description: '숫자 타일을 순서대로 정렬', icon: 'grid_4x4', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', accentColor: 'bg-indigo-600', cornerAccentColor: 'bg-indigo-500/10' },
    { title: '다트', description: '정확하게 과녁을 맞춰라', icon: 'gps_fixed', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-500/10' },
    { title: '체커', description: '점프로 상대를 잡아라', icon: 'grid_view', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-500/10' },
    { title: '솔리테어', description: '클래식 카드 정리 게임', icon: 'style', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-500/10' },
    { title: '프리셀', description: '모든 카드가 보이는 전략 게임', icon: 'view_column', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-500/10' },
    { title: '당구', description: '2D 당구 시뮬레이션', icon: 'sports_baseball', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', accentColor: 'bg-emerald-600', cornerAccentColor: 'bg-emerald-500/10' },
    { title: '바둑', description: 'AI와 고대 전략 대결', icon: 'blur_on', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-700', cornerAccentColor: 'bg-slate-500/10' },
    { title: '루빅스 큐브', description: '3D 큐브 퍼즐 도전', icon: 'view_in_ar', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-600', cornerAccentColor: 'bg-purple-500/10' },
    // New Wave 3 - Board Games
    { title: '오셀로', description: '돌을 뒤집어 영역을 차지하라', icon: 'radio_button_checked', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-600/10' },
    { title: '커넥트4', description: '4개를 연속으로 만들어라', icon: 'view_week', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', accentColor: 'bg-blue-600', cornerAccentColor: 'bg-blue-600/10' },
    { title: '배틀쉽', description: '적 함대를 격침시켜라', icon: 'directions_boat', color: 'text-slate-700 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-900/30', accentColor: 'bg-slate-600', cornerAccentColor: 'bg-slate-600/10' },
    { title: '요트', description: '주사위로 최고 점수를 만들어라', icon: 'casino', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-600', cornerAccentColor: 'bg-amber-600/10' },
    { title: '도미노', description: 'AI와 숫자 매칭 대결', icon: 'view_carousel', color: 'text-slate-800 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-800/50', accentColor: 'bg-slate-700', cornerAccentColor: 'bg-slate-600/10' },
    { title: '사이먼', description: '패턴을 기억하고 따라하세요', icon: 'blur_circular', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', accentColor: 'bg-purple-600', cornerAccentColor: 'bg-purple-600/10' },
    { title: '단어 찾기', description: '숨겨진 단어를 드래그해서 찾아라', icon: 'search', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', accentColor: 'bg-green-600', cornerAccentColor: 'bg-green-600/10' },
    { title: '스피드 카드', description: '빠르게 카드를 매칭하라', icon: 'bolt', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', accentColor: 'bg-orange-600', cornerAccentColor: 'bg-orange-600/10' },
    { title: '장기', description: '한국 전통 보드게임', icon: 'castle', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', accentColor: 'bg-amber-700', cornerAccentColor: 'bg-amber-600/10' },
    { title: '마작 솔리테어', description: '같은 타일을 매칭하여 제거', icon: 'extension', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/30', accentColor: 'bg-rose-600', cornerAccentColor: 'bg-rose-600/10' },
    { title: '카드 전쟁', description: '높은 카드로 상대를 이겨라', icon: 'military_tech', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', accentColor: 'bg-red-600', cornerAccentColor: 'bg-red-600/10' },
];

// --- 카테고리 ---
type GameCategory = '보드' | '카드' | '아케이드' | '퍼즐' | '챌린지';
type GameFilter = '전체' | '최근' | GameCategory;

const categoryOf: Record<string, GameCategory> = {
    '체스': '보드', '틱택토': '보드', '오목': '보드', '체커': '보드', '바둑': '보드',
    '오셀로': '보드', '커넥트4': '보드', '배틀쉽': '보드', '도미노': '보드', '장기': '보드',
    '포커': '카드', '고스톱': '카드', '블랙잭': '카드', '솔리테어': '카드',
    '프리셀': '카드', '스피드 카드': '카드', '카드 전쟁': '카드',
    '스네이크': '아케이드', '테트리스': '아케이드', '팩맨': '아케이드', '브레이크아웃': '아케이드',
    '핑퐁': '아케이드', '플래피버드': '아케이드', '스페이스 인베이더': '아케이드',
    '점프 다이노': '아케이드', '다트': '아케이드', '당구': '아케이드', '요트': '아케이드',
    '2048': '퍼즐', '지뢰찾기': '퍼즐', '스도쿠': '퍼즐', '카드 뒤집기': '퍼즐',
    '단어 퍼즐': '퍼즐', '행맨': '퍼즐', '슬라이딩 퍼즐': '퍼즐', '루빅스 큐브': '퍼즐',
    '단어 찾기': '퍼즐', '마작 솔리테어': '퍼즐',
    '반응속도': '챌린지', '타자연습': '챌린지', '퀴즈': '챌린지', '암산': '챌린지', '사이먼': '챌린지',
};
const filters: GameFilter[] = ['전체', '최근', '보드', '카드', '아케이드', '퍼즐', '챌린지'];

// --- 플레이 통계 (localStorage) ---
type PlayStat = { count: number; last: number };
const STATS_KEY = 'gamezone-stats';
const loadStats = (): Record<string, PlayStat> => {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { return {}; }
};
const bumpStat = (title: string) => {
    const stats = loadStats();
    stats[title] = { count: (stats[title]?.count ?? 0) + 1, last: Date.now() };
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* 용량 초과 무시 */ }
    return stats;
};

const gameLink = (title: string) => `${window.location.origin}/gamezone?game=${encodeURIComponent(title)}`;

// --- Game 1: Snake (Canvas) ---
const SnakeGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);
    const [nickname, setNickname] = useState('');
    const [saved, setSaved] = useState(false);

    const gridSize = 20;
    const gameStateRef = useRef({
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        dir: { x: 0, y: 0 },
        nextDir: { x: 0, y: 0 },
        lastMoveTime: 0,
        moveInterval: 100,
    });

    const resetGame = () => {
        gameStateRef.current = {
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 },
            dir: { x: 0, y: 0 },
            nextDir: { x: 0, y: 0 },
            lastMoveTime: 0,
            moveInterval: 100,
        };
        setScore(0);
        setGameOver(false);
        setStarted(false);
        setSaved(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;

        const draw = (timestamp: number) => {
            const cellSize = canvas.width / gridSize;

            // 게임 로직 업데이트 (고정 시간 간격)
            if (state.dir.x !== 0 || state.dir.y !== 0) {
                if (timestamp - state.lastMoveTime > state.moveInterval) {
                    state.dir = state.nextDir;
                    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };

                    // 충돌 검사
                    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
                        state.snake.some(s => s.x === head.x && s.y === head.y)) {
                        setGameOver(true);
                        return;
                    }

                    state.snake.unshift(head);
                    if (head.x === state.food.x && head.y === state.food.y) {
                        setScore(s => s + 10);
                        // 먹이가 뱀 몸 위에 스폰되지 않도록 빈 칸에서만 선택
                        const free: { x: number; y: number }[] = [];
                        for (let fy = 0; fy < gridSize; fy++) {
                            for (let fx = 0; fx < gridSize; fx++) {
                                if (!state.snake.some(s => s.x === fx && s.y === fy)) free.push({ x: fx, y: fy });
                            }
                        }
                        if (free.length === 0) {
                            // 보드를 다 채움 = 클리어
                            setGameOver(true);
                            return;
                        }
                        state.food = free[Math.floor(Math.random() * free.length)];
                        state.moveInterval = Math.max(50, state.moveInterval - 2);
                    } else {
                        state.snake.pop();
                    }
                    state.lastMoveTime = timestamp;
                }
            }

            // 배경 그리기
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 그리드 패턴
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
            }

            // 뱀 그리기 (부드러운 곡선)
            if (state.snake.length > 0) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // 몸통 그리기
                for (let i = state.snake.length - 1; i >= 0; i--) {
                    const seg = state.snake[i];
                    const x = seg.x * cellSize + cellSize / 2;
                    const y = seg.y * cellSize + cellSize / 2;
                    const radius = cellSize * 0.4;

                    // 그라데이션 색상 (머리부터 꼬리까지)
                    const hue = 140 + (i / state.snake.length) * 20;
                    const lightness = 45 - (i / state.snake.length) * 15;
                    ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;

                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // 몸통 연결
                    if (i < state.snake.length - 1) {
                        const next = state.snake[i + 1];
                        ctx.strokeStyle = `hsl(${hue}, 70%, ${lightness}%)`;
                        ctx.lineWidth = cellSize * 0.7;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(next.x * cellSize + cellSize / 2, next.y * cellSize + cellSize / 2);
                        ctx.stroke();
                    }
                }

                // 머리 특별 스타일
                const head = state.snake[0];
                const hx = head.x * cellSize + cellSize / 2;
                const hy = head.y * cellSize + cellSize / 2;

                // 머리 하이라이트
                ctx.fillStyle = '#4ade80';
                ctx.beginPath();
                ctx.arc(hx, hy, cellSize * 0.45, 0, Math.PI * 2);
                ctx.fill();

                // 눈
                const eyeOffset = cellSize * 0.15;
                const eyeRadius = cellSize * 0.08;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(hx - eyeOffset + state.dir.x * 5, hy - eyeOffset + state.dir.y * 5, eyeRadius, 0, Math.PI * 2);
                ctx.arc(hx + eyeOffset + state.dir.x * 5, hy - eyeOffset + state.dir.y * 5, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(hx - eyeOffset + state.dir.x * 5, hy - eyeOffset + state.dir.y * 5, eyeRadius * 0.5, 0, Math.PI * 2);
                ctx.arc(hx + eyeOffset + state.dir.x * 5, hy - eyeOffset + state.dir.y * 5, eyeRadius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // 사과 그리기
            const fx = state.food.x * cellSize + cellSize / 2;
            const fy = state.food.y * cellSize + cellSize / 2;
            const appleRadius = cellSize * 0.35;

            // 사과 그림자
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(fx, fy + appleRadius * 0.5, appleRadius * 0.8, appleRadius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            // 사과 본체
            const appleGrad = ctx.createRadialGradient(fx - appleRadius * 0.3, fy - appleRadius * 0.3, 0, fx, fy, appleRadius);
            appleGrad.addColorStop(0, '#ff6b6b');
            appleGrad.addColorStop(1, '#dc2626');
            ctx.fillStyle = appleGrad;
            ctx.beginPath();
            ctx.arc(fx, fy, appleRadius, 0, Math.PI * 2);
            ctx.fill();

            // 사과 줄기
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx, fy - appleRadius);
            ctx.quadraticCurveTo(fx + 5, fy - appleRadius - 8, fx + 3, fy - appleRadius - 5);
            ctx.stroke();

            if (!gameOver) {
                animationId = requestAnimationFrame(draw);
            }
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [gameOver]);

    const handleDirection = useCallback((key: string) => {
        const state = gameStateRef.current;
        if (!started) setStarted(true);
        switch (key) {
            case 'ArrowUp': if (state.dir.y !== 1) { state.nextDir = { x: 0, y: -1 }; if (state.dir.x === 0 && state.dir.y === 0) state.dir = state.nextDir; } break;
            case 'ArrowDown': if (state.dir.y !== -1) { state.nextDir = { x: 0, y: 1 }; if (state.dir.x === 0 && state.dir.y === 0) state.dir = state.nextDir; } break;
            case 'ArrowLeft': if (state.dir.x !== 1) { state.nextDir = { x: -1, y: 0 }; if (state.dir.x === 0 && state.dir.y === 0) state.dir = state.nextDir; } break;
            case 'ArrowRight': if (state.dir.x !== -1) { state.nextDir = { x: 1, y: 0 }; if (state.dir.x === 0 && state.dir.y === 0) state.dir = state.nextDir; } break;
        }
    }, [started]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                handleDirection(e.key);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleDirection]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-4 text-2xl font-bold dark:text-white">점수: <span className="text-emerald-400">{score}</span></div>
            <div className="relative w-full max-w-[70vh] aspect-square">
                <canvas ref={canvasRef} width={400} height={400} className="w-full h-full rounded-xl shadow-2xl border-4 border-slate-600" />
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white rounded-xl backdrop-blur-sm p-6 z-10">
                        <div className="text-4xl font-bold mb-2">게임 오버!</div>
                        <div className="text-xl mb-4 text-emerald-400">최종 점수: {score}</div>
                        {!saved ? (
                            <div className="flex flex-col gap-2 mb-4 w-full max-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="닉네임 (랭킹 등록)"
                                    className="px-3 py-2 rounded text-black font-bold outline-none ring-2 ring-emerald-500"
                                    maxLength={8}
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        if (nickname.trim()) {
                                            saveGameScore('스네이크', nickname, score);
                                            setSaved(true);
                                        }
                                    }}
                                    className="px-4 py-2 bg-emerald-600 rounded font-bold hover:bg-emerald-500"
                                >
                                    랭킹 등록
                                </button>
                            </div>
                        ) : (
                            <div className="mb-6 text-emerald-400 font-bold">✨ 랭킹 등록 완료!</div>
                        )}
                        <button onClick={resetGame} className="px-8 py-3 bg-emerald-500 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all hover:scale-105">다시 시작</button>
                    </div>
                )}
                {!started && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xl font-bold animate-pulse text-center p-4">방향키 또는 화면 버튼으로<br />시작하세요</div>
                )}
            </div>
            <MobileControls
                type="dpad"
                onUp={() => handleDirection('ArrowUp')}
                onDown={() => handleDirection('ArrowDown')}
                onLeft={() => handleDirection('ArrowLeft')}
                onRight={() => handleDirection('ArrowRight')}
            />
        </div>
    );
};

// --- Game 2: Tetris (Simplified) ---
const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
    O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
};
type TetrominoKey = keyof typeof TETROMINOS;

const TetrisGame = () => {
    const rows = 20, cols = 10;
    const createBoard = () => Array.from({ length: rows }, () => Array(cols).fill(0));
    const [board, setBoard] = useState(createBoard());
    const [currPiece, setCurrPiece] = useState<{ shape: number[][], color: string, x: number, y: number } | null>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const checkCollision = (piece: any, x: number, y: number, boardState: any) => {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const newX = x + c;
                    const newY = y + r;
                    if (newX < 0 || newX >= cols || newY >= rows) return true;
                    if (newY >= 0 && boardState[newY][newX]) return true;
                }
            }
        }
        return false;
    };

    const spawnPiece = (boardState = board) => {
        const keys = Object.keys(TETROMINOS) as TetrominoKey[];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const piece = TETROMINOS[key];
        const newPiece = { ...piece, x: Math.floor(cols / 2) - 1, y: 0 };
        if (checkCollision(newPiece, newPiece.x, newPiece.y, boardState)) {
            setCurrPiece(null);
            setGameOver(true);
        } else {
            setCurrPiece(newPiece);
        }
    };

    const mergeBoard = () => {
        if (!currPiece) return;
        const newBoard = board.map(row => [...row]);
        currPiece.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    const by = currPiece.y + r;
                    const bx = currPiece.x + c;
                    if (by >= 0 && by < rows && bx >= 0 && bx < cols) newBoard[by][bx] = currPiece.color;
                }
            });
        });

        let cleared = 0;
        for (let r = rows - 1; r >= 0; r--) {
            if (newBoard[r].every(cell => cell !== 0)) {
                newBoard.splice(r, 1);
                newBoard.unshift(Array(cols).fill(0));
                cleared++;
                r++;
            }
        }
        setScore(src => src + cleared * 100);
        setBoard(newBoard);
        spawnPiece(newBoard);
    };

    const move = (dirX: number, dirY: number) => {
        if (!currPiece || gameOver) return;
        if (!checkCollision(currPiece, currPiece.x + dirX, currPiece.y + dirY, board)) {
            setCurrPiece({ ...currPiece, x: currPiece.x + dirX, y: currPiece.y + dirY });
        } else if (dirY > 0) {
            mergeBoard();
        }
    };

    const rotate = () => {
        if (!currPiece || gameOver) return;
        const rotated = currPiece.shape[0].map((_, i) => currPiece.shape.map(row => row[i]).reverse());
        const newPiece = { ...currPiece, shape: rotated };
        if (!checkCollision(newPiece, newPiece.x, newPiece.y, board)) setCurrPiece(newPiece);
    };

    useEffect(() => { if (!currPiece && !gameOver) spawnPiece(); }, []);

    useEffect(() => {
        const timer = setInterval(() => move(0, 1), 500);
        return () => clearInterval(timer);
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
            if (gameOver) return;
            switch (e.key) {
                case 'ArrowLeft': move(-1, 0); break;
                case 'ArrowRight': move(1, 0); break;
                case 'ArrowDown': move(0, 1); break;
                case 'ArrowUp': rotate(); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currPiece, board, gameOver]);

    // Render helper
    const getCell = (r: number, c: number) => {
        if (currPiece) {
            const pr = r - currPiece.y;
            const pc = c - currPiece.x;
            if (pr >= 0 && pr < currPiece.shape.length && pc >= 0 && pc < currPiece.shape[0].length && currPiece.shape[pr][pc]) {
                return currPiece.color;
            }
        }
        return board[r][c];
    };

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-4 text-xl font-bold dark:text-white">점수: {score}</div>
            <div className="bg-slate-900 border-8 border-slate-700 grid grid-rows-[repeat(20,minmax(0,1fr))] gap-px rounded-xl shadow-2xl overflow-hidden aspect-[1/2]" style={{ height: 'min(60vh, 600px)' }}>
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-px">
                        {Array.from({ length: cols }).map((_, c) => {
                            const color = getCell(r, c);
                            return <div key={c} className={`w-full h-full ${color || 'bg-slate-800'}`} />;
                        })}
                    </div>
                ))}
            </div>

            {gameOver && <button onClick={() => { setBoard(createBoard()); setScore(0); setGameOver(false); setCurrPiece(null); }} className="mt-6 px-6 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-colors">다시 시작</button>}

            <MobileControls
                type="dpad"
                onUp={rotate}
                onDown={() => move(0, 1)}
                onLeft={() => move(-1, 0)}
                onRight={() => move(1, 0)}
            />
        </div >
    );
};

// --- Game 3: 2048 ---
const Game2048 = () => {
    const [grid, setGrid] = useState<number[][]>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [keepPlaying, setKeepPlaying] = useState(false);

    const initGame = () => {
        const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandom(newGrid);
        addRandom(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
        setWon(false);
        setKeepPlaying(false);
    };

    const addRandom = (g: number[][]) => {
        const empty = [];
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (g[r][c] === 0) empty.push({ r, c });
        if (empty.length > 0) {
            const { r, c } = empty[Math.floor(Math.random() * empty.length)];
            g[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const slide = (row: number[]) => {
        let arr = row.filter(val => val);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                setScore(s => s + arr[i]);
                arr.splice(i + 1, 1);
            }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
    };

    const move = (dir: string) => {
        if (gameOver) return;
        let newGrid = grid.map(r => [...r]);
        let moved = false;

        if (dir === 'ArrowLeft' || dir === 'ArrowRight') {
            for (let r = 0; r < 4; r++) {
                const newRow = slide(dir === 'ArrowLeft' ? newGrid[r] : newGrid[r].reverse());
                if (dir === 'ArrowRight') newRow.reverse();
                if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
                newGrid[r] = newRow;
            }
        } else {
            for (let c = 0; c < 4; c++) {
                let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                const newCol = slide(dir === 'ArrowUp' ? col : col.reverse());
                if (dir === 'ArrowDown') newCol.reverse();
                if (col.join(',') !== newCol.join(',')) moved = true;
                for (let r = 0; r < 4; r++) newGrid[r][c] = newCol[r];
            }
        }

        if (moved) {
            addRandom(newGrid);
            setGrid(newGrid);
            // 승리 체크 (2048 달성, 계속하기 전까지 표시)
            if (!won && !keepPlaying && newGrid.flat().includes(2048)) {
                setWon(true);
            }
            // 게임오버: 빈칸 없고 상하좌우 합칠 수 있는 인접 타일도 없음
            if (!newGrid.flat().includes(0)) {
                let canMerge = false;
                for (let r = 0; r < 4 && !canMerge; r++) {
                    for (let c = 0; c < 4 && !canMerge; c++) {
                        if (c < 3 && newGrid[r][c] === newGrid[r][c + 1]) canMerge = true;
                        if (r < 3 && newGrid[r][c] === newGrid[r + 1][c]) canMerge = true;
                    }
                }
                if (!canMerge) setGameOver(true);
            }
        }
    };

    useEffect(() => { initGame(); }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                move(e.key);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [grid, gameOver]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-4 text-2xl font-bold dark:text-white">점수: <span className="text-amber-500">{score}</span></div>
            <div className="relative bg-stone-500 p-3 rounded-xl w-full max-w-[60vh] aspect-square shadow-2xl">
                {(gameOver || (won && !keepPlaying)) && (
                    <div className="absolute inset-0 z-10 bg-black/70 rounded-xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                        <div className="text-4xl">{won ? '🎉' : '😵'}</div>
                        <div className="text-2xl font-black text-white">{won ? '2048 달성!' : '게임 오버'}</div>
                        <div className="text-amber-400 font-bold">점수: {score}</div>
                        <div className="flex gap-3">
                            {won && (
                                <button onClick={() => setKeepPlaying(true)} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-400">
                                    계속하기
                                </button>
                            )}
                            <button onClick={initGame} className="px-5 py-2.5 bg-stone-600 text-white rounded-xl font-bold hover:bg-stone-500">
                                새 게임
                            </button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
                    {grid.flat().map((val, i) => (
                        <div key={i} className={`rounded-lg flex items-center justify-center font-bold
                            ${val < 100 ? 'text-3xl md:text-4xl' : val < 1000 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}
                            ${val === 0 ? 'bg-stone-400' :
                                val === 2 ? 'bg-stone-200 text-stone-700' :
                                    val === 4 ? 'bg-stone-300 text-stone-700' :
                                        val === 8 ? 'bg-orange-300 text-white' :
                                            val === 16 ? 'bg-orange-400 text-white' :
                                                val === 32 ? 'bg-orange-500 text-white' :
                                                    val === 64 ? 'bg-orange-600 text-white' :
                                                        val === 128 ? 'bg-yellow-400 text-white' :
                                                            val === 256 ? 'bg-yellow-500 text-white' :
                                                                val === 512 ? 'bg-yellow-600 text-white' :
                                                                    val === 1024 ? 'bg-amber-500 text-white' :
                                                                        'bg-amber-600 text-white shadow-lg'}`}>
                            {val || ''}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={initGame} className="mt-6 px-6 py-2 bg-stone-600 text-white rounded-lg font-bold hover:bg-stone-700 transition-colors">새 게임</button>
            <MobileControls
                type="dpad"
                onUp={() => move('ArrowUp')}
                onDown={() => move('ArrowDown')}
                onLeft={() => move('ArrowLeft')}
                onRight={() => move('ArrowRight')}
            />
        </div>
    );
};

// --- Game 4: Minesweeper ---
const Minesweeper = () => {
    const size = 10;
    const minesCount = 10;
    type Cell = { isMine: boolean, isOpen: boolean, isFlag: boolean, count: number };
    const [board, setBoard] = useState<Cell[][]>([]);
    const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [flagMode, setFlagMode] = useState(false);
    const [minesPlaced, setMinesPlaced] = useState(false);

    // 첫 클릭한 칸과 그 주변에는 지뢰를 심지 않음 (첫 클릭 안전)
    const plantMines = (b: Cell[][], safeR: number, safeC: number) => {
        const candidates: [number, number][] = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
                candidates.push([r, c]);
            }
        }
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        for (let i = 0; i < minesCount; i++) {
            const [r, c] = candidates[i];
            b[r][c].isMine = true;
        }
        // 숫자 계산
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!b[r][c].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                        if (r + dr >= 0 && r + dr < size && c + dc >= 0 && c + dc < size && b[r + dr][c + dc].isMine) count++;
                    }
                    b[r][c].count = count;
                }
            }
        }
    };

    const initGame = () => {
        const newBoard: Cell[][] = Array(size).fill(0).map(() => Array(size).fill(0).map(() => ({ isMine: false, isOpen: false, isFlag: false, count: 0 })));
        setBoard(newBoard);
        setMinesPlaced(false);
        setStatus('playing');
    };

    const flagCount = board.flat().filter(c => c.isFlag).length;

    const reveal = (r: number, c: number) => {
        if (status !== 'playing' || board[r][c].isOpen || board[r][c].isFlag) return;
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        if (!minesPlaced) {
            plantMines(newBoard, r, c);
            setMinesPlaced(true);
        }
        if (newBoard[r][c].isMine) {
            setStatus('lost');
            newBoard[r][c].isOpen = true; // Show boom
        } else {
            floodFill(newBoard, r, c);
            // Check win
            let covered = 0;
            newBoard.forEach(row => row.forEach(cell => { if (!cell.isOpen && !cell.isMine) covered++; }));
            if (covered === 0 && newBoard.flat().filter(c => !c.isOpen).length === minesCount) setStatus('won');
        }
        setBoard(newBoard);
    };

    const floodFill = (b: Cell[][], r: number, c: number) => {
        if (r < 0 || r >= size || c < 0 || c >= size || b[r][c].isOpen || b[r][c].isFlag) return;
        b[r][c].isOpen = true;
        if (b[r][c].count === 0) {
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) floodFill(b, r + dr, c + dc);
        }
    };

    const toggleFlag = (e: React.MouseEvent | React.TouchEvent, r: number, c: number) => {
        if (e && e.preventDefault) e.preventDefault();
        if (status !== 'playing' || board[r][c].isOpen) return;
        const newBoard = board.map(row => [...row]);
        newBoard[r][c].isFlag = !newBoard[r][c].isFlag;
        setBoard(newBoard);
    };

    const handleCellClick = (r: number, c: number) => {
        if (flagMode) {
            // Mock event object for reuse
            toggleFlag({ preventDefault: () => { } } as any, r, c);
        } else {
            reveal(r, c);
        }
    };

    useEffect(() => { initGame(); }, []);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className={`mb-4 text-2xl font-bold ${status === 'won' ? 'text-green-500' : status === 'lost' ? 'text-red-500' : 'dark:text-white'}`}>
                {status === 'playing' ? `💣 ${minesCount - flagCount}` : status === 'won' ? '승리!' : '게임 오버'}
            </div>
            <div className="bg-slate-300 dark:bg-slate-600 p-2 rounded-xl w-full max-w-[60vh] aspect-square shadow-xl">
                <div className="grid grid-cols-10 grid-rows-10 gap-1 w-full h-full">
                    {board.map((row, r) => row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            onContextMenu={(e) => toggleFlag(e, r, c)}
                            className={`flex items-center justify-center font-bold text-sm md:text-base cursor-pointer select-none rounded touch-manipulation
                                ${cell.isOpen
                                    ? (cell.isMine ? 'bg-red-500' : 'bg-slate-100 dark:bg-slate-700')
                                    : 'bg-slate-400 dark:bg-slate-500 hover:bg-slate-500 dark:hover:bg-slate-400 shadow-sm'}
                                ${cell.isOpen && !cell.isMine ? (
                                    cell.count === 1 ? 'text-blue-600' :
                                        cell.count === 2 ? 'text-green-600' :
                                            cell.count === 3 ? 'text-red-600' :
                                                cell.count >= 4 ? 'text-purple-600' : ''
                                ) : ''}
                            `}
                        >
                            {cell.isOpen ? (cell.isMine ? '💣' : (cell.count || '')) : (cell.isFlag ? '🚩' : '')}
                        </div>
                    )))}
                </div>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => setFlagMode(!flagMode)}
                    className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center gap-2
                        ${flagMode
                            ? 'bg-red-500 text-white ring-4 ring-red-200'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white'}`}
                >
                    {flagMode ? '🚩 깃발 모드 (터치)' : '⛏️ 굴착 모드 (터치)'}
                </button>
                <button onClick={initGame} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg active:scale-95">😊 새 게임</button>
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">PC: 좌클릭 열기 / 우클릭 깃발</div>
            <button onClick={initGame} className="mt-4 px-6 py-2 bg-slate-600 text-white rounded font-bold hover:bg-slate-700 transition-colors">다시 시작</button>
        </div>
    );
};

// --- Game 5: Sudoku ---
const SUDOKU_PUZZLES: { initial: number[][]; solution: number[][] }[] = [
    {
        initial: [
            [5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3], [4, 0, 0, 8, 0, 3, 0, 0, 1], [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0], [0, 0, 0, 4, 1, 9, 0, 0, 5], [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        solution: [
            [5, 3, 4, 6, 7, 8, 9, 1, 2], [6, 7, 2, 1, 9, 5, 3, 4, 8], [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3], [4, 2, 6, 8, 5, 3, 7, 9, 1], [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4], [2, 8, 7, 4, 1, 9, 6, 3, 5], [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ]
    },
    {
        initial: [
            [0, 0, 0, 2, 6, 0, 7, 0, 1], [6, 8, 0, 0, 7, 0, 0, 9, 0], [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0], [0, 0, 4, 6, 0, 2, 9, 0, 0], [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4], [0, 4, 0, 0, 5, 0, 0, 3, 6], [7, 0, 3, 0, 1, 8, 0, 0, 0]
        ],
        solution: [
            [4, 3, 5, 2, 6, 9, 7, 8, 1], [6, 8, 2, 5, 7, 1, 4, 9, 3], [1, 9, 7, 8, 3, 4, 5, 6, 2],
            [8, 2, 6, 1, 9, 5, 3, 4, 7], [3, 7, 4, 6, 8, 2, 9, 1, 5], [9, 5, 1, 7, 4, 3, 6, 2, 8],
            [5, 1, 9, 3, 2, 6, 8, 7, 4], [2, 4, 8, 9, 5, 7, 1, 3, 6], [7, 6, 3, 4, 1, 8, 2, 5, 9]
        ]
    },
    {
        initial: [
            [0, 2, 0, 6, 0, 8, 0, 0, 0], [5, 8, 0, 0, 0, 9, 7, 0, 0], [0, 0, 0, 0, 4, 0, 0, 0, 0],
            [3, 7, 0, 0, 0, 0, 5, 0, 0], [6, 0, 0, 0, 0, 0, 0, 0, 4], [0, 0, 8, 0, 0, 0, 0, 1, 3],
            [0, 0, 0, 0, 2, 0, 0, 0, 0], [0, 0, 9, 8, 0, 0, 0, 3, 6], [0, 0, 0, 3, 0, 6, 0, 9, 0]
        ],
        solution: [
            [1, 2, 3, 6, 7, 8, 9, 4, 5], [5, 8, 4, 2, 3, 9, 7, 6, 1], [9, 6, 7, 1, 4, 5, 3, 2, 8],
            [3, 7, 2, 4, 6, 1, 5, 8, 9], [6, 9, 1, 5, 8, 3, 2, 7, 4], [4, 5, 8, 7, 9, 2, 6, 1, 3],
            [8, 3, 6, 9, 2, 4, 1, 5, 7], [2, 1, 9, 8, 5, 7, 4, 3, 6], [7, 4, 5, 3, 1, 6, 8, 9, 2]
        ]
    },
    {
        initial: [
            [0, 0, 0, 6, 0, 0, 4, 0, 0], [7, 0, 0, 0, 0, 3, 6, 0, 0], [0, 0, 0, 0, 9, 1, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 5, 0, 1, 8, 0, 0, 0, 3], [0, 0, 0, 3, 0, 6, 0, 4, 5],
            [0, 4, 0, 2, 0, 0, 0, 6, 0], [9, 0, 3, 0, 0, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ],
        solution: [
            [5, 8, 1, 6, 7, 2, 4, 3, 9], [7, 9, 2, 8, 4, 3, 6, 5, 1], [3, 6, 4, 5, 9, 1, 7, 8, 2],
            [4, 3, 8, 9, 5, 7, 2, 1, 6], [2, 5, 6, 1, 8, 4, 9, 7, 3], [1, 7, 9, 3, 2, 6, 8, 4, 5],
            [8, 4, 5, 2, 1, 9, 3, 6, 7], [9, 1, 3, 7, 6, 8, 5, 2, 4], [6, 2, 7, 4, 3, 5, 1, 9, 8]
        ]
    },
    {
        initial: [
            [1, 0, 0, 4, 8, 9, 0, 0, 6], [7, 3, 0, 0, 0, 0, 0, 4, 0], [0, 0, 0, 0, 0, 1, 2, 9, 5],
            [0, 0, 7, 1, 2, 0, 6, 0, 0], [5, 0, 0, 7, 0, 3, 0, 0, 8], [0, 0, 6, 0, 9, 5, 7, 0, 0],
            [9, 1, 4, 6, 0, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0, 0, 3, 7], [8, 0, 0, 5, 1, 2, 0, 0, 4]
        ],
        solution: [
            [1, 5, 2, 4, 8, 9, 3, 7, 6], [7, 3, 9, 2, 5, 6, 8, 4, 1], [4, 6, 8, 3, 7, 1, 2, 9, 5],
            [3, 8, 7, 1, 2, 4, 6, 5, 9], [5, 9, 1, 7, 6, 3, 4, 2, 8], [2, 4, 6, 8, 9, 5, 7, 1, 3],
            [9, 1, 4, 6, 3, 7, 5, 8, 2], [6, 2, 5, 9, 4, 8, 1, 3, 7], [8, 7, 3, 5, 1, 2, 9, 6, 4]
        ]
    },
];

const Sudoku = () => {
    const [puzzle, setPuzzle] = useState(() => SUDOKU_PUZZLES[Math.floor(Math.random() * SUDOKU_PUZZLES.length)]);
    const [board, setBoard] = useState<number[][]>(() => puzzle.initial.map(r => [...r]));
    const [check, setCheck] = useState('');
    const [solved, setSolved] = useState(false);
    const initial = puzzle.initial;
    const solution = puzzle.solution;

    const newGame = () => {
        const next = SUDOKU_PUZZLES[Math.floor(Math.random() * SUDOKU_PUZZLES.length)];
        setPuzzle(next);
        setBoard(next.initial.map(r => [...r]));
        setCheck('');
        setSolved(false);
    };

    const handleChange = (r: number, c: number, val: string) => {
        if (solved || initial[r][c] !== 0) return;
        const num = parseInt(val) || 0;
        if (num >= 0 && num <= 9) {
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = num;
            setBoard(newBoard);
            setCheck('');
        }
    };

    const checkSolution = () => {
        const isCorrect = JSON.stringify(board) === JSON.stringify(solution);
        setCheck(isCorrect ? '정답입니다! 🎉' : '다시 시도해보세요...');
        if (isCorrect) setSolved(true);
    };

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-[60vh] aspect-square">
                <div className="grid grid-cols-9 gap-px bg-slate-800 border-4 border-slate-800 w-full h-full shadow-2xl rounded-lg overflow-hidden">
                    {board.map((row, r) => row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={`w-full h-full relative ${(Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-600'}`}>
                            <input
                                type="text"
                                maxLength={1}
                                numeric-input="true"
                                value={cell === 0 ? '' : cell}
                                onChange={(e) => handleChange(r, c, e.target.value)}
                                className={`w-full h-full text-center text-xl sm:text-2xl md:text-3xl outline-none bg-transparent absolute inset-0
                                    ${initial[r][c] !== 0 ? 'font-bold text-slate-800 dark:text-white' : 'text-blue-600 dark:text-blue-400 font-medium'}`}
                                readOnly={initial[r][c] !== 0}
                            />
                        </div>
                    )))}
                </div>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={checkSolution} disabled={solved} className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">정답 확인</button>
                <button onClick={newGame} className="px-8 py-3 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors">새 퍼즐</button>
            </div>
            {check && <div className={`mt-3 font-bold text-xl ${solved ? 'text-green-500' : 'text-slate-500'}`}>{check}</div>}
        </div>
    );
};

// --- Game 6: Memory Match ---
const MemoryMatch = () => {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    type Card = { id: number, val: string, flipped: boolean, matched: boolean };
    const [cards, setCards] = useState<Card[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);

    const initGame = () => {
        const items = [...emojis, ...emojis];
        // Fisher-Yates 셔플 (sort 방식은 분포가 치우침)
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setCards(items.map((val, id) => ({ id, val, flipped: false, matched: false })));
        setFlipped([]);
        setMoves(0);
    };

    useEffect(() => { initGame(); }, []);

    const handleFlip = (id: number) => {
        if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
        const newCards = [...cards];
        newCards[id].flipped = true;
        setCards(newCards);
        setFlipped([...flipped, id]);

        if (flipped.length === 1) {
            setMoves(m => m + 1);
            const firstId = flipped[0];
            if (newCards[firstId].val === newCards[id].val) {
                newCards[firstId].matched = true;
                newCards[id].matched = true;
                setCards(newCards);
                setFlipped([]);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstId].flipped = false;
                    resetCards[id].flipped = false; // Note: using current scope var might be stale, but here ok
                    // Better to use functional update to be safe, but for simple demo:
                    setCards(prev => prev.map((c, i) => (i === firstId || i === id) ? { ...c, flipped: false } : c));
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    const allMatched = cards.length > 0 && cards.every(c => c.matched);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-4 text-xl font-bold dark:text-white">시도 횟수: {moves}</div>
            {allMatched && (
                <div className="mb-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg animate-bounce">
                    🎉 모두 찾았습니다! {moves}번 만에 클리어!
                </div>
            )}
            <div className="grid grid-cols-4 gap-4 w-full max-w-[60vh] aspect-square p-2">
                {cards.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => handleFlip(c.id)}
                        className={`w-full h-full rounded-2xl flex items-center justify-center text-4xl sm:text-6xl cursor-pointer transition-all duration-500 transform
                            ${c.flipped || c.matched ? 'bg-white dark:bg-slate-700 rotate-y-180 border-4 border-pink-200 dark:border-slate-500' : 'bg-pink-500 hover:bg-pink-600 shadow-lg'}
                            relative`}
                    >
                        <div className={`transition-opacity duration-300 ${c.flipped || c.matched ? 'opacity-100' : 'opacity-0'}`}>{c.val}</div>
                    </div>
                ))}
            </div>
            <button onClick={initGame} className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors">다시 시작</button>
        </div>
    );
};

// --- Game 7: Tic Tac Toe ---
const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [isAiThinking, setIsAiThinking] = useState(false); // Prevent rapid clicks
    const winner = calculateWinner(board);

    function calculateWinner(squares: any[]) {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return null;
    }

    const handleClick = (i: number) => {
        // Block if: cell occupied, game over, not player's turn, AI is thinking
        if (board[i] || winner || !isXNext || isAiThinking) return;
        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
        setIsAiThinking(true);
    };

    // 미니맥스 AI — 최적 수를 찾되 15% 확률로 실수 (이길 기회 제공)
    const minimax = (squares: any[], isMaximizing: boolean, depth: number): number => {
        const w = calculateWinner(squares);
        if (w === 'O') return 10 - depth;
        if (w === 'X') return depth - 10;
        if (squares.every(s => s !== null)) return 0;

        let best = isMaximizing ? -Infinity : Infinity;
        for (let i = 0; i < 9; i++) {
            if (squares[i] === null) {
                squares[i] = isMaximizing ? 'O' : 'X';
                const score = minimax(squares, !isMaximizing, depth + 1);
                squares[i] = null;
                best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
            }
        }
        return best;
    };

    const findBestMove = (): number => {
        const emptyIndices = board.map((bs, i) => bs === null ? i : -1).filter(i => i !== -1);
        // 가끔 실수
        if (Math.random() < 0.15) {
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
        let bestScore = -Infinity;
        let bestMove = emptyIndices[0];
        for (const i of emptyIndices) {
            const copy = [...board];
            copy[i] = 'O';
            const score = minimax(copy, false, 0);
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
        return bestMove;
    };

    // AI Turn
    useEffect(() => {
        if (!isXNext && !winner && board.some(x => x === null) && isAiThinking) {
            const timer = setTimeout(() => {
                const moveIdx = findBestMove();
                if (moveIdx !== undefined) {
                    const newBoard = [...board];
                    newBoard[moveIdx] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                    setIsAiThinking(false);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, winner, board, isAiThinking]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-8 text-2xl font-bold dark:text-white">
                {winner ? `승자: ${winner}` : board.every(Boolean) ? '무승부!' : `차례: ${isXNext ? '당신 (X)' : 'AI (O)'}`}
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs sm:max-w-sm aspect-square">
                {board.map((val, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        disabled={!isXNext || isAiThinking || !!board[i] || !!winner}
                        className={`aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-2xl text-5xl sm:text-6xl font-black flex items-center justify-center shadow-md transition-all
                            ${val === 'X' ? 'text-blue-500' : 'text-red-500'}
                            ${!isXNext || isAiThinking ? 'cursor-not-allowed opacity-80' : 'hover:shadow-lg cursor-pointer'}`}
                        style={{ minWidth: '80px', minHeight: '80px' }}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <button onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); setIsAiThinking(false); }} className="mt-8 px-8 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors">다시 시작</button>
        </div>
    );
};

// --- Game 8: Word Puzzle ---
const WORDLE_WORDS = [
    'APPLE', 'BRAVE', 'CRANE', 'DREAM', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IVORY', 'JELLY',
    'KNIFE', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STONE', 'TIGER',
    'UNCLE', 'VIVID', 'WATER', 'YOUTH', 'ZEBRA', 'BEACH', 'CHAIR', 'DANCE', 'EARTH', 'FROST',
    'GLASS', 'HEART', 'IMAGE', 'JUICE', 'KOALA', 'LIGHT', 'MUSIC', 'NOVEL', 'ONION', 'PEARL',
    'QUILT', 'ROBIN', 'SUGAR', 'TABLE', 'UMBRA', 'VALUE', 'WHEAT', 'XENON', 'YEAST', 'ZESTY',
    'BLOOM', 'CLOUD', 'DELTA', 'EMBER', 'FAITH', 'GIANT', 'HONEY', 'INPUT', 'JOKER', 'KARMA',
];

const WordPuzzle = () => {
    const [answer, setAnswer] = useState(() => WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    const resetGame = () => {
        setAnswer(WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]);
        setGuesses([]);
        setCurrentGuess('');
        setStatus('playing');
    };

    const handleKey = (key: string) => {
        if (status !== 'playing') return;
        if (key === 'ENTER') {
            if (currentGuess.length !== 5) return;
            const newGuesses = [...guesses, currentGuess];
            setGuesses(newGuesses);
            setCurrentGuess('');
            if (currentGuess === answer) setStatus('won');
            else if (newGuesses.length >= 6) setStatus('lost');
        } else if (key === 'BACK') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    };

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.key === 'Enter') handleKey('ENTER');
            else if (e.key === 'Backspace') handleKey('BACK');
            else {
                const char = e.key.toUpperCase();
                if (char.length === 1 && char >= 'A' && char <= 'Z') handleKey(char);
            }
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [currentGuess, guesses, status]);

    const getBgColor = (char: string, idx: number) => {
        if (answer[idx] === char) return 'bg-green-500 border-green-500 text-white';
        if (answer.includes(char)) return 'bg-yellow-500 border-yellow-500 text-white';
        return 'bg-slate-500 border-slate-500 text-white';
    };

    // 이미 사용한 글자의 결과 (키보드 색상용)
    const letterStatus = (letter: string): 'correct' | 'present' | 'absent' | null => {
        let result: 'correct' | 'present' | 'absent' | null = null;
        for (const g of guesses) {
            for (let i = 0; i < 5; i++) {
                if (g[i] === letter) {
                    if (answer[i] === letter) return 'correct';
                    if (answer.includes(letter)) result = 'present';
                    else if (!result) result = 'absent';
                }
            }
        }
        return result;
    };

    const KEYBOARD_ROWS = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
    ];

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-6 text-2xl font-bold dark:text-white">{status === 'won' ? '정답입니다! 🎉' : status === 'lost' ? `정답: ${answer}` : '단어를 맞춰보세요'}</div>
            <div className="space-y-2 mb-6 w-full max-w-sm">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2 justify-center">
                        {[...Array(5)].map((_, j) => {
                            const isCurrent = i === guesses.length;
                            const letter = isCurrent ? currentGuess[j] : guesses[i]?.[j];
                            const bg = !isCurrent && guesses[i] ? getBgColor(letter, j) : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600';
                            return (
                                <div key={j} className={`w-14 h-14 sm:w-16 sm:h-16 border-4 rounded-xl font-bold text-3xl sm:text-4xl flex items-center justify-center uppercase ${bg} dark:text-white transition-colors`}>
                                    {letter}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* 화면 키보드 (모바일 지원) */}
            <div className="w-full max-w-lg space-y-1.5 px-2">
                {KEYBOARD_ROWS.map((row, ri) => (
                    <div key={ri} className="flex gap-1.5 justify-center">
                        {row.map(key => {
                            const st = letterStatus(key);
                            const isWide = key === 'ENTER' || key === 'BACK';
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleKey(key)}
                                    className={`${isWide ? 'px-2 sm:px-3' : 'w-8 sm:w-10'} h-12 sm:h-14 rounded-lg font-bold text-sm sm:text-base transition-all active:scale-95
                                        ${st === 'correct' ? 'bg-green-500 text-white'
                                            : st === 'present' ? 'bg-yellow-500 text-white'
                                                : st === 'absent' ? 'bg-slate-600 text-white/60'
                                                    : 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-400'}`}
                                >
                                    {key === 'BACK' ? '⌫' : key === 'ENTER' ? '↵' : key}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {status !== 'playing' && <button onClick={resetGame} className="mt-4 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">다시 도전</button>}
            <p className="text-slate-500 text-sm mt-3">키보드 또는 화면 버튼으로 입력</p>
        </div>
    );
};

// --- Error Boundary: 한 게임이 크래시해도 앱 전체가 죽지 않게 ---
class GameErrorBoundary extends Component<{ children: React.ReactNode; onClose: () => void }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <span className="text-4xl">😵</span>
                    <p className="font-bold text-slate-800 dark:text-white">게임을 불러오지 못했습니다</p>
                    <button onClick={() => { this.setState({ hasError: false }); this.props.onClose(); }} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors">게임 목록으로</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- Main Component ---
const GameZone: React.FC = () => {
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [filter, setFilter] = useState<GameFilter>('전체');
    const [stats, setStats] = useState<Record<string, PlayStat>>(loadStats);
    const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

    // Deep link: /gamezone?game=체스 opens the game directly
    useEffect(() => {
        const title = new URLSearchParams(window.location.search).get('game');
        const match = title && games.find(g => g.title === title);
        if (match) {
            setActiveGame(match);
            logGamePlay(match.title);
            setStats(bumpStat(match.title));
        }
    }, []);

    const copyLink = (e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(gameLink(title)).then(() => {
            setCopiedTitle(title);
            setTimeout(() => setCopiedTitle(null), 1500);
        });
    };

    const openGame = (game: Game) => {
        setActiveGame(game);
        logGamePlay(game.title);
        setStats(bumpStat(game.title));
        window.history.pushState({ game: game.title }, '', `?game=${encodeURIComponent(game.title)}`);
    };
    const closeGame = () => {
        setActiveGame(null);
        window.history.replaceState(null, '', window.location.pathname);
    };

    // ESC key and back button handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeGame) {
                closeGame();
            }
        };
        const handlePopState = () => {
            if (activeGame) {
                closeGame();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [activeGame]);

    const renderGame = () => {
        switch (activeGame?.title) {
            case '체스': return <ChessGameNew />;
            case '포커': return <PokerGame />;
            case '고스톱': return <GoStopGame />;
            case '스네이크': return <SnakeGame />;
            case '테트리스': return <TetrisGame />;
            case '2048': return <Game2048 />;
            case '지뢰찾기': return <Minesweeper />;
            case '스도쿠': return <Sudoku />;
            case '카드 뒤집기': return <MemoryMatch />;
            case '틱택토': return <TicTacToe />;
            case '단어 퍼즐': return <WordPuzzle />;
            case '팩맨': return <PacmanGame />;
            case '브레이크아웃': return <BreakoutGame />;
            case '핑퐁': return <PongGame />;
            case '플래피버드': return <FlappyBirdGame />;
            case '스페이스 인베이더': return <SpaceInvadersGame />;
            case '점프 다이노': return <DinoJumpGame />;
            case '행맨': return <HangmanGame />;
            case '오목': return <GomokuGame />;
            case '반응속도': return <ReactionTest />;
            case '타자연습': return <TypingGame />;
            case '블랙잭': return <BlackjackGame />;
            case '퀴즈': return <QuizGame />;
            case '암산': return <MathGame />;
            case '슬라이딩 퍼즐': return <SlidingPuzzleGame />;
            case '다트': return <DartsGame />;
            case '체커': return <CheckersGame />;
            case '솔리테어': return <SolitaireGame />;
            case '프리셀': return <FreecellGame />;
            case '당구': return <PoolGame />;
            case '바둑': return <GoGame />;
            case '루빅스 큐브': return <RubiksCubeGame />;
            // New Wave 3 Games
            case '오셀로': return <OthelloGame />;
            case '커넥트4': return <ConnectFourGame />;
            case '배틀쉽': return <BattleshipGame />;
            case '요트': return <YachtGame />;
            case '도미노': return <DominoGame />;
            case '사이먼': return <SimonGame />;
            case '단어 찾기': return <WordSearchGame />;
            case '스피드 카드': return <SpeedCardGame />;
            case '장기': return <JanggiGame />;
            case '마작 솔리테어': return <MahjongSolitaireGame />;
            case '카드 전쟁': return <WarCardGame />;
            default: return <div>게임을 찾을 수 없습니다</div>;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden pt-[76px]">
            <main className="flex-grow overflow-hidden relative bg-paper dark:bg-night">
                <div className={`h-full overflow-y-auto p-6 transition-all duration-300 transform ${activeGame ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-violet-600 text-xs font-bold mb-3"><span className="material-icons-round text-sm mr-1">bolt</span> 게임존</div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">나만의 게임 공간, <span className="text-violet-500">즐기고 휴식하세요</span></h2>
                            <p className="text-slate-500 dark:text-slate-400">게임을 선택하면 전체 화면 모드로 시작됩니다.</p>
                        </div>

                        {/* 카테고리 필터 */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                        filter === f
                                            ? 'bg-violet-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(filter === '전체'
                                ? games
                                : filter === '최근'
                                    ? games.filter((g) => stats[g.title]).sort((a, b) => stats[b.title].last - stats[a.title].last)
                                    : games.filter((g) => categoryOf[g.title] === filter)
                            ).map((game) => (
                                <div key={game.title} className={`game-card group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 relative overflow-hidden ${game.isLarge ? 'sm:col-span-2 sm:row-span-2' : ''}`} onClick={() => openGame(game)}>
                                    <div className={`absolute top-0 right-0 ${game.isLarge ? 'w-32 h-32' : 'w-24 h-24'} ${game.cornerAccentColor} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
                                    <div className="relative z-10">
                                        <div className={`${game.isLarge ? 'w-20 h-20' : 'w-14 h-14'} rounded-xl ${game.bgColor} ${game.color} flex items-center justify-center mb-4 group-hover:${game.accentColor} group-hover:text-white transition-colors`}><span className={`material-icons-round ${game.isLarge ? 'text-5xl' : 'text-3xl'}`}>{game.icon}</span></div>
                                        <h3 className={`${game.isLarge ? 'text-2xl' : 'text-lg'} font-bold text-slate-800 dark:text-white mb-1`}>{game.title}</h3>
                                        <p className={`${game.isLarge ? 'text-sm' : 'text-xs'} text-slate-500 dark:text-slate-400`}>{game.description}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                {stats[game.title] ? `${stats[game.title].count}회 플레이` : categoryOf[game.title]}
                                            </span>
                                            <button
                                                onClick={(e) => copyLink(e, game.title)}
                                                aria-label={`${game.title} 링크 복사`}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                                            >
                                                <span className="material-icons-round text-base">{copiedTitle === game.title ? 'check' : 'link'}</span>
                                            </button>
                                        </div>
                                        {game.isLarge && <div className="mt-4 flex items-center gap-2 text-lime-600 dark:text-lime-400 font-medium text-sm"><span className="material-icons-round text-lg">play_arrow</span>플레이하기</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filter === '최근' && !games.some((g) => stats[g.title]) && (
                            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-16">아직 플레이한 게임이 없어요. 게임을 하나 열어보세요!</p>
                        )}
                    </div>
                </div>

                <div className={`absolute inset-0 z-50 bg-[#f9f9fb] dark:bg-[#0f172a] flex flex-col transition-all duration-500 transform ${activeGame ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-500 transition-colors font-medium" onClick={closeGame}><span className="material-icons-round">arrow_back</span><span>게임 목록으로</span></button>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeGame?.title}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeGame && (
                                <button
                                    onClick={(e) => copyLink(e, activeGame.title)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-500 transition-colors"
                                    aria-label="게임 링크 복사"
                                >
                                    <span className="material-icons-round text-base">{copiedTitle === activeGame.title ? 'check' : 'link'}</span>
                                    <span className="hidden sm:inline">{copiedTitle === activeGame.title ? '복사됨' : '링크 복사'}</span>
                                </button>
                            )}
                            <div className="text-sm font-medium text-slate-500 hidden sm:block">ESC 또는 뒤로가기 버튼으로 나가기</div>
                        </div>
                    </div>
                    {/* Game Container: m-auto centers when content fits, top-aligns when it overflows so nothing is clipped */}
                    <div className="flex-1 overflow-auto relative flex px-2 pt-20 pb-40 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-full max-w-7xl m-auto flex items-center justify-center relative">
                            <GameErrorBoundary onClose={closeGame}>
                                <Suspense fallback={<div className="py-24 text-center text-slate-400 text-sm font-bold animate-pulse">게임 불러오는 중…</div>}>
                                    {activeGame && renderGame()}
                                </Suspense>
                            </GameErrorBoundary>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GameZone;
