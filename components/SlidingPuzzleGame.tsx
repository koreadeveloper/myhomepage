import React, { useState, useEffect, useCallback } from 'react';

const SlidingPuzzleGame: React.FC = () => {
    const [tiles, setTiles] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [difficulty, setDifficulty] = useState<3 | 4 | 5>(4);

    const gridSize = difficulty;
    const totalTiles = gridSize * gridSize;

    // 퍼즐 초기화
    const initPuzzle = useCallback(() => {
        const solved = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
        solved.push(0); // 0은 빈 칸
        setTiles(solved);
        setMoves(0);
        setTime(0);
        setIsPlaying(false);
        setIsWon(false);
    }, [totalTiles]);

    // 풀 수 있는 퍼즐인지 확인 (역전 수가 짝수여야 함)
    const isSolvable = (arr: number[]): boolean => {
        let inversions = 0;
        const filtered = arr.filter(n => n !== 0);
        for (let i = 0; i < filtered.length; i++) {
            for (let j = i + 1; j < filtered.length; j++) {
                if (filtered[i] > filtered[j]) inversions++;
            }
        }

        if (gridSize % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            const emptyRow = Math.floor(arr.indexOf(0) / gridSize);
            const rowFromBottom = gridSize - emptyRow;
            return (inversions + rowFromBottom) % 2 === 1;
        }
    };

    // 퍼즐 섞기
    const shufflePuzzle = () => {
        let shuffled: number[];
        do {
            shuffled = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
            shuffled.push(0);
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        } while (!isSolvable(shuffled) || checkWin(shuffled));

        setTiles(shuffled);
        setMoves(0);
        setTime(0);
        setIsPlaying(true);
        setIsWon(false);
    };

    // 승리 체크
    const checkWin = (arr: number[]): boolean => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== i + 1) return false;
        }
        return arr[arr.length - 1] === 0;
    };

    // 타일 이동
    const moveTile = (index: number) => {
        if (!isPlaying || isWon) return;

        const emptyIndex = tiles.indexOf(0);
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;

        // 인접한 타일인지 확인
        const isAdjacent =
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow);

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
            setTiles(newTiles);
            setMoves(m => m + 1);

            if (checkWin(newTiles)) {
                setIsWon(true);
                setIsPlaying(false);
            }
        }
    };

    // 타이머
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !isWon) {
            interval = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isWon]);

    // 초기화
    useEffect(() => {
        initPuzzle();
    }, [initPuzzle]);

    // 키보드 방향키 지원
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || isWon) return;

            const emptyIndex = tiles.indexOf(0);
            const emptyRow = Math.floor(emptyIndex / gridSize);
            const emptyCol = emptyIndex % gridSize;

            let targetIndex = -1;

            switch (e.key) {
                case 'ArrowUp':
                    // 빈 칸 아래의 타일을 위로 이동 (빈 칸이 위로 이동하는 것처럼)
                    if (emptyRow < gridSize - 1) {
                        targetIndex = (emptyRow + 1) * gridSize + emptyCol;
                    }
                    break;
                case 'ArrowDown':
                    if (emptyRow > 0) {
                        targetIndex = (emptyRow - 1) * gridSize + emptyCol;
                    }
                    break;
                case 'ArrowLeft':
                    if (emptyCol < gridSize - 1) {
                        targetIndex = emptyRow * gridSize + (emptyCol + 1);
                    }
                    break;
                case 'ArrowRight':
                    if (emptyCol > 0) {
                        targetIndex = emptyRow * gridSize + (emptyCol - 1);
                    }
                    break;
            }

            if (targetIndex >= 0) {
                e.preventDefault();
                moveTile(targetIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isWon, tiles, gridSize]);

    // 시간 포맷
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 타일 색상
    const getTileColor = (num: number) => {
        if (num === 0) return 'bg-transparent';
        const hue = (num * 360) / totalTiles;
        return `bg-gradient-to-br from-indigo-500 to-purple-600`;
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            {/* 헤더 */}
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    🔢 슬라이딩 퍼즐
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    숫자를 1부터 순서대로 정렬하세요!
                </p>
            </div>

            {/* 게임 정보 */}
            <div className="flex gap-4 sm:gap-8 text-center">
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">이동</div>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{moves}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400">시간</div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatTime(time)}</div>
                </div>
            </div>

            {/* 난이도 선택 */}
            <div className="flex gap-2">
                {([3, 4, 5] as const).map((size) => (
                    <button
                        key={size}
                        onClick={() => { setDifficulty(size); }}
                        className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${difficulty === size
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                            }`}
                    >
                        {size}x{size}
                    </button>
                ))}
            </div>

            {/* 퍼즐 보드 */}
            <div
                className="bg-slate-200 dark:bg-slate-700 rounded-2xl p-2 shadow-xl"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gap: '4px',
                    width: 'min(95vw, 500px)',
                    aspectRatio: '1',
                }}
            >
                {tiles.map((num, index) => (
                    <button
                        key={index}
                        onClick={() => moveTile(index)}
                        disabled={num === 0 || !isPlaying}
                        className={`
                            aspect-square rounded-xl font-bold text-white text-xl sm:text-2xl
                            transition-all duration-150 ease-out
                            ${num === 0
                                ? 'bg-transparent cursor-default'
                                : `${getTileColor(num)} cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95 shadow-md`
                            }
                            ${!isPlaying && num !== 0 ? 'opacity-60' : ''}
                        `}
                    >
                        {num !== 0 && num}
                    </button>
                ))}
            </div>

            {/* 승리 메시지 */}
            {isWon && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
                    <span className="text-xl font-bold">🎉 축하합니다! </span>
                    <span className="text-lg">{moves}번 이동, {formatTime(time)}</span>
                </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={shufflePuzzle}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                    {isPlaying ? '🔄 다시 섞기' : '🎮 게임 시작'}
                </button>
                {isPlaying && (
                    <button
                        onClick={initPuzzle}
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        ⏹ 초기화
                    </button>
                )}
            </div>

            {/* 게임 방법 */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                <p>💡 빈 칸 옆의 숫자를 클릭하면 이동합니다.</p>
                <p>숫자를 1부터 순서대로 정렬하면 승리!</p>
            </div>
        </div>
    );
};

export default SlidingPuzzleGame;
