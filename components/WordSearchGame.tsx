import React, { useState, useCallback, useEffect } from 'react';

const WordSearchGame: React.FC = () => {
    const GRID_SIZE = 10;

    const wordList = [
        '사과', '바나나', '딸기', '포도', '오렌지',
        '컴퓨터', '프로그램', '개발자', '코딩', '알고리즘',
        '게임', '여행', '음악', '영화', '독서',
    ];

    const [grid, setGrid] = useState<string[][]>([]);
    const [words, setWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
    const [selecting, setSelecting] = useState(false);
    const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
    const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState('');

    const placeWord = useCallback((grid: string[][], word: string): boolean => {
        const directions = [
            [0, 1],   // 가로
            [1, 0],   // 세로
            [1, 1],   // 대각선 \
            [1, -1],  // 대각선 /
        ];

        const attempts = 50;
        for (let i = 0; i < attempts; i++) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const chars = word.split('');
            const len = chars.length;

            let startRow = Math.floor(Math.random() * GRID_SIZE);
            let startCol = Math.floor(Math.random() * GRID_SIZE);

            // 범위 체크
            const endRow = startRow + dir[0] * (len - 1);
            const endCol = startCol + dir[1] * (len - 1);
            if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;

            // 충돌 체크
            let canPlace = true;
            for (let j = 0; j < len; j++) {
                const r = startRow + dir[0] * j;
                const c = startCol + dir[1] * j;
                if (grid[r][c] !== '' && grid[r][c] !== chars[j]) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                for (let j = 0; j < len; j++) {
                    const r = startRow + dir[0] * j;
                    const c = startCol + dir[1] * j;
                    grid[r][c] = chars[j];
                }
                return true;
            }
        }
        return false;
    }, []);

    const generateGrid = useCallback(() => {
        const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));

        // 랜덤 단어 선택
        const shuffled = [...wordList].sort(() => Math.random() - 0.5);
        const selectedWords: string[] = [];

        for (const word of shuffled) {
            if (selectedWords.length >= 5) break;
            if (word.length <= GRID_SIZE && placeWord(newGrid, word)) {
                selectedWords.push(word);
            }
        }

        // 빈 칸 채우기
        const koreanChars = '가나다라마바사아자차카타파하';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = koreanChars[Math.floor(Math.random() * koreanChars.length)];
                }
            }
        }

        setGrid(newGrid);
        setWords(selectedWords);
        setFoundWords(new Set());
        setFoundCells(new Set());
        setMessage(`${selectedWords.length}개의 단어를 찾으세요!`);
    }, [placeWord]);

    useEffect(() => {
        generateGrid();
    }, [generateGrid]);

    const handleCellMouseDown = (row: number, col: number) => {
        setSelecting(true);
        setSelectedCells([[row, col]]);
    };

    const handleCellMouseEnter = (row: number, col: number) => {
        if (!selecting) return;

        // 직선만 허용
        if (selectedCells.length === 0) return;

        const [startRow, startCol] = selectedCells[0];
        const dr = Math.sign(row - startRow);
        const dc = Math.sign(col - startCol);

        // 8방향 중 하나만 허용
        if (dr === 0 && dc === 0) return;

        const newCells: [number, number][] = [];
        let r = startRow;
        let c = startCol;

        while (r !== row + dr || c !== col + dc) {
            if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) break;
            newCells.push([r, c]);
            if (r === row && c === col) break;
            r += dr;
            c += dc;
        }

        setSelectedCells(newCells);
    };

    const handleMouseUp = () => {
        if (!selecting) return;
        setSelecting(false);

        // 선택한 글자로 단어 만들기
        const selectedWord = selectedCells.map(([r, c]) => grid[r][c]).join('');
        const reversedWord = selectedWord.split('').reverse().join('');

        if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
            setFoundWords(new Set([...foundWords, selectedWord]));
            const newFoundCells = new Set(foundCells);
            selectedCells.forEach(([r, c]) => newFoundCells.add(`${r},${c}`));
            setFoundCells(newFoundCells);
            setMessage(`"${selectedWord}" 발견! 🎉`);
        } else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) {
            setFoundWords(new Set([...foundWords, reversedWord]));
            const newFoundCells = new Set(foundCells);
            selectedCells.forEach(([r, c]) => newFoundCells.add(`${r},${c}`));
            setFoundCells(newFoundCells);
            setMessage(`"${reversedWord}" 발견! 🎉`);
        }

        setSelectedCells([]);
    };

    const isSelected = (row: number, col: number) =>
        selectedCells.some(([r, c]) => r === row && c === col);

    const isFound = (row: number, col: number) =>
        foundCells.has(`${row},${col}`);

    const allFound = foundWords.size === words.length && words.length > 0;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🔍 단어 찾기</h1>

            <div className="flex gap-4">
                <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-xl">
                    찾은 단어: {foundWords.size}/{words.length}
                </div>
            </div>

            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm">
                {message}
            </div>

            {allFound && (
                <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold animate-bounce">
                    🎉 모든 단어를 찾았습니다!
                </div>
            )}

            {/* 그리드 */}
            <div
                className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg select-none"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={(e) => {
                    // 터치 드래그로 셀 선택
                    const t = e.touches[0];
                    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
                    if (el?.dataset?.wsr !== undefined && el?.dataset?.wsc !== undefined) {
                        handleCellMouseEnter(parseInt(el.dataset.wsr), parseInt(el.dataset.wsc));
                    }
                }}
                onTouchEnd={handleMouseUp}
                style={{ touchAction: 'none' }}
            >
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {grid.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                data-wsr={rowIdx}
                                data-wsc={colIdx}
                                onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                                onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                                onTouchStart={() => handleCellMouseDown(rowIdx, colIdx)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg
                                    cursor-pointer transition-all select-none rounded
                                    ${isFound(rowIdx, colIdx)
                                        ? 'bg-green-500 text-white'
                                        : isSelected(rowIdx, colIdx)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'}`}
                            >
                                {cell}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 단어 목록 */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {words.map((word, idx) => (
                    <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm font-bold transition-all
                            ${foundWords.has(word)
                                ? 'bg-green-500 text-white line-through'
                                : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        {word}
                    </span>
                ))}
            </div>

            <button onClick={generateGrid} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                🔄 새 게임
            </button>
        </div>
    );
};

export default WordSearchGame;
