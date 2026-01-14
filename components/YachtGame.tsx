import React, { useState, useCallback } from 'react';

type Die = number; // 1-6 or 0 for not rolled

interface ScoreCategory {
    name: string;
    description: string;
    scorer: (dice: number[]) => number;
    used: boolean;
    score: number | null;
}

const YachtGame: React.FC = () => {
    const [dice, setDice] = useState<Die[]>([0, 0, 0, 0, 0]);
    const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
    const [rollsLeft, setRollsLeft] = useState(3);
    const [round, setRound] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initialCategories = useCallback((): ScoreCategory[] => [
        {
            name: 'Ones',
            description: '1의 합',
            scorer: (d) => d.filter(x => x === 1).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Twos',
            description: '2의 합',
            scorer: (d) => d.filter(x => x === 2).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Threes',
            description: '3의 합',
            scorer: (d) => d.filter(x => x === 3).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Fours',
            description: '4의 합',
            scorer: (d) => d.filter(x => x === 4).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Fives',
            description: '5의 합',
            scorer: (d) => d.filter(x => x === 5).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Sixes',
            description: '6의 합',
            scorer: (d) => d.filter(x => x === 6).reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: 'Choice',
            description: '모든 주사위 합',
            scorer: (d) => d.reduce((a, b) => a + b, 0),
            used: false,
            score: null
        },
        {
            name: '4 of a Kind',
            description: '같은 눈 4개 이상의 합',
            scorer: (d) => {
                const counts = [0, 0, 0, 0, 0, 0, 0];
                d.forEach(x => counts[x]++);
                for (let i = 1; i <= 6; i++) {
                    if (counts[i] >= 4) return d.reduce((a, b) => a + b, 0);
                }
                return 0;
            },
            used: false,
            score: null
        },
        {
            name: 'Full House',
            description: '3개 + 2개 = 25점',
            scorer: (d) => {
                const counts = [0, 0, 0, 0, 0, 0, 0];
                d.forEach(x => counts[x]++);
                const vals = counts.filter(c => c > 0);
                if (vals.length === 2 && (vals.includes(3) && vals.includes(2))) return 25;
                if (vals.length === 1 && vals[0] === 5) return 25; // 5 of a kind도 OK
                return 0;
            },
            used: false,
            score: null
        },
        {
            name: 'Small Straight',
            description: '연속 4개 = 30점',
            scorer: (d) => {
                const unique = [...new Set(d)].sort((a, b) => a - b).join('');
                if (unique.includes('1234') || unique.includes('2345') || unique.includes('3456')) return 30;
                return 0;
            },
            used: false,
            score: null
        },
        {
            name: 'Large Straight',
            description: '연속 5개 = 40점',
            scorer: (d) => {
                const sorted = [...d].sort((a, b) => a - b).join('');
                if (sorted === '12345' || sorted === '23456') return 40;
                return 0;
            },
            used: false,
            score: null
        },
        {
            name: 'Yacht!',
            description: '같은 눈 5개 = 50점',
            scorer: (d) => {
                if (new Set(d).size === 1 && d[0] !== 0) return 50;
                return 0;
            },
            used: false,
            score: null
        },
    ], []);

    const [categories, setCategories] = useState<ScoreCategory[]>(initialCategories);

    const rollDice = () => {
        if (rollsLeft <= 0) return;

        const newDice = dice.map((die, idx) =>
            held[idx] ? die : Math.floor(Math.random() * 6) + 1
        );
        setDice(newDice);
        setRollsLeft(rollsLeft - 1);
    };

    const toggleHold = (idx: number) => {
        if (dice[idx] === 0) return;
        const newHeld = [...held];
        newHeld[idx] = !newHeld[idx];
        setHeld(newHeld);
    };

    const selectCategory = (idx: number) => {
        if (categories[idx].used || dice[0] === 0) return;

        const score = categories[idx].scorer(dice);
        const newCategories = [...categories];
        newCategories[idx] = { ...newCategories[idx], used: true, score };
        setCategories(newCategories);
        setTotalScore(totalScore + score);

        if (round >= 12) {
            setGameOver(true);
        } else {
            setRound(round + 1);
            setDice([0, 0, 0, 0, 0]);
            setHeld([false, false, false, false, false]);
            setRollsLeft(3);
        }
    };

    const resetGame = () => {
        setDice([0, 0, 0, 0, 0]);
        setHeld([false, false, false, false, false]);
        setRollsLeft(3);
        setRound(1);
        setTotalScore(0);
        setGameOver(false);
        setCategories(initialCategories());
    };

    const dieEmojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🎲 요트 (Yacht)</h1>

            <div className="flex gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">라운드</div>
                    <div className="text-xl font-bold">{round}/12</div>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">점수</div>
                    <div className="text-xl font-bold text-amber-600">{totalScore}</div>
                </div>
            </div>

            {gameOver && (
                <div className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold">
                    🎉 게임 종료! 최종 점수: {totalScore}점
                </div>
            )}

            {/* 주사위 */}
            <div className="flex gap-2">
                {dice.map((die, idx) => (
                    <div
                        key={idx}
                        onClick={() => toggleHold(idx)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl
                            bg-white rounded-xl shadow-lg cursor-pointer transition-all
                            ${held[idx] ? 'ring-4 ring-green-500 bg-green-50' : 'hover:bg-slate-50'}
                            ${die === 0 ? 'text-slate-300' : ''}`}
                    >
                        {die === 0 ? '?' : dieEmojis[die]}
                    </div>
                ))}
            </div>

            <button
                onClick={rollDice}
                disabled={rollsLeft <= 0 || gameOver}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold
                    hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                🎲 굴리기 ({rollsLeft}회 남음)
            </button>

            {/* 점수판 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-lg w-full max-w-md overflow-y-auto max-h-60">
                <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectCategory(idx)}
                            disabled={cat.used || dice[0] === 0 || gameOver}
                            className={`p-2 rounded text-left text-sm transition-all
                                ${cat.used
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                    : 'bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800'}
                                disabled:cursor-not-allowed`}
                        >
                            <div className="font-bold text-xs">{cat.name}</div>
                            <div className="text-amber-600 font-bold">
                                {cat.used ? cat.score : (dice[0] !== 0 ? cat.scorer(dice) : '-')}점
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={resetGame} className="px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700">
                🔄 새 게임
            </button>
        </div>
    );
};

export default YachtGame;
