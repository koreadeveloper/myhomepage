import React, { useRef, useState, useEffect, useCallback } from 'react';

// Dino Jump Game (Chrome Dinosaur Clone)
const DinoJumpGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

    const gameStateRef = useRef({
        dino: { y: 0, velocity: 0, jumping: false, ducking: false },
        obstacles: [] as { x: number; type: 'cactus' | 'bird'; height: number }[],
        ground: 0,
        speed: 5,
        frameCount: 0,
    });

    const GRAVITY = 0.6;
    const JUMP_FORCE = -14;

    const initGame = useCallback(() => {
        gameStateRef.current = {
            dino: { y: 0, velocity: 0, jumping: false, ducking: false },
            obstacles: [],
            ground: 0,
            speed: 5,
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
        const state = gameStateRef.current;
        if (!state.dino.jumping) {
            state.dino.velocity = JUMP_FORCE;
            state.dino.jumping = true;
        }
    }, [gameOver, started, initGame]);

    const duck = useCallback((ducking: boolean) => {
        gameStateRef.current.dino.ducking = ducking;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;
        const groundY = canvas.height - 50;

        const draw = () => {
            state.frameCount++;

            // Update score
            if (state.frameCount % 5 === 0) {
                setScore(s => s + 1);
            }

            // Increase speed
            if (state.frameCount % 600 === 0) {
                state.speed = Math.min(12, state.speed + 0.4);
            }

            // Update dino
            state.dino.velocity += GRAVITY;
            state.dino.y += state.dino.velocity;
            if (state.dino.y >= 0) {
                state.dino.y = 0;
                state.dino.jumping = false;
            }

            // Spawn obstacles
            if (state.frameCount % Math.floor(100 - state.speed * 2) === 0) {
                const type = Math.random() > 0.75 ? 'bird' : 'cactus';
                state.obstacles.push({
                    x: canvas.width,
                    type,
                    height: type === 'bird' ? 40 + Math.random() * 50 : 40 + Math.random() * 40,
                });
            }

            // Update obstacles
            state.obstacles = state.obstacles.filter(o => o.x + 40 > 0);
            state.obstacles.forEach(o => o.x -= state.speed);

            // Collision detection
            const dinoX = 80;
            const dinoY = groundY - 70 + state.dino.y;
            const dinoW = state.dino.ducking ? 70 : 55;
            const dinoH = state.dino.ducking ? 35 : 70;

            state.obstacles.forEach(o => {
                const oX = o.x;
                const oY = o.type === 'bird' ? groundY - o.height - 30 : groundY - o.height;
                const oW = o.type === 'bird' ? 50 : 28;
                const oH = o.type === 'bird' ? 28 : o.height;

                if (dinoX + dinoW > oX && dinoX < oX + oW &&
                    dinoY + dinoH > oY && dinoY < oY + oH) {
                    setGameOver(true);
                    setScore(s => {
                        setBestScore(b => Math.max(b, s));
                        return s;
                    });
                }
            });

            // Draw background
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.fillStyle = '#64748b';
            ctx.fillRect(0, groundY, canvas.width, 2);
            // Ground details
            for (let i = 0; i < canvas.width; i += 20) {
                if (Math.random() > 0.7) {
                    ctx.fillRect((i - state.frameCount * state.speed * 0.5) % canvas.width, groundY + 5, 3, 1);
                }
            }

            // Draw clouds
            ctx.fillStyle = '#e2e8f0';
            [100, 250, 400, 550].forEach((cx, i) => {
                const cloudX = (cx - state.frameCount * 0.5 + 700) % 700;
                ctx.beginPath();
                ctx.arc(cloudX, 50 + i * 10, 20, 0, Math.PI * 2);
                ctx.arc(cloudX + 20, 45 + i * 10, 25, 0, Math.PI * 2);
                ctx.arc(cloudX + 45, 50 + i * 10, 20, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw dino
            ctx.fillStyle = '#475569';
            if (state.dino.ducking) {
                ctx.fillRect(dinoX, dinoY + 35, 70, 35);
                ctx.fillRect(dinoX + 55, dinoY + 28, 22, 14); // Head
            } else {
                ctx.fillRect(dinoX, dinoY, 55, 70);
                ctx.fillRect(dinoX + 40, dinoY - 15, 28, 28); // Head
                // Eye
                ctx.fillStyle = '#fff';
                ctx.fillRect(dinoX + 58, dinoY - 7, 7, 7);
                ctx.fillStyle = '#475569';
                // Legs animation
                const legOffset = state.dino.jumping ? 0 : Math.sin(state.frameCount * 0.3) * 6;
                ctx.fillRect(dinoX + 8, dinoY + 70, 12, 14 + legOffset);
                ctx.fillRect(dinoX + 35, dinoY + 70, 12, 14 - legOffset);
            }

            // Draw obstacles
            state.obstacles.forEach(o => {
                if (o.type === 'cactus') {
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(o.x, groundY - o.height, 28, o.height);
                    ctx.fillRect(o.x - 10, groundY - o.height + 15, 14, 7);
                    ctx.fillRect(o.x + 24, groundY - o.height + 28, 14, 7);
                } else {
                    ctx.fillStyle = '#64748b';
                    const birdY = groundY - o.height - 30;
                    ctx.fillRect(o.x, birdY, 50, 20);
                    // Wings
                    const wingY = Math.sin(state.frameCount * 0.3) * 10;
                    ctx.fillRect(o.x + 12, birdY - 12 + wingY, 26, 12);
                }
            });

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
            if (e.key === 'ArrowDown') {
                duck(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                duck(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [jump, duck]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6 text-lg font-bold">
                <span className="text-slate-700">점수: {score}</span>
                <span className="text-amber-600">최고: {bestScore}</span>
            </div>
            <canvas
                ref={canvasRef}
                width={900}
                height={280}
                className="rounded-lg border-2 border-slate-300 cursor-pointer max-w-full"
                onClick={jump}
                onTouchStart={jump}
            />
            {!started && (
                <div className="text-center">
                    <p className="text-slate-500 mb-2">스페이스바 또는 화면을 탭해서 점프!</p>
                    <button onClick={initGame} className="px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">
                        게임 시작
                    </button>
                </div>
            )}
            {gameOver && (
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">게임 오버!</div>
                    <button onClick={initGame} className="px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500">
                        다시 시작
                    </button>
                </div>
            )}
        </div>
    );
};

export default DinoJumpGame;
