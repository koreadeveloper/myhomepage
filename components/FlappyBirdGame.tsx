import React, { useRef, useState, useEffect, useCallback } from 'react';
import MobileControls from './MobileControls';

// Flappy Bird Game
const FlappyBirdGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

    const gameStateRef = useRef({
        bird: { y: 300, velocity: 0 },
        pipes: [] as { x: number; gapY: number }[],
        frameCount: 0,
    });

    const GRAVITY = 0.25;
    const JUMP_FORCE = -6;
    const PIPE_WIDTH = 70;
    const PIPE_GAP = 220;
    const PIPE_SPEED = 2;

    const initGame = useCallback(() => {
        gameStateRef.current = {
            bird: { y: 300, velocity: 0 },
            pipes: [],
            frameCount: 0,
        };
        setScore(0);
        setGameOver(false);
        setStarted(true);
    }, []);

    const jump = useCallback(() => {
        if (gameOver) {
            initGame();
            return;
        }
        if (!started) {
            initGame();
        }
        gameStateRef.current.bird.velocity = JUMP_FORCE;
    }, [gameOver, started, initGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;

        const draw = () => {
            state.frameCount++;

            // Update bird
            state.bird.velocity += GRAVITY;
            state.bird.y += state.bird.velocity;

            // Add pipes
            if (state.frameCount % 120 === 0) {
                const gapY = Math.random() * (canvas.height - PIPE_GAP - 150) + 80;
                state.pipes.push({ x: canvas.width, gapY });
            }

            // Update pipes
            state.pipes = state.pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
            state.pipes.forEach(pipe => {
                pipe.x -= PIPE_SPEED;

                // Score
                if (pipe.x + PIPE_WIDTH === 50) {
                    setScore(s => s + 1);
                }

                // Collision
                const birdX = 80;
                const birdSize = 30;
                if (pipe.x < birdX + birdSize && pipe.x + PIPE_WIDTH > birdX - birdSize) {
                    if (state.bird.y - birdSize < pipe.gapY || state.bird.y + birdSize > pipe.gapY + PIPE_GAP) {
                        setGameOver(true);
                        setScore(s => {
                            setBestScore(b => Math.max(b, s));
                            return s;
                        });
                    }
                }
            });

            // Ground/ceiling collision
            if (state.bird.y >= canvas.height - 30 || state.bird.y <= 0) {
                setGameOver(true);
                setScore(s => {
                    setBestScore(b => Math.max(b, s));
                    return s;
                });
            }

            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(1, '#98d8eb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw pipes
            state.pipes.forEach(pipe => {
                ctx.fillStyle = '#22c55e';
                // Top pipe
                ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(pipe.x - 3, pipe.gapY - 20, PIPE_WIDTH + 6, 20);
                // Bottom pipe
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.gapY - PIPE_GAP);
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(pipe.x - 3, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 6, 20);
            });

            // Draw ground
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            ctx.fillStyle = '#228b22';
            ctx.fillRect(0, canvas.height - 30, canvas.width, 5);

            // Draw bird
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(80, state.bird.y, 28, 20, Math.min(state.bird.velocity * 0.1, 0.5), 0, Math.PI * 2);
            ctx.fill();
            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(92, state.bird.y - 4, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(95, state.bird.y - 4, 4, 0, Math.PI * 2);
            ctx.fill();
            // Beak
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(103, state.bird.y);
            ctx.lineTo(118, state.bird.y + 4);
            ctx.lineTo(103, state.bird.y + 8);
            ctx.fill();
            // Wing
            ctx.fillStyle = '#fcd34d';
            ctx.beginPath();
            ctx.ellipse(60, state.bird.y + 6, 16, 10, -0.3 + Math.sin(state.frameCount * 0.3) * 0.3, 0, Math.PI * 2);
            ctx.fill();

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [jump]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6 text-lg font-bold">
                <span className="text-white">점수: {score}</span>
                <span className="text-yellow-400">최고: {bestScore}</span>
            </div>
            <canvas
                ref={canvasRef}
                width={500}
                height={650}
                className="rounded-lg cursor-pointer max-w-full"
                onClick={jump}
                onTouchStart={jump}
            />
            {!started && (
                <div className="text-center">
                    <p className="text-slate-300 mb-2">화면을 탭하거나 스페이스바를 눌러 점프!</p>
                    <button onClick={initGame} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-400">
                        게임 시작
                    </button>
                </div>
            )}
            {gameOver && (
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">게임 오버!</div>
                    <button onClick={initGame} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-400">
                        다시 시작
                    </button>
                </div>
            )}

            <MobileControls
                type="jump"
                onAction={jump}
                onActionLabel="JUMP"
            />
        </div >
    );
};

export default FlappyBirdGame;
