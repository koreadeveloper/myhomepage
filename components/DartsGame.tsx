import React, { useState, useRef, useEffect, useCallback } from 'react';

const DartsGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(501);
    const [currentRoundScore, setCurrentRoundScore] = useState(0);
    const [dartsLeft, setDartsLeft] = useState(3);
    const [throwHistory, setThrowHistory] = useState<number[]>([]);
    const [isAiming, setIsAiming] = useState(false);
    const [power, setPower] = useState(0);
    const [powerDirection, setPowerDirection] = useState(1);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [dartPositions, setDartPositions] = useState<{ x: number, y: number, score: number }[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(false);

    const boardRadius = 190;
    const centerX = 250;
    const centerY = 250;

    // 다트판 섹터 값 (시계방향, 12시가 20)
    const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

    // 점수 계산
    const calculateScore = useCallback((x: number, y: number): number => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Bull's Eye
        if (distance <= 12) return 50;  // Double Bull
        if (distance <= 30) return 25; // Single Bull

        // 밖으로 나감
        if (distance > boardRadius) return 0;

        // 각도 계산 (12시 방향이 0도)
        let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        const sectorIndex = Math.floor((angle + 9) / 18) % 20;
        const baseScore = sectors[sectorIndex];

        // 링 영역 확인 (더 큰 판 반영)
        if (distance >= 115 && distance <= 130) return baseScore * 3; // Triple
        if (distance >= 175 && distance <= 190) return baseScore * 2; // Double

        return baseScore;
    }, []);

    // 다트판 그리기
    const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, 500, 500);

        // 배경
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 500, 500);

        // 외곽 링
        ctx.beginPath();
        ctx.arc(centerX, centerY, boardRadius + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();

        // 섹터 그리기
        const colors = { even: '#e74c3c', odd: '#27ae60', evenLight: '#f5f5dc', oddLight: '#1a1a1a' };

        for (let i = 0; i < 20; i++) {
            const startAngle = (i * 18 - 99) * (Math.PI / 180);
            const endAngle = ((i + 1) * 18 - 99) * (Math.PI / 180);

            // Double ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, boardRadius, startAngle, endAngle);
            ctx.arc(centerX, centerY, 140, endAngle, startAngle, true);
            ctx.fillStyle = i % 2 === 0 ? colors.even : colors.odd;
            ctx.fill();
            ctx.stroke();

            // Outer single
            ctx.beginPath();
            ctx.arc(centerX, centerY, 175, startAngle, endAngle);
            ctx.arc(centerX, centerY, 130, endAngle, startAngle, true);
            ctx.fillStyle = i % 2 === 0 ? colors.evenLight : colors.oddLight;
            ctx.fill();
            ctx.stroke();

            // Triple ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, 130, startAngle, endAngle);
            ctx.arc(centerX, centerY, 115, endAngle, startAngle, true);
            ctx.fillStyle = i % 2 === 0 ? colors.even : colors.odd;
            ctx.fill();
            ctx.stroke();

            // Inner single
            ctx.beginPath();
            ctx.arc(centerX, centerY, 115, startAngle, endAngle);
            ctx.arc(centerX, centerY, 30, endAngle, startAngle, true);
            ctx.fillStyle = i % 2 === 0 ? colors.evenLight : colors.oddLight;
            ctx.fill();
            ctx.stroke();

            // 숫자
            const numAngle = (i * 18 - 90) * (Math.PI / 180);
            const numX = centerX + Math.cos(numAngle) * (boardRadius + 20);
            const numY = centerY + Math.sin(numAngle) * (boardRadius + 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sectors[i].toString(), numX, numY);
        }

        // Bull's eye
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#27ae60';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.stroke();

        // 던진 다트 표시
        dartPositions.forEach((dart, i) => {
            ctx.beginPath();
            ctx.arc(dart.x, dart.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // 조준선
        if (isAiming && !gameOver) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }, [dartPositions, isAiming, mousePos, gameOver]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawBoard(ctx);
    }, [drawBoard]);

    // 파워 게이지 애니메이션
    useEffect(() => {
        if (!isAiming) return;
        const interval = setInterval(() => {
            setPower(p => {
                const newPower = p + powerDirection * 2;
                if (newPower >= 100) {
                    setPowerDirection(-1);
                    return 100;
                }
                if (newPower <= 0) {
                    setPowerDirection(1);
                    return 0;
                }
                return newPower;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [isAiming, powerDirection]);

    // 다트 던지기
    const throwDart = () => {
        if (gameOver || dartsLeft <= 0) return;

        // 파워에 따른 정확도 (높은 파워 = 더 정확)
        const accuracy = power / 100;
        const randomOffset = (1 - accuracy) * 50;
        const targetX = mousePos.x + (Math.random() - 0.5) * randomOffset;
        const targetY = mousePos.y + (Math.random() - 0.5) * randomOffset;

        const hitScore = calculateScore(targetX, targetY);

        setDartPositions(prev => [...prev, { x: targetX, y: targetY, score: hitScore }]);
        setThrowHistory(prev => [...prev, hitScore]);
        setCurrentRoundScore(prev => prev + hitScore);
        setDartsLeft(prev => prev - 1);

        // 점수 체크
        const newScore = score - hitScore;
        if (newScore === 0) {
            setScore(0);
            setWinner(true);
            setGameOver(true);
        } else if (newScore < 0) {
            // Bust - 라운드 무효
            setCurrentRoundScore(0);
            setDartsLeft(0);
        } else {
            setScore(newScore);
        }

        setIsAiming(false);
        setPower(0);
    };

    // 다음 라운드
    const nextRound = () => {
        setDartsLeft(3);
        setCurrentRoundScore(0);
        setDartPositions([]);
        setThrowHistory([]);
    };

    // 새 게임
    const resetGame = () => {
        setScore(501);
        setCurrentRoundScore(0);
        setDartsLeft(3);
        setThrowHistory([]);
        setDartPositions([]);
        setGameOver(false);
        setWinner(false);
        setIsAiming(false);
        setPower(0);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseDown = () => {
        if (dartsLeft > 0 && !gameOver) {
            setIsAiming(true);
            setPower(0);
            setPowerDirection(1);
        }
    };

    const handleMouseUp = () => {
        if (isAiming) {
            throwDart();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full h-full p-4">
            {/* 게임 정보 */}
            <div className="flex flex-col gap-4 items-center lg:items-start">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🎯 다트 501</h1>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">남은 점수</div>
                    <div className="text-4xl font-bold text-red-600 dark:text-red-400">{score}</div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 shadow-lg text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400">남은 다트</div>
                        <div className="text-xl font-bold text-indigo-600">{'🎯'.repeat(dartsLeft)}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 shadow-lg text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400">이번 라운드</div>
                        <div className="text-xl font-bold text-green-600">{currentRoundScore}</div>
                    </div>
                </div>

                {/* 던진 기록 */}
                <div className="flex gap-2">
                    {throwHistory.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm font-bold">
                            {s}
                        </span>
                    ))}
                </div>

                {dartsLeft === 0 && !gameOver && (
                    <button
                        onClick={nextRound}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                    >
                        다음 라운드 →
                    </button>
                )}

                <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700"
                >
                    🔄 새 게임
                </button>
            </div>

            {/* 다트판 */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="rounded-xl shadow-2xl cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setIsAiming(false)}
                />

                {/* 파워 게이지 */}
                {isAiming && (
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 w-48">
                        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                                style={{ width: `${power}%` }}
                            />
                        </div>
                        <div className="text-center text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                            파워: {power}%
                        </div>
                    </div>
                )}

                {/* 승리/패배 오버레이 */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                            <div className="text-4xl mb-2">{winner ? '🏆' : '😢'}</div>
                            <div className="text-2xl font-bold text-white">
                                {winner ? '승리!' : '게임 오버'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 도움말 */}
            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center lg:text-left">
                <p>💡 <strong>플레이 방법:</strong></p>
                <p>1. 마우스로 조준점을 정합니다</p>
                <p>2. 클릭하고 있으면 파워 게이지가 움직입니다</p>
                <p>3. 원하는 파워에서 놓으면 다트가 날아갑니다</p>
                <p>4. 501점에서 정확히 0으로 만들면 승리!</p>
            </div>
        </div>
    );
};

export default DartsGame;
