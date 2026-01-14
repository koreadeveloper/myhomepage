import React, { useState, useCallback } from 'react';

type PieceType = 'red' | 'black' | 'red-king' | 'black-king' | null;

interface Position {
    row: number;
    col: number;
}

const CheckersGame: React.FC = () => {
    const initialBoard = (): PieceType[][] => {
        const board: PieceType[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        // 흑색 말 (위쪽)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) board[row][col] = 'black';
            }
        }
        // 빨간색 말 (아래쪽)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) board[row][col] = 'red';
            }
        }
        return board;
    };

    const [board, setBoard] = useState<PieceType[][]>(initialBoard);
    const [selected, setSelected] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [turn, setTurn] = useState<'red' | 'black'>('red');
    const [mustJump, setMustJump] = useState<Position | null>(null);
    const [redCount, setRedCount] = useState(12);
    const [blackCount, setBlackCount] = useState(12);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<'red' | 'black' | null>(null);

    const isPlayerPiece = (piece: PieceType): boolean => {
        if (!piece) return false;
        return piece.startsWith(turn);
    };

    const isKing = (piece: PieceType): boolean => {
        return piece?.includes('king') || false;
    };

    const getValidMoves = useCallback((row: number, col: number, boardState: PieceType[][]): { moves: Position[], jumps: Position[] } => {
        const piece = boardState[row][col];
        if (!piece) return { moves: [], jumps: [] };

        const moves: Position[] = [];
        const jumps: Position[] = [];
        const isRed = piece.startsWith('red');
        const directions = isKing(piece)
            ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
            : isRed
                ? [[-1, -1], [-1, 1]]
                : [[1, -1], [1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (!boardState[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    // 점프 가능 체크
                    const jumpRow = row + dr * 2;
                    const jumpCol = col + dc * 2;
                    if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                        const middlePiece = boardState[newRow][newCol];
                        if (middlePiece && !middlePiece.startsWith(isRed ? 'red' : 'black') && !boardState[jumpRow][jumpCol]) {
                            jumps.push({ row: jumpRow, col: jumpCol });
                        }
                    }
                }
            }
        }

        return { moves, jumps };
    }, []);

    const hasAnyJump = useCallback((color: 'red' | 'black', boardState: PieceType[][]): boolean => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (piece?.startsWith(color)) {
                    const { jumps } = getValidMoves(row, col, boardState);
                    if (jumps.length > 0) return true;
                }
            }
        }
        return false;
    }, [getValidMoves]);

    const handleClick = (row: number, col: number) => {
        if (gameOver || turn !== 'red') return;

        const piece = board[row][col];

        if (selected) {
            const isValidMove = validMoves.some(m => m.row === row && m.col === col);

            if (isValidMove) {
                makeMove(selected, { row, col });
            } else if (piece && isPlayerPiece(piece)) {
                selectPiece(row, col);
            } else {
                setSelected(null);
                setValidMoves([]);
            }
        } else if (piece && isPlayerPiece(piece)) {
            if (mustJump && (mustJump.row !== row || mustJump.col !== col)) {
                return; // 연속 점프 중에는 다른 말 선택 불가
            }
            selectPiece(row, col);
        }
    };

    const selectPiece = (row: number, col: number) => {
        const { moves, jumps } = getValidMoves(row, col, board);
        const hasJumpAvailable = hasAnyJump(turn, board);

        if (hasJumpAvailable && jumps.length === 0) {
            // 다른 말이 점프 가능하면 이 말은 선택 불가
            return;
        }

        setSelected({ row, col });
        setValidMoves(hasJumpAvailable ? jumps : moves);
    };

    const makeMove = (from: Position, to: Position) => {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[from.row][from.col];

        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = null;

        // 점프인 경우 중간 말 제거
        const isJump = Math.abs(to.row - from.row) === 2;
        if (isJump) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const capturedPiece = newBoard[midRow][midCol];
            newBoard[midRow][midCol] = null;

            if (capturedPiece?.startsWith('red')) {
                setRedCount(c => c - 1);
                if (redCount - 1 === 0) {
                    setGameOver(true);
                    setWinner('black');
                }
            } else {
                setBlackCount(c => c - 1);
                if (blackCount - 1 === 0) {
                    setGameOver(true);
                    setWinner('red');
                }
            }
        }

        // King 승격
        if (piece === 'red' && to.row === 0) {
            newBoard[to.row][to.col] = 'red-king';
        } else if (piece === 'black' && to.row === 7) {
            newBoard[to.row][to.col] = 'black-king';
        }

        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);

        // 연속 점프 체크
        if (isJump) {
            const { jumps } = getValidMoves(to.row, to.col, newBoard);
            if (jumps.length > 0) {
                setMustJump(to);
                setSelected(to);
                setValidMoves(jumps);
                return;
            }
        }

        setMustJump(null);
        setTurn('black');
        setTimeout(() => aiMove(newBoard), 500);
    };

    const aiMove = (currentBoard: PieceType[][]) => {
        if (gameOver) return;

        let bestMove: { from: Position, to: Position } | null = null;
        let hasJump = false;

        // 점프 우선
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = currentBoard[row][col];
                if (piece?.startsWith('black')) {
                    const { jumps, moves } = getValidMoves(row, col, currentBoard);
                    if (jumps.length > 0) {
                        bestMove = { from: { row, col }, to: jumps[Math.floor(Math.random() * jumps.length)] };
                        hasJump = true;
                        break;
                    }
                    if (!hasJump && moves.length > 0 && Math.random() > 0.7) {
                        bestMove = { from: { row, col }, to: moves[Math.floor(Math.random() * moves.length)] };
                    }
                }
            }
            if (hasJump) break;
        }

        // 랜덤 이동
        if (!bestMove) {
            const allMoves: { from: Position, to: Position }[] = [];
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = currentBoard[row][col];
                    if (piece?.startsWith('black')) {
                        const { moves } = getValidMoves(row, col, currentBoard);
                        moves.forEach(m => allMoves.push({ from: { row, col }, to: m }));
                    }
                }
            }
            if (allMoves.length > 0) {
                bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            }
        }

        if (bestMove) {
            const newBoard = currentBoard.map(r => [...r]);
            const piece = newBoard[bestMove.from.row][bestMove.from.col];
            newBoard[bestMove.to.row][bestMove.to.col] = piece;
            newBoard[bestMove.from.row][bestMove.from.col] = null;

            const isJump = Math.abs(bestMove.to.row - bestMove.from.row) === 2;
            if (isJump) {
                const midRow = (bestMove.from.row + bestMove.to.row) / 2;
                const midCol = (bestMove.from.col + bestMove.to.col) / 2;
                newBoard[midRow][midCol] = null;
                setRedCount(c => {
                    if (c - 1 === 0) {
                        setGameOver(true);
                        setWinner('black');
                    }
                    return c - 1;
                });
            }

            // King 승격
            if (piece === 'black' && bestMove.to.row === 7) {
                newBoard[bestMove.to.row][bestMove.to.col] = 'black-king';
            }

            setBoard(newBoard);

            // 연속 점프
            if (isJump) {
                const { jumps } = getValidMoves(bestMove.to.row, bestMove.to.col, newBoard);
                if (jumps.length > 0) {
                    setTimeout(() => aiMove(newBoard), 500);
                    return;
                }
            }
        }

        setTurn('red');
    };

    const resetGame = () => {
        setBoard(initialBoard());
        setSelected(null);
        setValidMoves([]);
        setTurn('red');
        setMustJump(null);
        setRedCount(12);
        setBlackCount(12);
        setGameOver(false);
        setWinner(null);
    };

    const renderPiece = (piece: PieceType) => {
        if (!piece) return null;
        const isRed = piece.startsWith('red');
        const isKingPiece = piece.includes('king');

        return (
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center
                ${isRed ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-900'}
                border-4 ${isRed ? 'border-red-300' : 'border-gray-500'}`}
            >
                {isKingPiece && <span className="text-xl">👑</span>}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🔴 체커 (Checkers)</h1>

            {/* 상태 표시 */}
            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold ${turn === 'red' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    🔴 빨강: {redCount}
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold ${turn === 'black' ? 'bg-gray-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    ⚫ 검정: {blackCount}
                </div>
            </div>

            {gameOver && (
                <div className={`px-6 py-3 rounded-xl font-bold text-white animate-pulse ${winner === 'red' ? 'bg-red-500' : 'bg-gray-800'}`}>
                    🏆 {winner === 'red' ? '빨강' : '검정'} 승리!
                </div>
            )}

            {/* 보드 */}
            <div className="grid grid-cols-8 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl">
                {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => {
                        const isDark = (rowIdx + colIdx) % 2 === 1;
                        const isSelected = selected?.row === rowIdx && selected?.col === colIdx;
                        const isValidMove = validMoves.some(m => m.row === rowIdx && m.col === colIdx);

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => handleClick(rowIdx, colIdx)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-all
                                    ${isDark ? 'bg-amber-700' : 'bg-amber-100'}
                                    ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                                    ${isValidMove ? 'ring-4 ring-green-400 ring-inset' : ''}`}
                            >
                                {renderPiece(cell)}
                                {isValidMove && !cell && (
                                    <div className="w-6 h-6 rounded-full bg-green-400/50" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <button
                onClick={resetGame}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg"
            >
                🔄 새 게임
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
                <p>💡 빨간 말을 선택하고 대각선으로 이동하세요.</p>
                <p>상대 말을 뛰어넘어 잡을 수 있습니다!</p>
                <p>끝줄에 도달하면 King이 되어 뒤로도 이동 가능합니다.</p>
            </div>
        </div>
    );
};

export default CheckersGame;
