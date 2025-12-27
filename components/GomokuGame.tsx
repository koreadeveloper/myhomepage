import React, { useState, useCallback } from 'react';

// 오목 (Five in a Row / Gomoku)
const GomokuGame = () => {
    const BOARD_SIZE = 15;
    const [board, setBoard] = useState<(null | 'black' | 'white')[][]>(
        Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
    );
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<null | 'black' | 'white' | 'draw'>(null);
    const [thinking, setThinking] = useState(false);

    const checkWinner = useCallback((b: (null | 'black' | 'white')[][], row: number, col: number, player: 'black' | 'white') => {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (const [dr, dc] of directions) {
            let count = 1;
            for (let i = 1; i < 5; i++) {
                const nr = row + dr * i, nc = col + dc * i;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) count++;
                else break;
            }
            for (let i = 1; i < 5; i++) {
                const nr = row - dr * i, nc = col - dc * i;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === player) count++;
                else break;
            }
            if (count >= 5) return player;
        }
        return null;
    }, []);

    const getAiMove = useCallback((b: (null | 'black' | 'white')[][]) => {
        const scores: { row: number; col: number; score: number }[] = [];

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (b[r][c] !== null) continue;

                let score = 0;
                const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

                for (const [dr, dc] of directions) {
                    // Check AI's potential
                    let aiCount = 0, aiOpen = 0;
                    for (let i = 1; i <= 4; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                        if (b[nr][nc] === 'white') aiCount++;
                        else if (b[nr][nc] === null) { aiOpen++; break; }
                        else break;
                    }
                    for (let i = 1; i <= 4; i++) {
                        const nr = r - dr * i, nc = c - dc * i;
                        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                        if (b[nr][nc] === 'white') aiCount++;
                        else if (b[nr][nc] === null) { aiOpen++; break; }
                        else break;
                    }

                    // Check player's threat
                    let playerCount = 0, playerOpen = 0;
                    for (let i = 1; i <= 4; i++) {
                        const nr = r + dr * i, nc = c + dc * i;
                        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                        if (b[nr][nc] === 'black') playerCount++;
                        else if (b[nr][nc] === null) { playerOpen++; break; }
                        else break;
                    }
                    for (let i = 1; i <= 4; i++) {
                        const nr = r - dr * i, nc = c - dc * i;
                        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                        if (b[nr][nc] === 'black') playerCount++;
                        else if (b[nr][nc] === null) { playerOpen++; break; }
                        else break;
                    }

                    if (aiCount >= 4) score += 100000;
                    else if (aiCount === 3 && aiOpen >= 1) score += 5000;
                    else if (aiCount === 2 && aiOpen >= 2) score += 500;

                    if (playerCount >= 4) score += 50000;
                    else if (playerCount === 3 && playerOpen >= 1) score += 4000;
                    else if (playerCount === 2 && playerOpen >= 2) score += 400;
                }

                // Prefer center
                score += (7 - Math.abs(r - 7)) + (7 - Math.abs(c - 7));
                scores.push({ row: r, col: c, score });
            }
        }

        scores.sort((a, b) => b.score - a.score);
        return scores[0] || null;
    }, []);

    const handleClick = useCallback((row: number, col: number) => {
        if (board[row][col] || winner || !isPlayerTurn || thinking) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 'black';
        setBoard(newBoard);

        const playerWin = checkWinner(newBoard, row, col, 'black');
        if (playerWin) {
            setWinner('black');
            return;
        }

        setIsPlayerTurn(false);
        setThinking(true);

        setTimeout(() => {
            const aiMove = getAiMove(newBoard);
            if (aiMove) {
                newBoard[aiMove.row][aiMove.col] = 'white';
                setBoard([...newBoard.map(r => [...r])]);

                const aiWin = checkWinner(newBoard, aiMove.row, aiMove.col, 'white');
                if (aiWin) {
                    setWinner('white');
                }
            }
            setThinking(false);
            setIsPlayerTurn(true);
        }, 300);
    }, [board, winner, isPlayerTurn, thinking, checkWinner, getAiMove]);

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
        setIsPlayerTurn(true);
        setWinner(null);
        setThinking(false);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-lg font-bold text-slate-800 dark:text-white">
                {winner ? (winner === 'black' ? '🎉 승리!' : '😢 패배') : (thinking ? '🤔 AI 생각중...' : '⚫ 당신의 차례')}
            </div>
            <div
                className="grid gap-0 bg-amber-200 p-2 rounded-lg shadow-lg"
                style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
            >
                {board.map((row, r) => row.map((cell, c) => (
                    <div
                        key={`${r}-${c}`}
                        onClick={() => handleClick(r, c)}
                        className="w-6 h-6 lg:w-8 lg:h-8 border border-amber-400 flex items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors"
                    >
                        {cell === 'black' && <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-slate-900 shadow-md" />}
                        {cell === 'white' && <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white border-2 border-slate-300 shadow-md" />}
                    </div>
                )))}
            </div>
            {winner && (
                <button onClick={resetGame} className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-400">
                    다시 시작
                </button>
            )}
        </div>
    );
};

export default GomokuGame;
