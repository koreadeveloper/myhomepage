import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChessGameNew from '../components/ChessGame';
import PacmanGame from '../components/PacmanGame';
import BreakoutGame from '../components/BreakoutGame';
import PongGame from '../components/PongGame';
import FlappyBirdGame from '../components/FlappyBirdGame';
import SpaceInvadersGame from '../components/SpaceInvadersGame';
import DinoJumpGame from '../components/DinoJumpGame';
import HangmanGame from '../components/HangmanGame';
import GomokuGame from '../components/GomokuGame';
import ReactionTest from '../components/ReactionTest';
import TypingGame from '../components/TypingGame';
import BlackjackGame from '../components/BlackjackGame';
import PokerGame from '../components/PokerGame';
import GoStopGame from '../components/GoStopGame';
import QuizGame from '../components/QuizGame';
import MathGame from '../components/MathGame';
import MobileControls from '../components/MobileControls';

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
];

// --- Game 1: Snake (Canvas) ---
const SnakeGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

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
                        state.food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
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
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white rounded-xl backdrop-blur-sm">
                        <div className="text-4xl font-bold mb-4">게임 오버!</div>
                        <div className="text-xl mb-6">최종 점수: {score}</div>
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

    const spawnPiece = () => {
        const keys = Object.keys(TETROMINOS) as TetrominoKey[];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const piece = TETROMINOS[key];
        const newPiece = { ...piece, x: Math.floor(cols / 2) - 1, y: 0 };
        if (checkCollision(newPiece, newPiece.x, newPiece.y, board)) {
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
        spawnPiece();
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
            <div className="bg-slate-900 border-8 border-slate-700 grid grid-rows-[repeat(20,minmax(0,1fr))] gap-px rounded-xl shadow-2xl overflow-hidden aspect-[1/2]" style={{ height: 'min(80vh, 100%)' }}>
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

    const initGame = () => {
        const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandom(newGrid);
        addRandom(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
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
            // Check game over (simplified)
            if (!newGrid.flat().includes(0)) {
                // Technically should check if any merge is possible, skipping for brevity
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
            <div className="bg-stone-500 p-3 rounded-xl w-full max-w-[60vh] aspect-square shadow-2xl">
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

    const initGame = () => {
        const newBoard: Cell[][] = Array(size).fill(0).map(() => Array(size).fill(0).map(() => ({ isMine: false, isOpen: false, isFlag: false, count: 0 })));
        let planted = 0;
        while (planted < minesCount) {
            const r = Math.floor(Math.random() * size);
            const c = Math.floor(Math.random() * size);
            if (!newBoard[r][c].isMine) {
                newBoard[r][c].isMine = true;
                planted++;
            }
        }
        // Calc counts
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!newBoard[r][c].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                        if (r + dr >= 0 && r + dr < size && c + dc >= 0 && c + dc < size && newBoard[r + dr][c + dc].isMine) count++;
                    }
                    newBoard[r][c].count = count;
                }
            }
        }
        setBoard(newBoard);
        setStatus('playing');
    };

    const reveal = (r: number, c: number) => {
        if (status !== 'playing' || board[r][c].isOpen || board[r][c].isFlag) return;
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
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
                {status === 'playing' ? '지뢰 찾기' : status === 'won' ? '승리!' : '게임 오버'}
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
const Sudoku = () => {
    // Simple static problem for demo
    const solution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2], [6, 7, 2, 1, 9, 5, 3, 4, 8], [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3], [4, 2, 6, 8, 5, 3, 7, 9, 1], [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4], [2, 8, 7, 4, 1, 9, 6, 3, 5], [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    const initial = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3], [4, 0, 0, 8, 0, 3, 0, 0, 1], [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0], [0, 0, 0, 4, 1, 9, 0, 0, 5], [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    const [board, setBoard] = useState(initial);
    const [check, setCheck] = useState('');

    const handleChange = (r: number, c: number, val: string) => {
        if (initial[r][c] !== 0) return;
        const num = parseInt(val) || 0;
        if (num >= 0 && num <= 9) {
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = num;
            setBoard(newBoard);
        }
    };

    const checkSolution = () => {
        const isCorrect = JSON.stringify(board) === JSON.stringify(solution);
        setCheck(isCorrect ? '정답입니다!' : '다시 시도해보세요...');
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
                <button onClick={checkSolution} className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors">정답 확인</button>
            </div>
            {check && <div className={`mt-3 font-bold text-xl ${check === '정답입니다!' ? 'text-green-500' : 'text-slate-500'}`}>{check}</div>}
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
        const items = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
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

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-4 text-xl font-bold dark:text-white">시도 횟수: {moves}</div>
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
        if (board[i] || winner) return;
        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
    };

    // AI Turn
    useEffect(() => {
        if (!isXNext && !winner && board.some(x => x === null)) {
            const timer = setTimeout(() => {
                const emptyIndices = board.map((bs, i) => bs === null ? i : null).filter(i => i !== null);
                const rand = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                if (rand !== undefined) {
                    const newBoard = [...board];
                    newBoard[rand] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, winner, board]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-8 text-2xl font-bold dark:text-white">
                {winner ? `승자: ${winner}` : board.every(Boolean) ? '무승부!' : `차례: ${isXNext ? '당신 (X)' : 'AI (O)'}`}
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-[50vh] aspect-square">
                {board.map((val, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl text-6xl sm:text-8xl font-black flex items-center justify-center shadow-md hover:shadow-lg transition-all
                            ${val === 'X' ? 'text-blue-500' : 'text-red-500'}`}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <button onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); }} className="mt-8 px-8 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition-colors">다시 시작</button>
        </div>
    );
};

// --- Game 8: Word Puzzle ---
const WordPuzzle = () => {
    const answer = "APPLE"; // Hardcoded for demo
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

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

    return (
        <div className="flex flex-col items-center w-full h-full justify-center">
            <div className="mb-8 text-2xl font-bold dark:text-white">{status === 'won' ? '정답입니다!' : status === 'lost' ? `정답: ${answer}` : '단어를 맞춰보세요'}</div>
            <div className="space-y-2 mb-8 w-full max-w-sm">
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
            {status !== 'playing' && <button onClick={() => { setGuesses([]); setCurrentGuess(''); setStatus('playing'); }} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">다시 도전</button>}
            <p className="text-slate-500 text-sm mt-4">키보드로 입력하세요</p>
        </div>
    );
};

// --- Game 9: Chess ---
const ChessGame = () => {
    // Piece values for AI
    const PIECE_VALUES: { [key: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

    // Image paths for pieces
    const PIECE_IMAGES: { [key: string]: string } = {
        'R': '/chess1/imgi_51_wr.png', 'N': '/chess1/imgi_52_wn.png', 'B': '/chess1/imgi_53_wb.png',
        'Q': '/chess1/imgi_55_wq (1).png', 'K': '/chess1/imgi_54_wk.png', 'P': '/chess1/imgi_50_wp.png',
        'r': '/chess1/imgi_44_br.png', 'n': '/chess1/imgi_45_bn.png', 'b': '/chess1/imgi_46_bb.png',
        'q': '/chess1/imgi_48_bq.png', 'k': '/chess1/imgi_47_bk.png', 'p': '/chess1/imgi_49_bp.png',
    };

    // Initial board setup
    const getInitialBoard = () => [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ];

    type Piece = string | null;
    type Board = Piece[][];
    type Position = { row: number; col: number };
    type CastlingRights = { whiteKing: boolean; whiteQueen: boolean; blackKing: boolean; blackQueen: boolean };

    const [board, setBoard] = useState<Board>(getInitialBoard);
    const [selected, setSelected] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [turn, setTurn] = useState<'white' | 'black'>('white');
    const [status, setStatus] = useState<'playing' | 'check' | 'checkmate' | 'stalemate' | 'insufficient' | 'fifty-move'>('playing');
    const [thinking, setThinking] = useState(false);
    const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
    const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
    const [dragging, setDragging] = useState<Position | null>(null);
    const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
    const [enPassant, setEnPassant] = useState<Position | null>(null);
    const [castlingRights, setCastlingRights] = useState<CastlingRights>({ whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true });
    const [moveHistory, setMoveHistory] = useState<{ white: string; black: string }[]>([]);
    const [halfMoveClock, setHalfMoveClock] = useState(0); // For 50-move rule
    const [aiMode, setAiMode] = useState<'simple' | 'gemini' | null>(null); // AI mode selection
    const [gameStarted, setGameStarted] = useState(false); // Track if game has started
    const [aiRating, setAiRating] = useState(800); // Chess.com style rating (300-2500)

    const isWhite = (piece: Piece) => piece !== null && piece === piece.toUpperCase();
    const isBlack = (piece: Piece) => piece !== null && piece === piece.toLowerCase();
    const getPieceColor = (piece: Piece) => piece ? (isWhite(piece) ? 'white' : 'black') : null;

    const getPieceSymbol = (piece: Piece) => {
        if (!piece) return '';
        const symbols: { [key: string]: string } = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
        };
        return symbols[piece] || piece;
    };

    const getPieceImage = (piece: Piece) => piece ? PIECE_IMAGES[piece] : null;

    // Find king position
    const findKing = (b: Board, color: 'white' | 'black'): Position | null => {
        const kingChar = color === 'white' ? 'K' : 'k';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (b[r][c] === kingChar) return { row: r, col: c };
            }
        }
        return null;
    };

    // Check if a square is attacked by opponent
    const isSquareAttacked = (b: Board, pos: Position, byColor: 'white' | 'black'): boolean => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = b[r][c];
                if (piece && getPieceColor(piece) === byColor) {
                    const moves = getRawMoves(b, r, c, false);
                    if (moves.some(m => m.row === pos.row && m.col === pos.col)) return true;
                }
            }
        }
        return false;
    };

    // Check if king is in check
    const isInCheck = (b: Board, color: 'white' | 'black'): boolean => {
        const kingPos = findKing(b, color);
        if (!kingPos) return false;
        return isSquareAttacked(b, kingPos, color === 'white' ? 'black' : 'white');
    };

    // Get raw moves without check validation
    const getRawMoves = (b: Board, row: number, col: number, includeCastling = true): Position[] => {
        const piece = b[row][col];
        if (!piece) return [];
        const moves: Position[] = [];
        const color = getPieceColor(piece)!;
        const type = piece.toLowerCase();

        const addMove = (r: number, c: number) => {
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = b[r][c];
                if (!target || getPieceColor(target) !== color) moves.push({ row: r, col: c });
            }
        };

        const addLineMove = (dr: number, dc: number) => {
            for (let i = 1; i < 8; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r < 0 || r > 7 || c < 0 || c > 7) break;
                const target = b[r][c];
                if (!target) moves.push({ row: r, col: c });
                else {
                    if (getPieceColor(target) !== color) moves.push({ row: r, col: c });
                    break;
                }
            }
        };

        switch (type) {
            case 'p': // Pawn
                const dir = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                // Forward
                if (!b[row + dir]?.[col]) {
                    moves.push({ row: row + dir, col });
                    if (row === startRow && !b[row + 2 * dir]?.[col]) moves.push({ row: row + 2 * dir, col });
                }
                // Capture
                [-1, 1].forEach(dc => {
                    const target = b[row + dir]?.[col + dc];
                    if (target && getPieceColor(target) !== color) moves.push({ row: row + dir, col: col + dc });
                });
                // En Passant
                if (enPassant) {
                    [-1, 1].forEach(dc => {
                        if (col + dc === enPassant.col && row + dir === enPassant.row) {
                            moves.push({ row: enPassant.row, col: enPassant.col });
                        }
                    });
                }
                break;
            case 'n': // Knight
                [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMove(row + dr, col + dc));
                break;
            case 'b': // Bishop
                [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => addLineMove(dr, dc));
                break;
            case 'r': // Rook
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addLineMove(dr, dc));
                break;
            case 'q': // Queen
                [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addLineMove(dr, dc));
                break;
            case 'k': // King
                [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addMove(row + dr, col + dc));
                // Castling
                if (includeCastling && !isInCheck(b, color)) {
                    const kingRow = color === 'white' ? 7 : 0;
                    if (row === kingRow && col === 4) {
                        // King-side castling
                        if ((color === 'white' ? castlingRights.whiteKing : castlingRights.blackKing) &&
                            !b[kingRow][5] && !b[kingRow][6] &&
                            !isSquareAttacked(b, { row: kingRow, col: 5 }, color === 'white' ? 'black' : 'white') &&
                            !isSquareAttacked(b, { row: kingRow, col: 6 }, color === 'white' ? 'black' : 'white')) {
                            moves.push({ row: kingRow, col: 6 });
                        }
                        // Queen-side castling
                        if ((color === 'white' ? castlingRights.whiteQueen : castlingRights.blackQueen) &&
                            !b[kingRow][1] && !b[kingRow][2] && !b[kingRow][3] &&
                            !isSquareAttacked(b, { row: kingRow, col: 2 }, color === 'white' ? 'black' : 'white') &&
                            !isSquareAttacked(b, { row: kingRow, col: 3 }, color === 'white' ? 'black' : 'white')) {
                            moves.push({ row: kingRow, col: 2 });
                        }
                    }
                }
                break;
        }
        return moves;
    };

    // Get valid moves (excluding those that leave king in check)
    const getValidMoves = (b: Board, row: number, col: number): Position[] => {
        const piece = b[row][col];
        if (!piece) return [];
        const color = getPieceColor(piece)!;
        const rawMoves = getRawMoves(b, row, col);

        return rawMoves.filter(move => {
            const newBoard = b.map(r => [...r]);
            newBoard[move.row][move.col] = newBoard[row][col];
            newBoard[row][col] = null;
            // Pawn promotion
            if (piece.toLowerCase() === 'p' && (move.row === 0 || move.row === 7)) {
                newBoard[move.row][move.col] = color === 'white' ? 'Q' : 'q';
            }
            return !isInCheck(newBoard, color);
        });
    };

    // Get all valid moves for a color
    const getAllValidMoves = (b: Board, color: 'white' | 'black') => {
        const moves: { from: Position; to: Position; piece: string }[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = b[r][c];
                if (piece && getPieceColor(piece) === color) {
                    getValidMoves(b, r, c).forEach(to => {
                        moves.push({ from: { row: r, col: c }, to, piece });
                    });
                }
            }
        }
        return moves;
    };

    // Check for insufficient material draw
    const isInsufficientMaterial = (b: Board): boolean => {
        const pieces: string[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = b[r][c];
                if (piece && piece.toLowerCase() !== 'k') {
                    pieces.push(piece.toLowerCase());
                }
            }
        }
        // King vs King
        if (pieces.length === 0) return true;
        // King + Bishop vs King or King + Knight vs King
        if (pieces.length === 1 && (pieces[0] === 'b' || pieces[0] === 'n')) return true;
        // King + Bishop vs King + Bishop (same color bishops)
        if (pieces.length === 2 && pieces.every(p => p === 'b')) {
            // Check if bishops are on same color squares
            const bishopPositions: Position[] = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (b[r][c]?.toLowerCase() === 'b') {
                        bishopPositions.push({ row: r, col: c });
                    }
                }
            }
            if (bishopPositions.length === 2) {
                const color1 = (bishopPositions[0].row + bishopPositions[0].col) % 2;
                const color2 = (bishopPositions[1].row + bishopPositions[1].col) % 2;
                if (color1 === color2) return true;
            }
        }
        return false;
    };

    // Check game status
    const checkGameStatus = useCallback((b: Board, color: 'white' | 'black', currentHalfMoveClock: number = halfMoveClock) => {
        // Check 50-move rule first
        if (currentHalfMoveClock >= 100) { // 100 half-moves = 50 full moves
            setStatus('fifty-move');
            return;
        }
        // Check insufficient material
        if (isInsufficientMaterial(b)) {
            setStatus('insufficient');
            return;
        }
        const moves = getAllValidMoves(b, color);
        const inCheck = isInCheck(b, color);
        if (moves.length === 0) {
            setStatus(inCheck ? 'checkmate' : 'stalemate');
        } else if (inCheck) {
            setStatus('check');
        } else {
            setStatus('playing');
        }
    }, [halfMoveClock]);

    // Make a move
    const getMoveNotation = (piece: Piece, from: Position, to: Position, captured: Piece, isCastling: boolean) => {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const toSquare = files[to.col] + ranks[to.row];

        if (isCastling) return to.col === 6 ? 'O-O' : 'O-O-O';

        const pieceSymbol = piece?.toLowerCase() === 'p' ? '' : getPieceSymbol(piece);
        const captureX = captured ? 'x' : '';
        const fromFile = piece?.toLowerCase() === 'p' && captured ? files[from.col] : '';

        return `${pieceSymbol}${fromFile}${captureX}${toSquare}`;
    };

    const makeMove = (from: Position, to: Position) => {
        const newBoard = board.map(r => [...r]);
        const piece = newBoard[from.row][from.col];
        const captured = newBoard[to.row][to.col];
        const pieceType = piece?.toLowerCase();
        const color = getPieceColor(piece);
        const isCastling = pieceType === 'k' && Math.abs(to.col - from.col) === 2;

        // Generate move notation
        const notation = getMoveNotation(piece, from, to, captured, isCastling);

        // Handle en passant capture
        if (pieceType === 'p' && enPassant && to.row === enPassant.row && to.col === enPassant.col) {
            const capturedPawnRow = color === 'white' ? to.row + 1 : to.row - 1;
            const capturedPawn = newBoard[capturedPawnRow][to.col];
            if (capturedPawn) {
                if (isWhite(capturedPawn)) setCapturedWhite(prev => [...prev, capturedPawn]);
                else setCapturedBlack(prev => [...prev, capturedPawn]);
            }
            newBoard[capturedPawnRow][to.col] = null;
        } else if (captured) {
            if (isWhite(captured)) setCapturedWhite(prev => [...prev, captured]);
            else setCapturedBlack(prev => [...prev, captured]);
        }

        // Handle castling
        if (isCastling) {
            const kingRow = from.row;
            if (to.col === 6) { // King-side
                newBoard[kingRow][5] = newBoard[kingRow][7];
                newBoard[kingRow][7] = null;
            } else if (to.col === 2) { // Queen-side
                newBoard[kingRow][3] = newBoard[kingRow][0];
                newBoard[kingRow][0] = null;
            }
        }

        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = null;

        // Update en passant target
        if (pieceType === 'p' && Math.abs(to.row - from.row) === 2) {
            setEnPassant({ row: (from.row + to.row) / 2, col: from.col });
        } else {
            setEnPassant(null);
        }

        // Update castling rights
        const newCastlingRights = { ...castlingRights };
        if (pieceType === 'k') {
            if (color === 'white') { newCastlingRights.whiteKing = false; newCastlingRights.whiteQueen = false; }
            else { newCastlingRights.blackKing = false; newCastlingRights.blackQueen = false; }
        }
        if (pieceType === 'r') {
            if (from.row === 7 && from.col === 7) newCastlingRights.whiteKing = false;
            if (from.row === 7 && from.col === 0) newCastlingRights.whiteQueen = false;
            if (from.row === 0 && from.col === 7) newCastlingRights.blackKing = false;
            if (from.row === 0 && from.col === 0) newCastlingRights.blackQueen = false;
        }
        setCastlingRights(newCastlingRights);

        // Pawn promotion
        if (pieceType === 'p' && (to.row === 0 || to.row === 7)) {
            newBoard[to.row][to.col] = color === 'white' ? 'Q' : 'q';
        }

        // Record move history
        if (turn === 'white') {
            setMoveHistory(prev => [...prev, { white: notation, black: '' }]);
        } else {
            setMoveHistory(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = { ...updated[updated.length - 1], black: notation };
                }
                return updated;
            });
        }

        // Update half-move clock (reset on pawn move or capture)
        const newHalfMoveClock = (pieceType === 'p' || captured) ? 0 : halfMoveClock + 1;
        setHalfMoveClock(newHalfMoveClock);

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);

        const nextTurn = turn === 'white' ? 'black' : 'white';
        setTurn(nextTurn);
        checkGameStatus(newBoard, nextTurn, newHalfMoveClock);

        return newBoard;
    };

    // Convert board to FEN notation for AI
    const boardToFen = (b: Board): string => {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const piece = b[r][c];
                if (piece) {
                    if (empty > 0) { fen += empty; empty = 0; }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }
        return fen;
    };

    // Call Gemini API through serverless function (API key hidden on server)
    const getGeminiMove = async (b: Board, color: 'white' | 'black', validMovesList: { from: Position; to: Position }[]): Promise<{ from: Position; to: Position } | null> => {
        const fenPosition = boardToFen(b);
        const files = 'abcdefgh';
        const ranks = '87654321';
        const validMovesStr = validMovesList.map(m =>
            `${files[m.from.col]}${ranks[m.from.row]}${files[m.to.col]}${ranks[m.to.row]}`
        ).join(', ');

        try {
            const response = await fetch('/api/chess-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fen: fenPosition,
                    color: color,
                    validMoves: validMovesStr,
                    rating: aiRating
                })
            });

            const data = await response.json();
            const moveText = data?.move;

            if (moveText && moveText.length >= 4) {
                const fromCol = files.indexOf(moveText[0]);
                const fromRow = ranks.indexOf(moveText[1]);
                const toCol = files.indexOf(moveText[2]);
                const toRow = ranks.indexOf(moveText[3]);

                if (fromCol >= 0 && fromRow >= 0 && toCol >= 0 && toRow >= 0) {
                    const move = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
                    // Validate the move is legal
                    if (validMovesList.some(m => m.from.row === move.from.row && m.from.col === move.from.col && m.to.row === move.to.row && m.to.col === move.to.col)) {
                        return move;
                    }
                }
            }
        } catch (error) {
            console.error('Chess AI API error:', error);
        }
        return null;
    };

    // AI move
    useEffect(() => {
        if (!playerColor || !gameStarted) return;
        const aiColor = playerColor === 'white' ? 'black' : 'white';
        if (turn === aiColor && (status === 'playing' || status === 'check')) {
            setThinking(true);

            const executeAiMove = async () => {
                const moves = getAllValidMoves(board, aiColor);
                if (moves.length === 0) return;

                let best: { from: Position; to: Position; piece: string };

                if (aiMode === 'gemini') {
                    // Try Gemini AI first
                    const geminiMove = await getGeminiMove(board, aiColor, moves);
                    if (geminiMove) {
                        best = { ...geminiMove, piece: board[geminiMove.from.row][geminiMove.from.col] || '' };
                    } else {
                        // Fallback to simple AI
                        const scoredMoves = moves.map(m => {
                            const target = board[m.to.row][m.to.col];
                            const captureValue = target ? PIECE_VALUES[target.toLowerCase()] || 0 : 0;
                            return { ...m, score: captureValue + Math.random() * 0.5 };
                        });
                        scoredMoves.sort((a, b) => b.score - a.score);
                        best = scoredMoves[0];
                    }
                } else {
                    // Simple AI: Score moves by capture value
                    const scoredMoves = moves.map(m => {
                        const target = board[m.to.row][m.to.col];
                        const captureValue = target ? PIECE_VALUES[target.toLowerCase()] || 0 : 0;
                        return { ...m, score: captureValue + Math.random() * 0.5 };
                    });
                    scoredMoves.sort((a, b) => b.score - a.score);
                    best = scoredMoves[0];
                }

                const newBoard = board.map(r => [...r]);
                const piece = newBoard[best.from.row][best.from.col];
                const captured = newBoard[best.to.row][best.to.col];

                if (captured) {
                    if (isWhite(captured)) setCapturedWhite(prev => [...prev, captured]);
                    else setCapturedBlack(prev => [...prev, captured]);
                }

                // Handle AI castling
                if (piece?.toLowerCase() === 'k' && Math.abs(best.to.col - best.from.col) === 2) {
                    const kingRow = best.from.row;
                    if (best.to.col === 6) {
                        newBoard[kingRow][5] = newBoard[kingRow][7];
                        newBoard[kingRow][7] = null;
                    } else if (best.to.col === 2) {
                        newBoard[kingRow][3] = newBoard[kingRow][0];
                        newBoard[kingRow][0] = null;
                    }
                }

                newBoard[best.to.row][best.to.col] = piece;
                newBoard[best.from.row][best.from.col] = null;

                // AI pawn promotion
                if (piece?.toLowerCase() === 'p' && (best.to.row === 0 || best.to.row === 7)) {
                    newBoard[best.to.row][best.to.col] = aiColor === 'white' ? 'Q' : 'q';
                }

                // Record AI move in history
                const isCastling = piece?.toLowerCase() === 'k' && Math.abs(best.to.col - best.from.col) === 2;
                const notation = getMoveNotation(piece, best.from, best.to, captured, isCastling);

                if (aiColor === 'white') {
                    setMoveHistory(prev => [...prev, { white: notation, black: '' }]);
                } else {
                    setMoveHistory(prev => {
                        const updated = [...prev];
                        if (updated.length > 0) {
                            updated[updated.length - 1] = { ...updated[updated.length - 1], black: notation };
                        } else {
                            updated.push({ white: '', black: notation });
                        }
                        return updated;
                    });
                }

                // Update half-move clock for AI
                const aiPieceType = piece?.toLowerCase();
                const newAiHalfMoveClock = (aiPieceType === 'p' || captured) ? 0 : halfMoveClock + 1;
                setHalfMoveClock(newAiHalfMoveClock);

                setEnPassant(null);
                setBoard(newBoard);
                setTurn(playerColor);
                setThinking(false);
                checkGameStatus(newBoard, playerColor, newAiHalfMoveClock);
            };

            const timer = setTimeout(executeAiMove, aiMode === 'gemini' ? 100 : 700);
            return () => clearTimeout(timer);
        }
    }, [turn, board, status, playerColor, halfMoveClock, aiMode, gameStarted]);

    const isPlayerPiece = (piece: Piece) => {
        if (!playerColor || !piece) return false;
        return playerColor === 'white' ? isWhite(piece) : isBlack(piece);
    };

    const handleClick = (row: number, col: number) => {
        if (!playerColor || turn !== playerColor || thinking || status === 'checkmate' || status === 'stalemate' || status === 'insufficient' || status === 'fifty-move') return;

        const piece = board[row][col];

        if (selected) {
            const isValidMoveCell = validMoves.some(m => m.row === row && m.col === col);
            if (isValidMoveCell) {
                makeMove(selected, { row, col });
            } else if (piece && isPlayerPiece(piece)) {
                setSelected({ row, col });
                setValidMoves(getValidMoves(board, row, col));
            } else {
                setSelected(null);
                setValidMoves([]);
            }
        } else if (piece && isPlayerPiece(piece)) {
            setSelected({ row, col });
            setValidMoves(getValidMoves(board, row, col));
        }
    };

    const handleDragStart = (row: number, col: number) => {
        if (!playerColor || turn !== playerColor || thinking || status === 'checkmate' || status === 'stalemate') return;
        const piece = board[row][col];
        if (piece && isPlayerPiece(piece)) {
            setDragging({ row, col });
            setSelected({ row, col });
            setValidMoves(getValidMoves(board, row, col));
        }
    };

    const handleDragEnd = () => {
        setDragging(null);
    };

    const handleDrop = (row: number, col: number) => {
        if (!dragging) return;
        const isValidMoveCell = validMoves.some(m => m.row === row && m.col === col);
        if (isValidMoveCell) {
            makeMove(dragging, { row, col });
        }
        setDragging(null);
    };

    const resetGame = () => {
        setBoard(getInitialBoard());
        setSelected(null);
        setValidMoves([]);
        setTurn('white');
        setStatus('playing');
        setThinking(false);
        setCapturedWhite([]);
        setCapturedBlack([]);
        setDragging(null);
        setPlayerColor(null);
        setEnPassant(null);
        setCastlingRights({ whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true });
        setMoveHistory([]);
        setHalfMoveClock(0);
        setAiMode(null);
        setGameStarted(false);
    };

    const selectAiMode = (mode: 'simple' | 'gemini') => {
        setAiMode(mode);
    };

    const startGame = (color: 'white' | 'black') => {
        setPlayerColor(color);
        setGameStarted(true);
        if (color === 'black') {
            // AI plays first as white
            setTurn('white');
        }
    };

    const getStatusText = () => {
        if (status === 'checkmate') return turn === playerColor ? '체크메이트! AI 승리' : '체크메이트! 당신이 이겼습니다!';
        if (status === 'stalemate') return '스테일메이트! 무승부';
        if (status === 'insufficient') return '기물부족! 무승부';
        if (status === 'fifty-move') return '50수 규칙! 무승부';
        if (thinking) return 'AI가 생각 중...';
        if (status === 'check') return turn === playerColor ? '체크! 당신의 차례' : '체크!';
        return turn === playerColor ? `당신의 차례 (${playerColor === 'white' ? '백' : '흑'})` : `AI 차례 (${playerColor === 'white' ? '흑' : '백'})`;
    };

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Will be handled by parent component
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full p-2 lg:p-4 gap-2 lg:gap-4">
            {/* AI Mode Selection Screen */}
            {!aiMode && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4 lg:mb-6">AI 모드 선택</h2>
                        <div className="flex flex-col gap-3 lg:gap-4">
                            <button onClick={() => selectAiMode('simple')} className="flex items-center gap-3 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border-2 border-transparent hover:border-blue-500">
                                <span className="text-3xl">🤖</span>
                                <div className="text-left">
                                    <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base block">간단한 AI</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">기본 규칙 기반 AI</span>
                                </div>
                            </button>
                            <button onClick={() => selectAiMode('gemini')} className="flex items-center gap-3 p-4 lg:p-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-colors border-2 border-transparent hover:border-white">
                                <span className="text-3xl">✨</span>
                                <div className="text-left">
                                    <span className="font-bold text-white text-sm lg:text-base block">Gemini AI</span>
                                    <span className="text-xs text-blue-100">난이도 조절 가능</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Selection Screen (only for Gemini AI) */}
            {aiMode === 'gemini' && !playerColor && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4 w-80 lg:w-96">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">✨ Gemini AI</div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">난이도 선택</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Chess.com 레이팅 기준</p>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">{aiRating}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {aiRating < 400 ? '🐣 완전 초보' :
                                        aiRating < 600 ? '🐥 입문자' :
                                            aiRating < 900 ? '🎮 초급' :
                                                aiRating < 1200 ? '♟️ 중급' :
                                                    aiRating < 1500 ? '🏆 클럽 수준' :
                                                        aiRating < 1800 ? '⚔️ 강한 클럽' :
                                                            aiRating < 2100 ? '🎯 전문가' : '👑 마스터'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="300"
                                max="2500"
                                step="100"
                                value={aiRating}
                                onChange={(e) => setAiRating(Number(e.target.value))}
                                className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #4ade80 0%, #facc15 33%, #fb923c 66%, #ef4444 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>300</span>
                                <span>1000</span>
                                <span>1800</span>
                                <span>2500</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">색상 선택</h3>
                        <div className="flex gap-3 lg:gap-4 justify-center">
                            <button onClick={() => startGame('white')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_54_wk.png" alt="White King" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">백</span>
                            </button>
                            <button onClick={() => startGame('black')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_47_bk.png" alt="Black King" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">흑</span>
                            </button>
                        </div>
                        <button onClick={() => setAiMode(null)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                            ← AI 모드 다시 선택
                        </button>
                    </div>
                </div>
            )}

            {/* Color Selection Screen (only for Simple AI) */}
            {aiMode === 'simple' && !playerColor && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">🤖 간단한 AI</div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4 lg:mb-6">색상을 선택하세요</h2>
                        <div className="flex gap-3 lg:gap-4">
                            <button onClick={() => startGame('white')} className="flex flex-col items-center gap-2 p-4 lg:p-6 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_54_wk.png" alt="White King" className="w-12 h-12 lg:w-16 lg:h-16" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base">백 (선공)</span>
                            </button>
                            <button onClick={() => startGame('black')} className="flex flex-col items-center gap-2 p-4 lg:p-6 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_47_bk.png" alt="Black King" className="w-12 h-12 lg:w-16 lg:h-16" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base">흑 (후공)</span>
                            </button>
                        </div>
                        <button onClick={() => setAiMode(null)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                            ← AI 모드 다시 선택
                        </button>
                    </div>
                </div>
            )}

            {/* Left Panel - Controls (hidden on mobile, shows at bottom) */}
            <div className="hidden lg:flex flex-col gap-3 items-center w-36">
                <button onClick={resetGame} className="w-full px-3 py-2 bg-lime-600 text-white rounded-lg font-bold text-sm hover:bg-lime-700 transition-colors shadow-lg">
                    새 게임
                </button>
                <div className={`w-full px-2 py-1.5 rounded-lg font-bold text-xs text-center ${status === 'checkmate' ? 'bg-red-500 text-white' :
                    status === 'check' ? 'bg-yellow-500 text-white' :
                        thinking ? 'bg-purple-500 text-white animate-pulse' :
                            'bg-lime-600 text-white'}`}>
                    {playerColor ? getStatusText() : '색상 선택 대기'}
                </div>
                <div className="w-full bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">잡은 기물 (AI)</div>
                    <div className="flex flex-wrap gap-0.5 min-h-[20px]">
                        {(playerColor === 'white' ? capturedWhite : capturedBlack).map((p, i) => <img key={i} src={getPieceImage(p) || ''} alt="" className="w-5 h-5" />)}
                    </div>
                </div>
                <div className="w-full bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">잡은 기물 (나)</div>
                    <div className="flex flex-wrap gap-0.5 min-h-[20px]">
                        {(playerColor === 'white' ? capturedBlack : capturedWhite).map((p, i) => <img key={i} src={getPieceImage(p) || ''} alt="" className="w-5 h-5" />)}
                    </div>
                </div>
            </div>

            {/* Chess Board - Fully Responsive - Maximum Size */}
            <div className="flex-shrink-0 w-[95vw] aspect-square lg:w-[600px] lg:aspect-square relative">
                <div className="grid grid-cols-8 border-2 lg:border-4 border-lime-800 dark:border-lime-600 rounded-lg overflow-hidden shadow-2xl w-full h-full">
                    {(playerColor === 'black' ? [...board].reverse().map(row => [...row].reverse()) : board).map((row, displayR) => row.map((piece, displayC) => {
                        const r = playerColor === 'black' ? 7 - displayR : displayR;
                        const c = playerColor === 'black' ? 7 - displayC : displayC;
                        const isLight = (r + c) % 2 === 0;
                        const isSelectedCell = selected?.row === r && selected?.col === c;
                        const isValidMoveCell = validMoves.some(m => m.row === r && m.col === c);
                        const hasEnemy = piece && !isPlayerPiece(piece) && isValidMoveCell;
                        const pieceImg = getPieceImage(board[r][c]);
                        const canDrag = board[r][c] && isPlayerPiece(board[r][c]) && turn === playerColor && !thinking;

                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => handleClick(r, c)}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={() => handleDrop(r, c)}
                                className={`aspect-square flex items-center justify-center cursor-pointer relative
                                    ${isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]'}
                                    ${isSelectedCell ? 'ring-2 lg:ring-4 ring-yellow-400 ring-inset' : ''}
                                    ${hasEnemy ? 'ring-2 lg:ring-4 ring-red-500 ring-inset' : ''}`}
                            >
                                {isValidMoveCell && !board[r][c] && (
                                    <div className="absolute w-1/4 h-1/4 bg-black/20 rounded-full" />
                                )}
                                {pieceImg && (
                                    <img
                                        src={pieceImg}
                                        alt={board[r][c] || ''}
                                        draggable={!!canDrag}
                                        onDragStart={() => handleDragStart(r, c)}
                                        onDragEnd={handleDragEnd}
                                        className={`w-[85%] h-[85%] object-contain select-none ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging?.row === r && dragging?.col === c ? 'opacity-50' : ''}`}
                                    />
                                )}
                            </div>
                        );
                    }))}
                </div>
            </div>

            {/* Right Panel - Move History (hidden on mobile) */}
            <div className="hidden lg:flex flex-col w-44" style={{ height: 'min(calc(100vh - 100px), 800px)' }}>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        기보
                    </div>
                    <div className="flex-1 overflow-y-auto p-1">
                        {moveHistory.length === 0 ? (
                            <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">아직 수가 없습니다</div>
                        ) : (
                            <table className="w-full text-xs">
                                <tbody>
                                    {moveHistory.map((move, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                                            <td className="py-0.5 px-1 text-slate-400 dark:text-slate-500 w-6">{i + 1}.</td>
                                            <td className="py-0.5 px-1 text-slate-700 dark:text-slate-200 font-mono">{move.white}</td>
                                            <td className="py-0.5 px-1 text-slate-700 dark:text-slate-200 font-mono">{move.black}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between gap-2 z-40">
                <button onClick={resetGame} className="px-4 py-2 bg-lime-600 text-white rounded-lg font-bold text-sm hover:bg-lime-700 transition-colors shadow-lg">
                    새 게임
                </button>
                <div className={`flex-1 px-2 py-1.5 rounded-lg font-bold text-xs text-center ${status === 'checkmate' ? 'bg-red-500 text-white' :
                    status === 'check' ? 'bg-yellow-500 text-white' :
                        thinking ? 'bg-purple-500 text-white animate-pulse' :
                            'bg-lime-600 text-white'}`}>
                    {playerColor ? getStatusText() : '색상 선택'}
                </div>
                <div className="flex gap-1">
                    {(playerColor === 'white' ? capturedBlack : capturedWhite).slice(-3).map((p, i) => <img key={i} src={getPieceImage(p) || ''} alt="" className="w-6 h-6" />)}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const GameZone: React.FC = () => {
    const [activeGame, setActiveGame] = useState<Game | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    const openGame = (game: Game) => {
        setActiveGame(game);
        window.history.pushState({ game: game.title }, '', '');
    };
    const closeGame = () => setActiveGame(null);

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

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

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
            default: return <div>게임을 찾을 수 없습니다</div>;
        }
    };

    return (
        <div className={`flex h-[calc(100vh-72px)] overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden fixed top-24 left-4 z-40 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <span className="material-icons-round text-slate-600 dark:text-slate-300">menu</span>
            </button>
            {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40" />}

            <aside className={`w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col p-6 space-y-6 overflow-y-auto z-50 fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><span className="material-icons-round">close</span></button>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">테마</span>
                    <button onClick={toggleDarkMode} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <span className="material-icons-round text-sm">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                    </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><span className="material-icons-round">person</span></div>
                    <div><div className="font-bold text-sm">운영자</div><div className="text-[10px] opacity-80">게임 마스터</div></div>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">바로가기</h4>
                    <nav className="space-y-1">
                        <Link to="/" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><span className="material-icons-round text-lg">home</span> 홈</Link>
                        <Link to="/community" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><span className="material-icons-round text-lg">forum</span> 커뮤니티</Link>
                        <Link to="/guestbook" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><span className="material-icons-round text-lg">history_edu</span> 방명록</Link>
                    </nav>
                </div>
            </aside>

            <main className="flex-grow overflow-hidden relative bg-[#f9f9fb] dark:bg-slate-900">
                <div className={`h-full overflow-y-auto p-6 transition-all duration-300 transform ${activeGame ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-violet-600 text-xs font-bold mb-3"><span className="material-icons-round text-sm mr-1">bolt</span> 게임존</div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">나만의 게임 공간, <span className="text-violet-500">즐기고 휴식하세요</span></h2>
                            <p className="text-slate-500 dark:text-slate-400">게임을 선택하면 전체 화면 모드로 시작됩니다.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {games.map((game) => (
                                <div key={game.title} className={`game-card group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 relative overflow-hidden ${game.isLarge ? 'sm:col-span-2 sm:row-span-2' : ''}`} onClick={() => openGame(game)}>
                                    <div className={`absolute top-0 right-0 ${game.isLarge ? 'w-32 h-32' : 'w-24 h-24'} ${game.cornerAccentColor} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
                                    <div className="relative z-10">
                                        <div className={`${game.isLarge ? 'w-20 h-20' : 'w-14 h-14'} rounded-xl ${game.bgColor} ${game.color} flex items-center justify-center mb-4 group-hover:${game.accentColor} group-hover:text-white transition-colors`}><span className={`material-icons-round ${game.isLarge ? 'text-5xl' : 'text-3xl'}`}>{game.icon}</span></div>
                                        <h3 className={`${game.isLarge ? 'text-2xl' : 'text-lg'} font-bold text-slate-800 dark:text-white mb-1`}>{game.title}</h3>
                                        <p className={`${game.isLarge ? 'text-sm' : 'text-xs'} text-slate-500 dark:text-slate-400`}>{game.description}</p>
                                        {game.isLarge && <div className="mt-4 flex items-center gap-2 text-lime-600 dark:text-lime-400 font-medium text-sm"><span className="material-icons-round text-lg">play_arrow</span>플레이하기</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`absolute inset-0 z-50 bg-[#f9f9fb] dark:bg-[#0f172a] flex flex-col transition-all duration-500 transform ${activeGame ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm shrink-0">
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-500 transition-colors font-medium" onClick={closeGame}><span className="material-icons-round">arrow_back</span><span>게임 목록으로</span></button>
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activeGame?.title}</h2>
                        </div>
                        <div className="text-sm font-medium text-slate-500 hidden sm:block">ESC 또는 뒤로가기 버튼으로 나가기</div>
                    </div>
                    {/* Game Container: Flexible and Centered */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col items-center p-2 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-full min-h-full max-w-7xl flex items-center justify-center relative">
                            {activeGame && renderGame()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GameZone;
