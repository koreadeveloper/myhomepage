import React, { useState, useEffect, useCallback, useRef } from 'react';
import { recordBestScore } from '../lib/highScore';

// 암산 게임
const MathGame = () => {
    type Operation = '+' | '-' | '×' | '÷';

    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60);
    const [question, setQuestion] = useState({ num1: 0, num2: 0, op: '+' as Operation, answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [streak, setStreak] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');

    useEffect(() => { if (gameState === 'finished') recordBestScore('암산', score); }, [gameState]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = useCallback(() => {
        // Progressive difficulty based on level (increases every 5 correct answers)
        // Level 1: Single digit addition only
        // Level 2: Single digit add/subtract
        // Level 3: Two digit add/subtract
        // Level 4+: Includes multiplication
        // Level 6+: Includes division
        const operations: Operation[] = level <= 2 ? ['+'] : ['+', '-'];
        if (level >= 4) operations.push('×');
        if (level >= 6) operations.push('÷');

        const op = operations[Math.floor(Math.random() * operations.length)];
        let num1: number, num2: number, answer: number;

        // Difficulty scaling
        const singleDigitMax = 9;
        const twoDigitMax = level >= 3 ? 50 : singleDigitMax;
        const maxNum = level >= 5 ? 99 : twoDigitMax;

        switch (op) {
            case '+':
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '×':
                num1 = Math.floor(Math.random() * Math.min(9, maxNum / 2)) + 2;
                num2 = Math.floor(Math.random() * Math.min(9, maxNum / 2)) + 2;
                answer = num1 * num2;
                break;
            case '÷':
                num2 = Math.floor(Math.random() * 9) + 2;
                answer = Math.floor(Math.random() * 9) + 2;
                num1 = num2 * answer;
                break;
            default:
                num1 = 1; num2 = 1; answer = 2;
        }

        setQuestion({ num1, num2, op, answer });
        setUserAnswer('');
        setFeedback(null);
    }, [level]);

    const startGame = useCallback(() => {
        setScore(0);
        setLevel(1);
        setTimeLeft(60);
        setStreak(0);
        setCorrectCount(0);
        setWrongCount(0);
        setGameState('playing');
        generateQuestion();
        inputRef.current?.focus();
    }, [generateQuestion]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    useEffect(() => {
        // Level up every 5 correct answers
        if (correctCount > 0 && correctCount % 5 === 0) {
            setLevel(l => Math.min(l + 1, 10));
        }
    }, [correctCount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer || gameState !== 'playing') return;

        const isCorrect = parseInt(userAnswer) === question.answer;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        if (isCorrect) {
            const streakBonus = streak >= 5 ? 5 : streak >= 3 ? 3 : 1;
            setScore(s => s + 10 * level * streakBonus);
            setStreak(s => s + 1);
            setCorrectCount(c => c + 1);
            setTimeLeft(t => Math.min(t + 2, 60)); // Bonus time
        } else {
            setStreak(0);
            setWrongCount(w => w + 1);
        }

        setTimeout(() => {
            generateQuestion();
        }, 300);
    };

    const getGrade = () => {
        if (score >= 2000) return { grade: 'S', color: 'text-yellow-500', msg: '수학 천재!' };
        if (score >= 1500) return { grade: 'A', color: 'text-green-500', msg: '매우 우수' };
        if (score >= 1000) return { grade: 'B', color: 'text-blue-500', msg: '우수' };
        if (score >= 500) return { grade: 'C', color: 'text-orange-500', msg: '보통' };
        return { grade: 'D', color: 'text-red-500', msg: '더 연습하세요' };
    };

    if (gameState === 'ready') {
        return (
            <div className="flex flex-col items-center gap-6 p-4 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">🧮 암산 게임</h2>
                <div className="text-lg text-slate-500 dark:text-slate-400 text-center">
                    <p>60초 안에 최대한 많은 문제를 풀어보세요!</p>
                    <p className="text-base mt-2">레벨이 올라갈수록 곱셈, 나눗셈이 추가됩니다.</p>
                </div>
                <button onClick={startGame} className="px-10 py-5 bg-blue-500 text-white text-xl lg:text-2xl font-bold rounded-xl hover:bg-blue-400 active:bg-blue-400">
                    게임 시작
                </button>
            </div>
        );
    }

    if (gameState === 'finished') {
        const { grade, color, msg } = getGrade();
        const accuracy = correctCount + wrongCount > 0
            ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
            : 0;

        return (
            <div className="flex flex-col items-center gap-6 p-4 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">게임 종료!</h2>
                <div className={`text-8xl lg:text-9xl font-black ${color}`}>{grade}</div>
                <div className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300">{msg}</div>
                <div className="text-4xl lg:text-5xl font-bold text-blue-500">{score}점</div>
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-green-500">{correctCount}</div>
                        <div className="text-base text-slate-500">정답</div>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-red-500">{wrongCount}</div>
                        <div className="text-base text-slate-500">오답</div>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-bold text-slate-600 dark:text-slate-300">{accuracy}%</div>
                        <div className="text-base text-slate-500">정확도</div>
                    </div>
                </div>
                <button onClick={startGame} className="px-10 py-5 bg-blue-500 text-white text-xl font-bold rounded-xl hover:bg-blue-400 active:bg-blue-400">
                    다시 도전
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 lg:gap-6 p-4 w-full max-w-2xl mx-auto">
            <div className="flex justify-between w-full text-base lg:text-xl">
                <span className="font-bold text-slate-800 dark:text-white">레벨 {level}</span>
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                    ⏱️ {timeLeft}초
                </span>
                <span className="font-bold text-blue-500">{score}점</span>
            </div>

            {streak >= 3 && (
                <div className="text-lg lg:text-xl text-orange-500 font-bold animate-bounce">🔥 {streak}연속 정답! (x{streak >= 5 ? 5 : 3} 보너스)</div>
            )}

            <div className={`text-5xl lg:text-7xl font-black text-center py-8 lg:py-12 px-4 rounded-2xl w-full transition-colors
                ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                ${feedback === 'wrong' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-white dark:bg-slate-800'}
            `}>
                <span className="text-slate-800 dark:text-white">{question.num1}</span>
                <span className="text-blue-500 mx-2 lg:mx-4">{question.op}</span>
                <span className="text-slate-800 dark:text-white">{question.num2}</span>
                <span className="text-slate-400 mx-2 lg:mx-4">=</span>
                <span className="text-green-500">?</span>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
                <input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="정답 입력"
                    className="w-full px-6 py-5 text-2xl lg:text-3xl text-center font-bold border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                    autoComplete="off"
                    enterKeyHint="go"
                    autoFocus
                />
            </form>

            <div className="flex gap-4 text-lg lg:text-xl">
                {correctCount > 0 && <span className="text-green-500">✓ {correctCount}</span>}
                {wrongCount > 0 && <span className="text-red-500">✗ {wrongCount}</span>}
            </div>
        </div>
    );
};

export default MathGame;
