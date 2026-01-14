import React, { useState, useCallback, useEffect } from 'react';

const SimonGame: React.FC = () => {
    const colors = ['red', 'blue', 'green', 'yellow'] as const;
    type ColorType = typeof colors[number];

    const [sequence, setSequence] = useState<ColorType[]>([]);
    const [playerSequence, setPlayerSequence] = useState<ColorType[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [activeColor, setActiveColor] = useState<ColorType | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('시작 버튼을 누르세요');

    const colorStyles: Record<ColorType, { base: string; active: string }> = {
        red: { base: 'bg-red-600 hover:bg-red-500', active: 'bg-red-400 shadow-lg shadow-red-400' },
        blue: { base: 'bg-blue-600 hover:bg-blue-500', active: 'bg-blue-400 shadow-lg shadow-blue-400' },
        green: { base: 'bg-green-600 hover:bg-green-500', active: 'bg-green-400 shadow-lg shadow-green-400' },
        yellow: { base: 'bg-yellow-500 hover:bg-yellow-400', active: 'bg-yellow-300 shadow-lg shadow-yellow-300' },
    };

    const playSound = useCallback((color: ColorType) => {
        // 브라우저 호환성을 위해 AudioContext 사용
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            const frequencies: Record<ColorType, number> = {
                red: 329.63,
                blue: 440,
                green: 554.37,
                yellow: 659.25,
            };

            oscillator.frequency.value = frequencies[color];
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } catch (e) {
            // Audio not supported
        }
    }, []);

    const flashColor = useCallback((color: ColorType) => {
        return new Promise<void>(resolve => {
            setActiveColor(color);
            playSound(color);
            setTimeout(() => {
                setActiveColor(null);
                setTimeout(resolve, 200);
            }, 400);
        });
    }, [playSound]);

    const showSequence = useCallback(async (seq: ColorType[]) => {
        setIsShowingSequence(true);
        setMessage('패턴을 기억하세요...');

        await new Promise(resolve => setTimeout(resolve, 500));

        for (const color of seq) {
            await flashColor(color);
        }

        setIsShowingSequence(false);
        setMessage('당신 차례!');
    }, [flashColor]);

    const addToSequence = useCallback(() => {
        const newColor = colors[Math.floor(Math.random() * colors.length)];
        const newSequence = [...sequence, newColor];
        setSequence(newSequence);
        setPlayerSequence([]);
        showSequence(newSequence);
    }, [sequence, showSequence]);

    const startGame = useCallback(() => {
        setSequence([]);
        setPlayerSequence([]);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);

        const firstColor = colors[Math.floor(Math.random() * colors.length)];
        const newSequence = [firstColor];
        setSequence(newSequence);
        showSequence(newSequence);
    }, [showSequence]);

    const handleColorClick = useCallback(async (color: ColorType) => {
        if (!isPlaying || isShowingSequence || gameOver) return;

        await flashColor(color);

        const newPlayerSequence = [...playerSequence, color];
        setPlayerSequence(newPlayerSequence);

        const currentIndex = newPlayerSequence.length - 1;

        if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
            // 틀림
            setGameOver(true);
            setIsPlaying(false);
            setMessage(`게임 오버! 점수: ${score}`);
            if (score > highScore) {
                setHighScore(score);
            }
            return;
        }

        if (newPlayerSequence.length === sequence.length) {
            // 라운드 성공
            const newScore = score + 1;
            setScore(newScore);
            setMessage('정답! 🎉');
            setPlayerSequence([]);

            setTimeout(() => {
                addToSequence();
            }, 1000);
        }
    }, [isPlaying, isShowingSequence, gameOver, playerSequence, sequence, score, highScore, flashColor, addToSequence]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🔴 사이먼 (Simon)</h1>

            <div className="flex gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">점수</div>
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">최고 점수</div>
                    <div className="text-2xl font-bold text-amber-600">{highScore}</div>
                </div>
            </div>

            <div className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-center font-bold">
                {message}
            </div>

            {/* Simon 보드 */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-full w-64 h-64 sm:w-80 sm:h-80">
                {colors.map((color, idx) => (
                    <button
                        key={color}
                        onClick={() => handleColorClick(color)}
                        disabled={!isPlaying || isShowingSequence}
                        className={`transition-all duration-100 disabled:cursor-not-allowed
                            ${idx === 0 ? 'rounded-tl-full' : ''}
                            ${idx === 1 ? 'rounded-tr-full' : ''}
                            ${idx === 2 ? 'rounded-bl-full' : ''}
                            ${idx === 3 ? 'rounded-br-full' : ''}
                            ${activeColor === color ? colorStyles[color].active : colorStyles[color].base}`}
                    />
                ))}
            </div>

            <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold
                    hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            >
                {isPlaying ? '🔄 다시 시작' : '▶️ 시작'}
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 패턴을 기억하고 같은 순서로 클릭하세요!</p>
            </div>
        </div>
    );
};

export default SimonGame;
