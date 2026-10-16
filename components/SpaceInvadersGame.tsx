import React, { useRef, useState, useEffect, useCallback } from 'react';

// Space Invaders Game
const SpaceInvadersGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [started, setStarted] = useState(false);

    const gameStateRef = useRef({
        player: { x: 280, width: 50 },
        bullets: [] as { x: number; y: number }[],
        enemies: [] as { x: number; y: number; type: number }[],
        enemyBullets: [] as { x: number; y: number }[],
        barriers: [] as { x: number; y: number; w: number; h: number; hp: number }[],
        enemyDir: 1,
        lastShot: 0,
        lastEnemyShot: 0,
        touchLeft: false,
        touchRight: false,
        touchFire: false,
    });

    const initGame = useCallback(() => {
        const enemies: { x: number; y: number; type: number }[] = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 7; col++) {
                enemies.push({ x: col * 70 + 50, y: row * 50 + 50, type: row < 1 ? 0 : 1 });
            }
        }
        // 방어막 4개
        const barriers = [0, 1, 2, 3].map(i => ({ x: 60 + i * 150, y: 520, w: 60, h: 40, hp: 4 }));
        gameStateRef.current = {
            player: { x: 280, width: 50 },
            bullets: [],
            enemies,
            enemyBullets: [],
            barriers,
            enemyDir: 1,
            lastShot: 0,
            lastEnemyShot: 0,
            touchLeft: false,
            touchRight: false,
            touchFire: false,
        };
        setScore(0);
        setLives(3);
        setGameOver(false);
        setWon(false);
        setStarted(true);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !started || gameOver || won) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const state = gameStateRef.current;
        let frameCount = 0;

        const draw = (timestamp: number) => {
            frameCount++;

            // 터치 홀드 이동/연사
            if (state.touchLeft) state.player.x = Math.max(0, state.player.x - 6);
            if (state.touchRight) state.player.x = Math.min(canvas.width - state.player.width, state.player.x + 6);
            if (state.touchFire && timestamp - state.lastShot > 250) {
                state.bullets.push({ x: state.player.x + state.player.width / 2, y: canvas.height - 55 });
                state.lastShot = timestamp;
            }

            // Move bullets
            state.bullets = state.bullets.filter(b => b.y > 0);
            state.bullets.forEach(b => b.y -= 8);

            // Move enemy bullets
            state.enemyBullets = state.enemyBullets.filter(b => b.y < canvas.height);
            state.enemyBullets.forEach(b => b.y += 4);

            // Move enemies (slower)
            if (frameCount % 45 === 0) {
                let hitEdge = false;
                state.enemies.forEach(e => {
                    e.x += state.enemyDir * 8;
                    if (e.x <= 10 || e.x >= canvas.width - 40) hitEdge = true;
                });
                if (hitEdge) {
                    state.enemyDir *= -1;
                    state.enemies.forEach(e => e.y += 15);
                }
            }

            // Enemy shooting
            if (timestamp - state.lastEnemyShot > 1000 && state.enemies.length > 0) {
                const shooter = state.enemies[Math.floor(Math.random() * state.enemies.length)];
                state.enemyBullets.push({ x: shooter.x + 15, y: shooter.y + 25 });
                state.lastEnemyShot = timestamp;
            }

            // Bullet-enemy collision
            state.bullets.forEach((bullet, bi) => {
                state.enemies.forEach((enemy, ei) => {
                    if (bullet.x > enemy.x && bullet.x < enemy.x + 30 &&
                        bullet.y > enemy.y && bullet.y < enemy.y + 25) {
                        state.bullets.splice(bi, 1);
                        state.enemies.splice(ei, 1);
                        setScore(s => s + (enemy.type === 0 ? 20 : 10));
                    }
                });
            });

            // 방어막 충돌 (플레이어/적 탄환 모두)
            const hitBarrier = (b: { x: number; y: number }): boolean => {
                for (const bar of state.barriers) {
                    if (bar.hp <= 0) continue;
                    if (b.x > bar.x && b.x < bar.x + bar.w && b.y > bar.y && b.y < bar.y + bar.h) {
                        bar.hp--;
                        return true;
                    }
                }
                return false;
            };
            state.bullets = state.bullets.filter(b => !hitBarrier(b));
            state.enemyBullets = state.enemyBullets.filter(b => !hitBarrier(b));

            // Enemy bullet-player collision
            state.enemyBullets.forEach((bullet, i) => {
                if (bullet.x > state.player.x && bullet.x < state.player.x + state.player.width &&
                    bullet.y > canvas.height - 50) {
                    state.enemyBullets.splice(i, 1);
                    setLives(l => {
                        if (l <= 1) setGameOver(true);
                        return l - 1;
                    });
                }
            });

            // Enemy reaches bottom
            if (state.enemies.some(e => e.y > canvas.height - 80)) {
                setGameOver(true);
            }

            // Win condition
            if (state.enemies.length === 0) {
                setWon(true);
            }

            // Draw
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.5})`;
                ctx.fillRect((i * 37) % canvas.width, (i * 53 + frameCount * 0.1) % canvas.height, 2, 2);
            }

            // Draw player
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.moveTo(state.player.x + state.player.width / 2, canvas.height - 50);
            ctx.lineTo(state.player.x, canvas.height - 25);
            ctx.lineTo(state.player.x + state.player.width, canvas.height - 25);
            ctx.fill();
            ctx.fillRect(state.player.x + state.player.width / 2 - 3, canvas.height - 55, 6, 10);

            // Draw enemies
            state.enemies.forEach(enemy => {
                ctx.fillStyle = enemy.type === 0 ? '#ef4444' : '#a855f7';
                ctx.fillRect(enemy.x, enemy.y, 30, 20);
                // Eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(enemy.x + 5, enemy.y + 8, 6, 6);
                ctx.fillRect(enemy.x + 19, enemy.y + 8, 6, 6);
                // Tentacles
                ctx.fillStyle = enemy.type === 0 ? '#ef4444' : '#a855f7';
                ctx.fillRect(enemy.x + 2, enemy.y + 20, 6, 5);
                ctx.fillRect(enemy.x + 12, enemy.y + 20, 6, 5);
                ctx.fillRect(enemy.x + 22, enemy.y + 20, 6, 5);
            });

            // Draw barriers
            state.barriers.forEach(bar => {
                if (bar.hp <= 0) return;
                ctx.fillStyle = `rgba(34,197,94,${0.25 + bar.hp * 0.18})`;
                ctx.fillRect(bar.x, bar.y, bar.w, bar.h * (bar.hp / 4));
            });

            // Draw bullets
            ctx.fillStyle = '#fbbf24';
            state.bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 12));

            // Draw enemy bullets
            ctx.fillStyle = '#ef4444';
            state.enemyBullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 10));

            // Draw lives
            for (let i = 0; i < lives; i++) {
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(20 + i * 30, canvas.height - 15);
                ctx.lineTo(10 + i * 30, canvas.height - 5);
                ctx.lineTo(30 + i * 30, canvas.height - 5);
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationId);
    }, [started, gameOver, won, lives]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const handleKey = (e: KeyboardEvent) => {
            const state = gameStateRef.current;
            const canvasWidth = canvas?.width || 600;
            if (e.key === 'ArrowLeft' || e.key === 'a') state.player.x = Math.max(0, state.player.x - 15);
            if (e.key === 'ArrowRight' || e.key === 'd') state.player.x = Math.min(canvasWidth - state.player.width, state.player.x + 15);
            if (e.code === 'Space') {
                e.preventDefault();
                const now = Date.now();
                if (now - state.lastShot > 200) {
                    state.bullets.push({ x: state.player.x + state.player.width / 2, y: (canvas?.height || 700) - 55 });
                    state.lastShot = now;
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-6 text-lg font-bold text-slate-800 dark:text-white">
                <span>점수: {score}</span>
                <span className="text-red-500">생명: {lives}</span>
            </div>
            <canvas ref={canvasRef} width={600} height={700} className="rounded-lg bg-black max-w-full max-h-[62vh] w-auto" />
            {!started && (
                <button onClick={initGame} className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400">
                    게임 시작
                </button>
            )}
            {(gameOver || won) && (
                <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${won ? 'text-green-500' : 'text-red-500'}`}>
                        {won ? '🎉 지구를 지켰습니다!' : '게임 오버!'}
                    </div>
                    <button onClick={initGame} className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400">
                        다시 시작
                    </button>
                </div>
            )}
            {started && !gameOver && !won && (
                <div className="grid grid-cols-3 gap-2 lg:hidden select-none">
                    <button
                        onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.touchLeft = true; }}
                        onTouchEnd={() => gameStateRef.current.touchLeft = false}
                        onTouchCancel={() => gameStateRef.current.touchLeft = false}
                        onMouseDown={() => gameStateRef.current.touchLeft = true}
                        onMouseUp={() => gameStateRef.current.touchLeft = false}
                        onMouseLeave={() => gameStateRef.current.touchLeft = false}
                        className="p-4 bg-slate-700 text-white rounded-lg active:bg-slate-500">◀</button>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.touchFire = true; }}
                        onTouchEnd={() => gameStateRef.current.touchFire = false}
                        onTouchCancel={() => gameStateRef.current.touchFire = false}
                        onMouseDown={() => gameStateRef.current.touchFire = true}
                        onMouseUp={() => gameStateRef.current.touchFire = false}
                        onMouseLeave={() => gameStateRef.current.touchFire = false}
                        className="p-4 bg-red-600 text-white rounded-lg active:bg-red-400">🔥</button>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); gameStateRef.current.touchRight = true; }}
                        onTouchEnd={() => gameStateRef.current.touchRight = false}
                        onTouchCancel={() => gameStateRef.current.touchRight = false}
                        onMouseDown={() => gameStateRef.current.touchRight = true}
                        onMouseUp={() => gameStateRef.current.touchRight = false}
                        onMouseLeave={() => gameStateRef.current.touchRight = false}
                        className="p-4 bg-slate-700 text-white rounded-lg active:bg-slate-500">▶</button>
                </div>
            )}
        </div>
    );
};

export default SpaceInvadersGame;
