import React, { useRef, useState, useEffect, useCallback } from 'react';
import MobileControls from './MobileControls';

// Pong Game (vs AI)
const PongGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [started, setStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const gameStateRef = useRef({
        player: { y: 200, height: 100 },
        ai: { y: 200, height: 100 },
        ball: { x: 400, y: 250, dx: 6, dy: 4 },
        paddleWidth: 15,
    });

    const initGame = () => {
        gameStateRef.current = {
            player: { y: 200, height: 100 },
            ai: { y: 200, height: 100 },
            ball: { x: 400, y: 250, dx: 6, dy: (Math.random() - 0.5) * 8 },
            paddleWidth: 15,
        };
        setPlayerScore(0);
        setAiScore(0);
        setGameOver(false);
        setStarted(true);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;

        const draw = () => {
            const { player, ai, ball, paddleWidth } = state;

            // Move ball
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Top/bottom collision
            if (ball.y <= 10 || ball.y >= canvas.height - 10) ball.dy = -ball.dy;

            // Player paddle collision
            if (ball.x <= paddleWidth + 20 && ball.y >= player.y && ball.y <= player.y + player.height) {
                ball.dx = Math.abs(ball.dx);
                ball.dy = (ball.y - (player.y + player.height / 2)) / 10;
            }

            // AI paddle collision
            if (ball.x >= canvas.width - paddleWidth - 20 && ball.y >= ai.y && ball.y <= ai.y + ai.height) {
                ball.dx = -Math.abs(ball.dx);
                ball.dy = (ball.y - (ai.y + ai.height / 2)) / 10;
            }

            // Score
            if (ball.x <= 0) {
                setAiScore(s => {
                    if (s + 1 >= 5) setGameOver(true);
                    return s + 1;
                });
                ball.x = 400; ball.y = 250; ball.dx = 6; ball.dy = (Math.random() - 0.5) * 8;
            }
            if (ball.x >= canvas.width) {
                setPlayerScore(s => {
                    if (s + 1 >= 5) setGameOver(true);
                    return s + 1;
                });
                ball.x = 400; ball.y = 250; ball.dx = -6; ball.dy = (Math.random() - 0.5) * 8;
            }

            // AI movement
            const aiCenter = ai.y + ai.height / 2;
            if (ball.dx > 0) {
                if (aiCenter < ball.y - 25) ai.y = Math.min(canvas.height - ai.height, ai.y + 5);
                if (aiCenter > ball.y + 25) ai.y = Math.max(0, ai.y - 5);
            }

            // Draw
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center line
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = '#334155';
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Paddles
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.roundRect(10, player.y, paddleWidth, player.height, 6);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(canvas.width - paddleWidth - 10, ai.y, paddleWidth, ai.height, 6);
            ctx.fill();

            // Ball
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 12, 0, Math.PI * 2);
            ctx.fill();

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver]);

    const moveUp = useCallback(() => {
        const state = gameStateRef.current;
        state.player.y = Math.max(0, state.player.y - 25);
    }, []);

    const moveDown = useCallback(() => {
        const state = gameStateRef.current;
        const canvasHeight = canvasRef.current ? canvasRef.current.height : 500;
        state.player.y = Math.min(canvasHeight - state.player.height, state.player.y + 25);
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
            gameStateRef.current.player.y = Math.max(0, Math.min(canvas.height - gameStateRef.current.player.height, y - gameStateRef.current.player.height / 2));
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w') moveUp();
            if (e.key === 'ArrowDown' || e.key === 's') moveDown();
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('keydown', handleKey);
        };
    }, [moveUp, moveDown]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-8 text-2xl font-bold">
                <span className="text-green-500">{playerScore}</span>
                <span className="text-slate-400">:</span>
                <span className="text-red-500">{aiScore}</span>
            </div>
            <canvas ref={canvasRef} width={800} height={500} className="rounded-lg bg-slate-900 max-w-full" />
            {!started && (
                <button onClick={initGame} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400">
                    게임 시작
                </button>
            )}
            {gameOver && (
                <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${playerScore >= 5 ? 'text-green-500' : 'text-red-500'}`}>
                        {playerScore >= 5 ? '🎉 승리!' : '패배...'}
                    </div>
                    <button onClick={initGame} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400">
                        다시 시작
                    </button>
                </div>
            )}
            <p className="text-sm text-slate-400">마우스, 터치, 또는 W/S 키로 조작</p>
            <MobileControls
                type="vertical"
                onUp={moveUp}
                onDown={moveDown}
            />
        </div>
    );
};

export default PongGame;
