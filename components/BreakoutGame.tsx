import React, { useRef, useState, useEffect, useCallback } from 'react';
import MobileControls from './MobileControls';

// Breakout Game
const BreakoutGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [started, setStarted] = useState(false);

    const gameStateRef = useRef({
        paddle: { x: 250, width: 100, height: 14 },
        ball: { x: 300, y: 500, dx: 4, dy: -5, radius: 10 },
        bricks: [] as { x: number; y: number; width: number; height: number; color: string; hit: boolean }[],
    });

    const initGame = () => {
        const bricks: typeof gameStateRef.current.bricks = [];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 10; col++) {
                bricks.push({
                    x: col * 60 + 5,
                    y: row * 30 + 40,
                    width: 55,
                    height: 25,
                    color: colors[row],
                    hit: false,
                });
            }
        }
        gameStateRef.current = {
            paddle: { x: 250, width: 100, height: 14 },
            ball: { x: 300, y: 500, dx: 4 + Math.random() * 2, dy: -5, radius: 10 },
            bricks,
        };
        setScore(0);
        setGameOver(false);
        setWon(false);
        setStarted(true);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver || won) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;

        const draw = () => {
            const { paddle, ball, bricks } = state;

            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Wall collisions
            if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) ball.dx = -ball.dx;
            if (ball.y <= ball.radius) ball.dy = -ball.dy;

            // Paddle collision
            if (ball.y + ball.radius >= canvas.height - paddle.height - 10 &&
                ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
                ball.dy = -Math.abs(ball.dy);
                ball.dx = (ball.x - (paddle.x + paddle.width / 2)) / 10;
            }

            // Bottom - game over
            if (ball.y >= canvas.height) {
                setGameOver(true);
                return;
            }

            // Brick collisions
            let remaining = 0;
            bricks.forEach(brick => {
                if (brick.hit) return;
                remaining++;
                if (ball.x >= brick.x && ball.x <= brick.x + brick.width &&
                    ball.y >= brick.y && ball.y <= brick.y + brick.height) {
                    brick.hit = true;
                    ball.dy = -ball.dy;
                    setScore(s => s + 10);
                    remaining--;
                }
            });

            if (remaining === 0) {
                setWon(true);
                return;
            }

            // Draw
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw bricks
            bricks.forEach(brick => {
                if (brick.hit) return;
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                ctx.strokeStyle = '#fff3';
                ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            });

            // Draw paddle
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.roundRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height, 6);
            ctx.fill();

            // Draw ball
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver, won]);

    const moveLeft = useCallback(() => {
        const state = gameStateRef.current;
        state.paddle.x = Math.max(0, state.paddle.x - 25);
    }, []);

    const moveRight = useCallback(() => {
        const state = gameStateRef.current;
        const canvasWidth = canvasRef.current ? canvasRef.current.width : 600;
        state.paddle.x = Math.min(canvasWidth - state.paddle.width, state.paddle.x + 25);
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
            gameStateRef.current.paddle.x = Math.max(0, Math.min(canvas.width - gameStateRef.current.paddle.width, x - gameStateRef.current.paddle.width / 2));
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
            if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('keydown', handleKey);
        };
    }, [moveLeft, moveRight]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-lg font-bold text-white">점수: {score}</div>
            <canvas ref={canvasRef} width={600} height={650} className="rounded-lg bg-slate-900 max-w-full" />
            {!started && (
                <button onClick={initGame} className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400">
                    게임 시작
                </button>
            )}
            {(gameOver || won) && (
                <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${won ? 'text-green-500' : 'text-red-500'}`}>
                        {won ? '🎉 승리!' : '게임 오버!'}
                    </div>
                    <button onClick={initGame} className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400">
                        다시 시작
                    </button>
                </div>
            )}
            {/* Remove hardcoded width constraint in logic above */}
            <MobileControls
                type="horizontal"
                onLeft={moveLeft}
                onRight={moveRight}
            />
        </div>
    );
};

export default BreakoutGame;
