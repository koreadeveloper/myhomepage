import React, { useState, useEffect, useCallback, useRef } from 'react';
import { recordBestScore } from '../lib/highScore';

// 타자 연습 (한국어 버전)
const TypingGame = () => {
    const koreanWords = [
        '안녕', '사랑', '행복', '컴퓨터', '프로그램', '개발자', '인터넷', '스마트폰',
        '대한민국', '서울', '부산', '인천', '대구', '광주', '경기도', '제주도',
        '학교', '회사', '가족', '친구', '음식', '여행', '운동', '공부',
        '커피', '라면', '치킨', '피자', '햄버거', '김치', '불고기', '비빔밥',
        '영화', '음악', '게임', '독서', '드라마', '예술', '문화', '역사',
        '수학', '과학', '영어', '국어', '사회', '체육', '미술', '음악',
        '봄', '여름', '가을', '겨울', '날씨', '하늘', '바다', '산',
        '자동차', '비행기', '기차', '버스', '지하철', '자전거', '오토바이', '배',
        '사과', '바나나', '포도', '딸기', '수박', '참외', '복숭아', '귤',
        '강아지', '고양이', '토끼', '햄스터', '앵무새', '물고기', '거북이', '뱀',
        '의사', '간호사', '선생님', '경찰관', '소방관', '요리사', '가수', '배우',
        '축구', '야구', '농구', '배구', '테니스', '골프', '수영', '스키',
    ];

    const [words, setWords] = useState<{ word: string; x: number; y: number; id: number }[]>([]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => { if (gameOver) recordBestScore('타자연습', score); }, [gameOver]);
    const [started, setStarted] = useState(false);
    const [level, setLevel] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);
    const wordIdRef = useRef(0);

    const spawnWord = useCallback(() => {
        const word = koreanWords[Math.floor(Math.random() * koreanWords.length)];
        const newWord = {
            word,
            x: Math.random() * 80 + 10, // 10-90%
            y: 0,
            id: wordIdRef.current++,
        };
        setWords(prev => [...prev, newWord]);
    }, []);

    const startGame = useCallback(() => {
        setWords([]);
        setInput('');
        setScore(0);
        setLives(5);
        setLevel(1);
        setGameOver(false);
        setStarted(true);
        wordIdRef.current = 0;
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!started || gameOver) return;

        const spawnInterval = setInterval(() => {
            spawnWord();
        }, Math.max(1500 - level * 100, 500));

        return () => clearInterval(spawnInterval);
    }, [started, gameOver, level, spawnWord]);

    useEffect(() => {
        if (!started || gameOver) return;

        const fallInterval = setInterval(() => {
            setWords(prev => {
                const updated = prev.map(w => ({ ...w, y: w.y + 1 + level * 0.3 }));
                const fallen = updated.filter(w => w.y >= 100);

                if (fallen.length > 0) {
                    setLives(l => {
                        const newLives = l - fallen.length;
                        if (newLives <= 0) setGameOver(true);
                        return Math.max(0, newLives);
                    });
                }

                return updated.filter(w => w.y < 100);
            });
        }, 50);

        return () => clearInterval(fallInterval);
    }, [started, gameOver, level]);

    useEffect(() => {
        if (score > 0 && score % 50 === 0) {
            setLevel(l => Math.min(l + 1, 10));
        }
    }, [score]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const matchIndex = words.findIndex(w => w.word === trimmed);
        if (matchIndex !== -1) {
            setWords(prev => prev.filter((_, i) => i !== matchIndex));
            setScore(s => s + words[matchIndex].word.length * 10);
        }
        setInput('');
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto px-2">
            <div className="flex justify-between w-full px-2 lg:px-4 text-base lg:text-xl">
                <div className="font-bold text-slate-800 dark:text-white">
                    점수: <span className="text-green-500">{score}</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-white">
                    레벨: <span className="text-blue-500">{level}</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-white">
                    생명: <span className="text-red-500">{'❤️'.repeat(lives)}{'🖤'.repeat(5 - lives)}</span>
                </div>
            </div>

            <div className="relative w-full h-[50vh] min-h-[300px] max-h-[500px] bg-gradient-to-b from-sky-100 to-sky-300 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                {words.map(word => (
                    <div
                        key={word.id}
                        className="absolute text-lg lg:text-2xl font-bold text-slate-800 dark:text-white bg-white/90 dark:bg-slate-700/90 px-3 py-1 rounded-lg shadow-md transition-all"
                        style={{ left: `${word.x}%`, top: `${word.y}%`, transform: 'translateX(-50%)' }}
                    >
                        {word.word}
                    </div>
                ))}

                {!started && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <button onClick={startGame} className="px-8 py-4 bg-green-500 text-white text-xl lg:text-2xl font-bold rounded-xl hover:bg-green-400 active:bg-green-400">
                            게임 시작
                        </button>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                        <div className="text-3xl lg:text-4xl font-bold text-red-500 mb-2">게임 오버!</div>
                        <div className="text-xl lg:text-2xl text-white mb-4">최종 점수: {score}</div>
                        <button onClick={startGame} className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-xl hover:bg-green-400 active:bg-green-400">
                            다시 시작
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!started || gameOver}
                    placeholder="단어를 입력하세요..."
                    className="w-full px-4 lg:px-6 py-4 text-lg lg:text-xl text-center border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-green-500 focus:outline-none"
                    autoComplete="off"
                    enterKeyHint="go"
                />
            </form>
        </div>
    );
};

export default TypingGame;
