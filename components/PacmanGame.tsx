import React, { useRef, useState, useEffect, useCallback } from 'react';
import { recordBestScore } from '../lib/highScore';

// Pacman Game
const PacmanGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => { if (gameOver) recordBestScore('팩맨', score); }, [gameOver]);
    const [started, setStarted] = useState(false);
    const [level, setLevel] = useState(1);

    const gameStateRef = useRef({
        pacman: { x: 1, y: 1, dir: { x: 0, y: 0 } },
        ghosts: [
            { x: 13, y: 11, dir: { x: 1, y: 0 }, color: '#ff0000' },
            { x: 14, y: 11, dir: { x: -1, y: 0 }, color: '#00ffff' },
        ],
        dots: new Set<string>(),
        powerMode: false,
        powerTimer: 0,
        lastMoveTime: 0,
    });

    const maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1],
        [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const resetPositions = (state: typeof gameStateRef.current) => {
        state.pacman = { x: 9, y: 15, dir: { x: 0, y: 0 } };
        state.ghosts = [
            { x: 8, y: 9, dir: { x: 1, y: 0 }, color: '#ff0000' },
            { x: 10, y: 9, dir: { x: -1, y: 0 }, color: '#00ffff' },
        ];
        state.powerMode = false;
        state.powerTimer = 0;
    };

    // 레벨업: 점수 유지, 도트만 재배치
    const nextLevel = useCallback(() => {
        const dots = new Set<string>();
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 0 || maze[y][x] === 2) {
                    dots.add(`${x},${y}`);
                }
            }
        }
        resetPositions(gameStateRef.current);
        gameStateRef.current.dots = dots;
        setLevel(l => l + 1);
    }, []);

    const initGame = useCallback(() => {
        const dots = new Set<string>();
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 0 || maze[y][x] === 2) {
                    dots.add(`${x},${y}`);
                }
            }
        }
        resetPositions(gameStateRef.current);
        gameStateRef.current.dots = dots;
        gameStateRef.current.lastMoveTime = 0;
        setScore(0);
        setLevel(1);
        setGameOver(false);
        setStarted(true);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cellSize = canvas.width / maze[0].length;
        let animationId: number;
        const state = gameStateRef.current;

        const isWall = (x: number, y: number) => {
            if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return x !== -1 && x !== maze[0].length;
            return maze[y][x] === 1;
        };

        const draw = (timestamp: number) => {
            if (gameOver) return;

            // Update logic
            if (timestamp - state.lastMoveTime > 150) {
                // Move Pacman
                const newPx = state.pacman.x + state.pacman.dir.x;
                const newPy = state.pacman.y + state.pacman.dir.y;
                if (!isWall(newPx, newPy)) {
                    state.pacman.x = (newPx + maze[0].length) % maze[0].length;
                    state.pacman.y = newPy;
                }

                // Eat dots
                const dotKey = `${state.pacman.x},${state.pacman.y}`;
                if (state.dots.has(dotKey)) {
                    const isPower = maze[state.pacman.y][state.pacman.x] === 2;
                    state.dots.delete(dotKey);
                    setScore(s => s + (isPower ? 50 : 10));
                    if (isPower) {
                        state.powerMode = true;
                        state.powerTimer = 50;
                    }
                }

                // Move ghosts — 추격/도주 AI (유턴 제외)
                state.ghosts.forEach(ghost => {
                    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                    // 유턴 금지(막다른 곳 제외) + 벽 제외
                    let validDirs = dirs.filter(d =>
                        !(d.x === -ghost.dir.x && d.y === -ghost.dir.y) && !isWall(ghost.x + d.x, ghost.y + d.y)
                    );
                    if (validDirs.length === 0) {
                        validDirs = dirs.filter(d => !isWall(ghost.x + d.x, ghost.y + d.y));
                    }
                    if (validDirs.length > 0) {
                        if (Math.random() < 0.85) {
                            // 파워모드: 도망 / 평소: 추격
                            const px = state.pacman.x, py = state.pacman.y;
                            const dist = (d: { x: number; y: number }) => {
                                const nx = (ghost.x + d.x + maze[0].length) % maze[0].length;
                                const ny = ghost.y + d.y;
                                const dx = Math.min(Math.abs(nx - px), maze[0].length - Math.abs(nx - px));
                                const dy = Math.abs(ny - py);
                                return dx * dx + dy * dy;
                            };
                            const scored = validDirs.map(d => ({ d, dist: dist(d) }));
                            scored.sort((a, b) => state.powerMode ? b.dist - a.dist : a.dist - b.dist);
                            ghost.dir = scored[0].d;
                        } else {
                            ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                        }
                        ghost.x = (ghost.x + ghost.dir.x + maze[0].length) % maze[0].length;
                        ghost.y = ghost.y + ghost.dir.y;
                    }

                    // Collision
                    if (ghost.x === state.pacman.x && ghost.y === state.pacman.y) {
                        if (state.powerMode) {
                            ghost.x = 9; ghost.y = 9;
                            setScore(s => s + 200);
                        } else {
                            setGameOver(true);
                        }
                    }
                });

                if (state.powerMode) {
                    state.powerTimer--;
                    if (state.powerTimer <= 0) state.powerMode = false;
                }

                // Win condition — 점수 유지하고 레벨만 진행
                if (state.dots.size === 0) {
                    nextLevel();
                }

                state.lastMoveTime = timestamp;
            }

            // Draw
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw maze
            for (let y = 0; y < maze.length; y++) {
                for (let x = 0; x < maze[0].length; x++) {
                    if (maze[y][x] === 1) {
                        ctx.fillStyle = '#1e3a8a';
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    } else if (state.dots.has(`${x},${y}`)) {
                        ctx.fillStyle = maze[y][x] === 2 ? '#ff0' : '#fff';
                        ctx.beginPath();
                        ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, maze[y][x] === 2 ? cellSize / 4 : cellSize / 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Draw Pacman
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            const mouthAngle = Math.sin(timestamp / 100) * 0.3 + 0.3;
            const angle = state.pacman.dir.x === 1 ? 0 : state.pacman.dir.x === -1 ? Math.PI : state.pacman.dir.y === 1 ? Math.PI / 2 : -Math.PI / 2;
            ctx.arc(state.pacman.x * cellSize + cellSize / 2, state.pacman.y * cellSize + cellSize / 2, cellSize / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle);
            ctx.lineTo(state.pacman.x * cellSize + cellSize / 2, state.pacman.y * cellSize + cellSize / 2);
            ctx.fill();

            // Draw ghosts
            state.ghosts.forEach(ghost => {
                ctx.fillStyle = state.powerMode ? '#0000ff' : ghost.color;
                ctx.beginPath();
                ctx.arc(ghost.x * cellSize + cellSize / 2, ghost.y * cellSize + cellSize / 3, cellSize / 2 - 2, Math.PI, 0);
                ctx.lineTo(ghost.x * cellSize + cellSize - 2, ghost.y * cellSize + cellSize);
                ctx.lineTo(ghost.x * cellSize + 2, ghost.y * cellSize + cellSize);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(ghost.x * cellSize + cellSize / 3, ghost.y * cellSize + cellSize / 3, 4, 0, Math.PI * 2);
                ctx.arc(ghost.x * cellSize + cellSize * 2 / 3, ghost.y * cellSize + cellSize / 3, 4, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver, initGame, nextLevel]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const state = gameStateRef.current;
            switch (e.key) {
                case 'ArrowUp': case 'w': state.pacman.dir = { x: 0, y: -1 }; break;
                case 'ArrowDown': case 's': state.pacman.dir = { x: 0, y: 1 }; break;
                case 'ArrowLeft': case 'a': state.pacman.dir = { x: -1, y: 0 }; break;
                case 'ArrowRight': case 'd': state.pacman.dir = { x: 1, y: 0 }; break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 text-lg font-bold text-slate-800 dark:text-white">
                <span>점수: {score}</span>
                <span>레벨: {level}</span>
            </div>
            <canvas ref={canvasRef} width={570} height={630} className="rounded-lg bg-black max-w-full max-h-[62vh] w-auto" />
            {!started && (
                <button onClick={initGame} className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400">
                    게임 시작
                </button>
            )}
            {gameOver && (
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">게임 오버!</div>
                    <button onClick={initGame} className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400">
                        다시 시작
                    </button>
                </div>
            )}
            {started && !gameOver && (
                <div className="grid grid-cols-3 gap-2 lg:hidden">
                    <div></div>
                    <button onClick={() => gameStateRef.current.pacman.dir = { x: 0, y: -1 }} className="p-4 bg-slate-700 rounded-lg">▲</button>
                    <div></div>
                    <button onClick={() => gameStateRef.current.pacman.dir = { x: -1, y: 0 }} className="p-4 bg-slate-700 rounded-lg">◀</button>
                    <button onClick={() => gameStateRef.current.pacman.dir = { x: 0, y: 1 }} className="p-4 bg-slate-700 rounded-lg">▼</button>
                    <button onClick={() => gameStateRef.current.pacman.dir = { x: 1, y: 0 }} className="p-4 bg-slate-700 rounded-lg">▶</button>
                </div>
            )}
        </div>
    );
};

export default PacmanGame;
