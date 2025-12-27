import React, { useState, useCallback } from 'react';

// Hangman Game
const HangmanGame = () => {
    const words = [
        { word: 'JAVASCRIPT', hint: '웹 프로그래밍 언어' },
        { word: 'PYTHON', hint: '뱀 이름의 프로그래밍 언어' },
        { word: 'COMPUTER', hint: '정보 처리 장치' },
        { word: 'KEYBOARD', hint: '타자를 치는 입력기기' },
        { word: 'INTERNET', hint: '전 세계 네트워크' },
        { word: 'ALGORITHM', hint: '문제 해결 절차' },
        { word: 'DATABASE', hint: '데이터 저장소' },
        { word: 'PROGRAMMING', hint: '코드 작성 활동' },
        { word: 'SOFTWARE', hint: '컴퓨터 프로그램' },
        { word: 'DEVELOPER', hint: '소프트웨어 개발자' },
        { word: 'WEBSITE', hint: '인터넷 페이지' },
        { word: 'ANDROID', hint: '모바일 운영체제' },
        { word: 'MACHINE', hint: '기계' },
        { word: 'LEARNING', hint: '배우기, 학습' },
        { word: 'NETWORK', hint: '연결망' },
    ];

    const [currentWord, setCurrentWord] = useState(() => words[Math.floor(Math.random() * words.length)]);
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const maxWrongGuesses = 6;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const resetGame = useCallback(() => {
        setCurrentWord(words[Math.floor(Math.random() * words.length)]);
        setGuessedLetters(new Set());
        setWrongGuesses(0);
        setGameOver(false);
        setWon(false);
    }, []);

    const guessLetter = useCallback((letter: string) => {
        if (gameOver || won || guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (!currentWord.word.includes(letter)) {
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= maxWrongGuesses) {
                setGameOver(true);
            }
        } else {
            // Check win
            const allGuessed = currentWord.word.split('').every(l => newGuessed.has(l));
            if (allGuessed) {
                setWon(true);
            }
        }
    }, [currentWord, guessedLetters, wrongGuesses, gameOver, won]);

    const displayWord = currentWord.word.split('').map(letter =>
        guessedLetters.has(letter) ? letter : '_'
    ).join(' ');

    const wrongLetters = Array.from(guessedLetters).filter(l => !currentWord.word.includes(l));

    // Hangman SVG
    const HangmanDrawing = () => (
        <svg viewBox="0 0 200 250" className="w-48 h-60">
            {/* Gallows */}
            <line x1="20" y1="230" x2="100" y2="230" stroke="#475569" strokeWidth="4" />
            <line x1="60" y1="230" x2="60" y2="20" stroke="#475569" strokeWidth="4" />
            <line x1="60" y1="20" x2="140" y2="20" stroke="#475569" strokeWidth="4" />
            <line x1="140" y1="20" x2="140" y2="50" stroke="#475569" strokeWidth="4" />

            {/* Head */}
            {wrongGuesses >= 1 && (
                <circle cx="140" cy="70" r="20" stroke="#ef4444" strokeWidth="3" fill="none" />
            )}
            {/* Body */}
            {wrongGuesses >= 2 && (
                <line x1="140" y1="90" x2="140" y2="150" stroke="#ef4444" strokeWidth="3" />
            )}
            {/* Left Arm */}
            {wrongGuesses >= 3 && (
                <line x1="140" y1="110" x2="110" y2="130" stroke="#ef4444" strokeWidth="3" />
            )}
            {/* Right Arm */}
            {wrongGuesses >= 4 && (
                <line x1="140" y1="110" x2="170" y2="130" stroke="#ef4444" strokeWidth="3" />
            )}
            {/* Left Leg */}
            {wrongGuesses >= 5 && (
                <line x1="140" y1="150" x2="110" y2="190" stroke="#ef4444" strokeWidth="3" />
            )}
            {/* Right Leg */}
            {wrongGuesses >= 6 && (
                <line x1="140" y1="150" x2="170" y2="190" stroke="#ef4444" strokeWidth="3" />
            )}

            {/* Face when dead */}
            {wrongGuesses >= 6 && (
                <>
                    <line x1="132" y1="65" x2="138" y2="71" stroke="#ef4444" strokeWidth="2" />
                    <line x1="138" y1="65" x2="132" y2="71" stroke="#ef4444" strokeWidth="2" />
                    <line x1="142" y1="65" x2="148" y2="71" stroke="#ef4444" strokeWidth="2" />
                    <line x1="148" y1="65" x2="142" y2="71" stroke="#ef4444" strokeWidth="2" />
                    <path d="M 130 80 Q 140 75 150 80" stroke="#ef4444" strokeWidth="2" fill="none" />
                </>
            )}
        </svg>
    );

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            <div className="flex items-center gap-6">
                <HangmanDrawing />
                <div className="text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">힌트: {currentWord.hint}</div>
                    <div className="text-3xl lg:text-4xl font-mono font-bold tracking-wider text-slate-800 dark:text-white mb-4">
                        {displayWord}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        남은 기회: {maxWrongGuesses - wrongGuesses}
                    </div>
                    {wrongLetters.length > 0 && (
                        <div className="mt-2 text-sm text-red-500">
                            틀린 글자: {wrongLetters.join(', ')}
                        </div>
                    )}
                </div>
            </div>

            {!gameOver && !won && (
                <div className="grid grid-cols-9 gap-1 lg:gap-2 max-w-lg">
                    {alphabet.map(letter => (
                        <button
                            key={letter}
                            onClick={() => guessLetter(letter)}
                            disabled={guessedLetters.has(letter)}
                            className={`w-8 h-10 lg:w-10 lg:h-12 rounded-lg font-bold text-sm lg:text-base transition-all
                                ${guessedLetters.has(letter)
                                    ? currentWord.word.includes(letter)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white opacity-50'
                                    : 'bg-teal-500 text-white hover:bg-teal-400 hover:scale-105'
                                }`}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            )}

            {(gameOver || won) && (
                <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${won ? 'text-green-500' : 'text-red-500'}`}>
                        {won ? '🎉 정답입니다!' : `💀 게임 오버! 정답: ${currentWord.word}`}
                    </div>
                    <button
                        onClick={resetGame}
                        className="px-6 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-400"
                    >
                        다시 시작
                    </button>
                </div>
            )}
        </div>
    );
};

export default HangmanGame;
