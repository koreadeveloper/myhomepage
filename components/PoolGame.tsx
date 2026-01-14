import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    number: number;
    pocketed: boolean;
}

const PoolGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const [cueBall, setCueBall] = useState<Ball | null>(null);
    const [isAiming, setIsAiming] = useState(false);
    const [aimStart, setAimStart] = useState({ x: 0, y: 0 });
    const [aimEnd, setAimEnd] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    const TABLE_WIDTH = 800;
    const TABLE_HEIGHT = 400;
    const BALL_RADIUS = 12;
    const POCKET_RADIUS = 28;
    const FRICTION = 0.985;

    // 포켓 위치 (더 큰 포켓)
    const pockets = [
        { x: 25, y: 25 },
        { x: TABLE_WIDTH / 2, y: 15 },
        { x: TABLE_WIDTH - 25, y: 25 },
        { x: 25, y: TABLE_HEIGHT - 25 },
        { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 15 },
        { x: TABLE_WIDTH - 25, y: TABLE_HEIGHT - 25 },
    ];

    // 공 색상
    const ballColors = [
        '#FFFFFF', // 0: 큐볼
        '#FFD700', // 1
        '#0000FF', // 2
        '#FF0000', // 3
        '#800080', // 4
        '#FFA500', // 5
        '#008000', // 6
        '#800000', // 7
        '#000000', // 8
        '#FFD700', // 9 (스트라이프)
        '#0000FF', // 10
        '#FF0000', // 11
        '#800080', // 12
        '#FFA500', // 13
        '#008000', // 14
        '#800000', // 15
    ];

    // 게임 초기화
    const initGame = useCallback(() => {
        const newBalls: Ball[] = [];

        // 큐볼
        const cue: Ball = {
            x: 200,
            y: TABLE_HEIGHT / 2,
            vx: 0,
            vy: 0,
            radius: BALL_RADIUS,
            color: '#FFFFFF',
            number: 0,
            pocketed: false,
        };

        // 삼각형 배열로 공 배치
        const startX = 550;
        const startY = TABLE_HEIGHT / 2;
        let ballNum = 1;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col <= row; col++) {
                const x = startX + row * (BALL_RADIUS * 2 + 2);
                const y = startY + (col - row / 2) * (BALL_RADIUS * 2 + 2);
                newBalls.push({
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    radius: BALL_RADIUS,
                    color: ballColors[ballNum],
                    number: ballNum,
                    pocketed: false,
                });
                ballNum++;
            }
        }

        setBalls(newBalls);
        setCueBall(cue);
        setScore(0);
        setGameOver(false);
        setMessage('');
        setIsMoving(false);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // 물리 엔진
    useEffect(() => {
        if (!cueBall) return;

        const allBalls = [cueBall, ...balls.filter(b => !b.pocketed)];
        let moving = allBalls.some(b => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1);

        if (!moving) {
            setIsMoving(false);
            return;
        }

        setIsMoving(true);

        const interval = setInterval(() => {
            setBalls(prevBalls => {
                const updatedBalls = [...prevBalls];
                const allActiveBalls = [cueBall, ...updatedBalls.filter(b => !b.pocketed)];

                // 각 공 업데이트
                allActiveBalls.forEach(ball => {
                    if (ball.pocketed) return;

                    // 이동
                    ball.x += ball.vx;
                    ball.y += ball.vy;

                    // 마찰
                    ball.vx *= FRICTION;
                    ball.vy *= FRICTION;

                    // 벽 충돌
                    if (ball.x - ball.radius < 20) {
                        ball.x = 20 + ball.radius;
                        ball.vx *= -0.8;
                    }
                    if (ball.x + ball.radius > TABLE_WIDTH - 20) {
                        ball.x = TABLE_WIDTH - 20 - ball.radius;
                        ball.vx *= -0.8;
                    }
                    if (ball.y - ball.radius < 20) {
                        ball.y = 20 + ball.radius;
                        ball.vy *= -0.8;
                    }
                    if (ball.y + ball.radius > TABLE_HEIGHT - 20) {
                        ball.y = TABLE_HEIGHT - 20 - ball.radius;
                        ball.vy *= -0.8;
                    }

                    // 포켓 체크
                    pockets.forEach(pocket => {
                        const dx = ball.x - pocket.x;
                        const dy = ball.y - pocket.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < POCKET_RADIUS) {
                            ball.pocketed = true;
                            ball.vx = 0;
                            ball.vy = 0;
                            if (ball.number === 0) {
                                setMessage('파울! 큐볼이 들어갔습니다.');
                                setCueBall(prev => prev ? { ...prev, x: 200, y: TABLE_HEIGHT / 2, vx: 0, vy: 0, pocketed: false } : null);
                            } else if (ball.number === 8) {
                                const remainingBalls = updatedBalls.filter(b => b.number !== 8 && !b.pocketed);
                                if (remainingBalls.length === 0) {
                                    setMessage('🎉 승리! 8번 공 성공!');
                                    setGameOver(true);
                                } else {
                                    setMessage('💀 패배! 8번 공이 먼저 들어갔습니다.');
                                    setGameOver(true);
                                }
                            } else {
                                setScore(s => s + ball.number);
                                setMessage(`${ball.number}번 공 IN! +${ball.number}점`);
                            }
                        }
                    });
                });

                // 공-공 충돌
                for (let i = 0; i < allActiveBalls.length; i++) {
                    for (let j = i + 1; j < allActiveBalls.length; j++) {
                        const b1 = allActiveBalls[i];
                        const b2 = allActiveBalls[j];
                        if (b1.pocketed || b2.pocketed) continue;

                        const dx = b2.x - b1.x;
                        const dy = b2.y - b1.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < b1.radius + b2.radius) {
                            const nx = dx / dist;
                            const ny = dy / dist;

                            const dvx = b1.vx - b2.vx;
                            const dvy = b1.vy - b2.vy;
                            const dvn = dvx * nx + dvy * ny;

                            if (dvn > 0) {
                                b1.vx -= dvn * nx;
                                b1.vy -= dvn * ny;
                                b2.vx += dvn * nx;
                                b2.vy += dvn * ny;

                                // 겹침 해소
                                const overlap = (b1.radius + b2.radius - dist) / 2;
                                b1.x -= overlap * nx;
                                b1.y -= overlap * ny;
                                b2.x += overlap * nx;
                                b2.y += overlap * ny;
                            }
                        }
                    }
                }

                // 큐볼 업데이트
                setCueBall(allActiveBalls[0]);

                // 멈춤 체크
                const stillMoving = allActiveBalls.some(b => !b.pocketed && (Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1));
                if (!stillMoving) {
                    setIsMoving(false);
                    allActiveBalls.forEach(b => { b.vx = 0; b.vy = 0; });
                }

                return updatedBalls;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [cueBall, balls, isMoving]);

    // 렌더링
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !cueBall) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 테이블
        ctx.fillStyle = '#0a5c36';
        ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

        // 테두리
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(0, 0, TABLE_WIDTH, 20);
        ctx.fillRect(0, TABLE_HEIGHT - 20, TABLE_WIDTH, 20);
        ctx.fillRect(0, 0, 20, TABLE_HEIGHT);
        ctx.fillRect(TABLE_WIDTH - 20, 0, 20, TABLE_HEIGHT);

        // 포켓
        pockets.forEach(pocket => {
            ctx.beginPath();
            ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        });

        // 공들
        [...balls.filter(b => !b.pocketed), cueBall].forEach(ball => {
            if (!ball || ball.pocketed) return;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 번호
            if (ball.number > 0) {
                ctx.fillStyle = ball.number >= 9 ? '#FFF' : '#000';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(ball.number.toString(), ball.x, ball.y);
            }
        });

        // 조준선
        if (isAiming && !isMoving && cueBall) {
            ctx.beginPath();
            ctx.moveTo(cueBall.x, cueBall.y);
            const dx = aimStart.x - aimEnd.x;
            const dy = aimStart.y - aimEnd.y;
            ctx.lineTo(cueBall.x + dx * 2, cueBall.y + dy * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // 파워 표시
            const power = Math.min(Math.sqrt(dx * dx + dy * dy), 200);
            ctx.fillStyle = `rgba(255, ${255 - power}, 0, 0.8)`;
            ctx.fillRect(10, TABLE_HEIGHT - 30, power, 10);
        }
    }, [balls, cueBall, isAiming, aimStart, aimEnd, isMoving]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMoving || gameOver || !cueBall) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 큐볼 근처에서만 조준 시작 (150px로 확대)
        const dx = x - cueBall.x;
        const dy = y - cueBall.y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) {
            setIsAiming(true);
            setAimStart({ x, y });
            setAimEnd({ x, y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isAiming) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        setAimEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseUp = () => {
        if (!isAiming || !cueBall) return;
        setIsAiming(false);

        const dx = aimStart.x - aimEnd.x;
        const dy = aimStart.y - aimEnd.y;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 8, 30);

        if (power > 0.5) {
            const angle = Math.atan2(dy, dx);
            setCueBall(prev => prev ? {
                ...prev,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power,
            } : null);
            setIsMoving(true);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🎱 당구</h1>

            <div className="flex gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg text-center">
                    <div className="text-xs text-slate-500">점수</div>
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                </div>
            </div>

            {message && (
                <div className={`px-4 py-2 rounded-lg font-bold ${gameOver ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-white'}`}>
                    {message}
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                className="rounded-xl shadow-2xl cursor-crosshair border-4 border-amber-800"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsAiming(false)}
            />

            <button
                onClick={initGame}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
            >
                🔄 새 게임
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 흰 공 근처를 클릭하고 드래그하여 조준 후 놓으세요.</p>
                <p>모든 공을 넣고 마지막에 8번 공을 넣으면 승리!</p>
            </div>
        </div>
    );
};

export default PoolGame;
