import React, { useState, useCallback } from 'react';

type Cell = 'red' | 'yellow' | null;

const ConnectFourGame: React.FC = () => {
    const ROWS = 6;
    const COLS = 7;

    const [board, setBoard] = useState<Cell[][]>(() =>
        Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    );
    const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
    const [winner, setWinner] = useState<'red' | 'yellow' | 'draw' | null>(null);
    const [winningCells, setWinningCells] = useState<[number, number][]>([]);

    const checkWin = useCallback((board: Cell[][], row: number, col: number, player: Cell): [number, number][] | null => {
        const directions = [
            [0, 1],   // 가로
            [1, 0],   // 세로
            [1, 1],   // 대각선 \
            [1, -1],  // 대각선 /
        ];

        for (const [dr, dc] of directions) {
            const cells: [number, number][] = [[row, col]];

            // 양방향으로 체크
            for (const dir of [1, -1]) {
                let r = row + dr * dir;
                let c = col + dc * dir;
                while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    cells.push([r, c]);
                    r += dr * dir;
                    c += dc * dir;
                }
            }

            if (cells.length >= 4) return cells;
        }
        return null;
    }, []);

    const dropPiece = useCallback((col: number, player: 'red' | 'yellow', currentBoard: Cell[][]) => {
        const newBoard = currentBoard.map(r => [...r]);

        // 가장 아래 빈 칸 찾기
        let targetRow = -1;
        for (let row = ROWS - 1; row >= 0; row--) {
            if (newBoard[row][col] === null) {
                targetRow = row;
                break;
            }
        }

        if (targetRow === -1) return null;

        newBoard[targetRow][col] = player;
        return { board: newBoard, row: targetRow };
    }, []);

    const handleClick = (col: number) => {
        if (winner || currentPlayer === 'yellow') return;

        const result = dropPiece(col, 'red', board);
        if (!result) return;

        setBoard(result.board);

        const winCells = checkWin(result.board, result.row, col, 'red');
        if (winCells) {
            setWinner('red');
            setWinningCells(winCells);
            return;
        }

        // 무승부 체크
        if (result.board[0].every(cell => cell !== null)) {
            setWinner('draw');
            return;
        }

        setCurrentPlayer('yellow');
        setTimeout(() => aiMove(result.board), 500);
    };

    const aiMove = (currentBoard: Cell[][]) => {
        // AI: 승리 수 > 차단 > 중앙 우선 > 랜덤
        const availableCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
            if (currentBoard[0][c] === null) availableCols.push(c);
        }

        if (availableCols.length === 0) return;

        // 승리 수 체크
        for (const col of availableCols) {
            const result = dropPiece(col, 'yellow', currentBoard);
            if (result && checkWin(result.board, result.row, col, 'yellow')) {
                setBoard(result.board);
                setWinner('yellow');
                setWinningCells(checkWin(result.board, result.row, col, 'yellow')!);
                return;
            }
        }

        // 차단 수 체크
        for (const col of availableCols) {
            const result = dropPiece(col, 'red', currentBoard);
            if (result && checkWin(result.board, result.row, col, 'red')) {
                const aiResult = dropPiece(col, 'yellow', currentBoard);
                if (aiResult) {
                    setBoard(aiResult.board);
                    setCurrentPlayer('red');
                    return;
                }
            }
        }

        // 중앙 우선
        const centerCols = [3, 2, 4, 1, 5, 0, 6].filter(c => availableCols.includes(c));
        const chosenCol = centerCols[0];

        const result = dropPiece(chosenCol, 'yellow', currentBoard);
        if (result) {
            setBoard(result.board);

            if (result.board[0].every(cell => cell !== null)) {
                setWinner('draw');
                return;
            }

            setCurrentPlayer('red');
        }
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setCurrentPlayer('red');
        setWinner(null);
        setWinningCells([]);
    };

    const isWinning = (r: number, c: number) => winningCells.some(([wr, wc]) => wr === r && wc === c);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🔴 커넥트 4</h1>

            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${currentPlayer === 'red' && !winner ? 'ring-2 ring-green-400' : ''} bg-red-100`}>
                    🔴 플레이어
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${currentPlayer === 'yellow' && !winner ? 'ring-2 ring-green-400' : ''} bg-yellow-100`}>
                    🟡 AI
                </div>
            </div>

            {winner && (
                <div className={`px-6 py-3 rounded-xl font-bold text-white ${winner === 'red' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    winner === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                        'bg-gradient-to-r from-gray-500 to-slate-500'
                    }`}>
                    {winner === 'red' ? '🎉 승리!' : winner === 'yellow' ? '😢 AI 승리!' : '🤝 무승부!'}
                </div>
            )}

            <div className="bg-blue-600 p-3 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-7 gap-1">
                    {board.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => handleClick(colIdx)}
                                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center cursor-pointer
                                    bg-blue-800 hover:bg-blue-700 transition-all
                                    ${isWinning(rowIdx, colIdx) ? 'animate-pulse ring-4 ring-green-400' : ''}`}
                            >
                                {cell && (
                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg
                                        ${cell === 'red'
                                            ? 'bg-gradient-to-br from-red-400 to-red-600'
                                            : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button onClick={resetGame} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                🔄 새 게임
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 상단을 클릭하여 말을 떨어뜨리세요. 4개를 연속으로 만들면 승리!</p>
            </div>
        </div>
    );
};

export default ConnectFourGame;
