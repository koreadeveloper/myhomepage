import React, { useState, useCallback, useRef, useEffect } from 'react';
import { recordBestScore } from '../lib/highScore';

// 반응속도 테스트
const ReactionTest = () => {
    const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result' | 'early'>('waiting');

    useEffect(() => { if (state === 'result') recordBestScore('반응속도', reactionTime, { lowerIsBetter: true }); }, [state]);
    const [reactionTime, setReactionTime] = useState(0);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [attempts, setAttempts] = useState<number[]>([]);
    const startTimeRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTest = useCallback(() => {
        setState('ready');
        const delay = Math.random() * 3000 + 2000; // 2-5초 랜덤 대기
        timerRef.current = setTimeout(() => {
            setState('go');
            startTimeRef.current = Date.now();
        }, delay);
    }, []);

    const handleClick = useCallback(() => {
        if (state === 'waiting' || state === 'result' || state === 'early') {
            startTest();
        } else if (state === 'ready') {
            // 너무 일찍 클릭
            if (timerRef.current) clearTimeout(timerRef.current);
            setState('early');
        } else if (state === 'go') {
            const time = Date.now() - startTimeRef.current;
            setReactionTime(time);
            setAttempts(prev => [...prev, time]);
            setBestTime(prev => prev === null ? time : Math.min(prev, time));
            setState('result');
        }
    }, [state, startTest]);

    const avgTime = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : 0;

    const getTimeColor = (time: number) => {
        if (time < 200) return 'text-green-500';
        if (time < 300) return 'text-yellow-500';
        if (time < 400) return 'text-orange-500';
        return 'text-red-500';
    };

    const getTimeMessage = (time: number) => {
        if (time < 150) return '🚀 초인적 반응속도!';
        if (time < 200) return '⚡ 매우 빠름!';
        if (time < 250) return '🎯 빠른 편!';
        if (time < 300) return '👍 평균 수준';
        if (time < 400) return '🐢 조금 느림';
        return '😴 많이 느림';
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4 w-full max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">반응속도 테스트</h2>
                <p className="text-slate-500 dark:text-slate-400">초록색으로 바뀌면 최대한 빨리 클릭!</p>
            </div>

            <div
                onClick={handleClick}
                onTouchEnd={(e) => { e.preventDefault(); handleClick(); }}
                className={`w-full max-w-md aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-200 text-white text-xl lg:text-2xl font-bold text-center p-6 select-none touch-manipulation
                    ${state === 'waiting' ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-400' : ''}
                    ${state === 'ready' ? 'bg-red-500' : ''}
                    ${state === 'go' ? 'bg-green-500' : ''}
                    ${state === 'result' ? 'bg-blue-500' : ''}
                    ${state === 'early' ? 'bg-orange-500' : ''}
                `}
            >
                {state === 'waiting' && <div className="text-2xl lg:text-3xl">클릭하여 시작</div>}
                {state === 'ready' && <div className="text-2xl lg:text-3xl">기다리세요...</div>}
                {state === 'go' && <div className="text-5xl lg:text-6xl">클릭!</div>}
                {state === 'early' && (
                    <div>
                        <div className="text-3xl lg:text-4xl mb-2">너무 빨랐어요!</div>
                        <div className="text-lg lg:text-xl">터치하여 다시 시도</div>
                    </div>
                )}
                {state === 'result' && (
                    <div>
                        <div className={`text-6xl lg:text-7xl font-black mb-2 ${getTimeColor(reactionTime)}`}>
                            {reactionTime}ms
                        </div>
                        <div className="text-xl lg:text-2xl mb-4">{getTimeMessage(reactionTime)}</div>
                        <div className="text-base lg:text-lg">터치하여 다시 시도</div>
                    </div>
                )}
            </div>

            {attempts.length > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-sm lg:text-base text-slate-500 dark:text-slate-400">최고 기록</div>
                            <div className={`text-3xl lg:text-4xl font-bold ${getTimeColor(bestTime || 0)}`}>{bestTime}ms</div>
                        </div>
                        <div>
                            <div className="text-sm lg:text-base text-slate-500 dark:text-slate-400">평균</div>
                            <div className={`text-3xl lg:text-4xl font-bold ${getTimeColor(avgTime)}`}>{avgTime}ms</div>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-base text-slate-500 dark:text-slate-400">
                        시도 횟수: {attempts.length}회
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReactionTest;
