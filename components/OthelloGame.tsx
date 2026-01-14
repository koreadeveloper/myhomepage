import React, { useState, useCallback } from 'react';

type Cell = 'black' | 'white' | null;

const OthelloGame: React.FC = () => {
    const [board, setBoard] = useState<Cell[][]>(() => {
        const initial: Cell[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        initial[3][3] = 'white';
        initial[3][4] = 'black';
        initial[4][3] = 'black';
        initial[4][4] = 'white';
        return initial;
    });
    const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
    const [gameOver, setGameOver] = useState(false);
    const [validMoves, setValidMoves] = useState<[number, number][]>([]);

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const getFlippable = useCallback((board: Cell[][], row: number, col: number, player: 'black' | 'white'): [number, number][] => {
        if (board[row][col] !== null) return [];

        const opponent = player === 'black' ? 'white' : 'black';
        const toFlip: [number, number][] = [];

        for (const [dr, dc] of directions) {
            const line: [number, number][] = [];
            let r = row + dr;
            let c = col + dc;

            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                line.push([r, c]);
                r += dr;
                c += dc;
            }

            if (line.length > 0 && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                toFlip.push(...line);
            }
        }

        return toFlip;
    }, []);

    const getValidMoves = useCallback((board: Cell[][], player: 'black' | 'white'): [number, number][] => {
        const moves: [number, number][] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (getFlippable(board, r, c, player).length > 0) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }, [getFlippable]);

    React.useEffect(() => {
        setValidMoves(getValidMoves(board, currentPlayer));
    }, [board, currentPlayer, getValidMoves]);

    const handleClick = (row: number, col: number) => {
        if (gameOver) return;

        const toFlip = getFlippable(board, row, col, currentPlayer);
        if (toFlip.length === 0) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;
        toFlip.forEach(([r, c]) => {
            newBoard[r][c] = currentPlayer;
        });

        setBoard(newBoard);

        const opponent = currentPlayer === 'black' ? 'white' : 'black';
        const opponentMoves = getValidMoves(newBoard, opponent);

        if (opponentMoves.length > 0) {
            setCurrentPlayer(opponent);
            // AI 턴
            if (opponent === 'white') {
                setTimeout(() => aiMove(newBoard, opponent), 500);
            }
        } else {
            const myMoves = getValidMoves(newBoard, currentPlayer);
            if (myMoves.length === 0) {
                setGameOver(true);
            }
        }
    };

    const aiMove = (board: Cell[][], player: 'black' | 'white') => {
        const moves = getValidMoves(board, player);
        if (moves.length === 0) return;

        // 코너 우선, 가장자리 차선
        const cornerMoves = moves.filter(([r, c]) =>
            (r === 0 || r === 7) && (c === 0 || c === 7)
        );
        const edgeMoves = moves.filter(([r, c]) =>
            r === 0 || r === 7 || c === 0 || c === 7
        );

        let selectedMove: [number, number];
        if (cornerMoves.length > 0) {
            selectedMove = cornerMoves[0];
        } else if (edgeMoves.length > 0) {
            selectedMove = edgeMoves[Math.floor(Math.random() * edgeMoves.length)];
        } else {
            // 가장 많이 뒤집는 수
            let maxFlip = 0;
            selectedMove = moves[0];
            for (const [r, c] of moves) {
                const flip = getFlippable(board, r, c, player).length;
                if (flip > maxFlip) {
                    maxFlip = flip;
                    selectedMove = [r, c];
                }
            }
        }

        const toFlip = getFlippable(board, selectedMove[0], selectedMove[1], player);
        const newBoard = board.map(r => [...r]);
        newBoard[selectedMove[0]][selectedMove[1]] = player;
        toFlip.forEach(([r, c]) => {
            newBoard[r][c] = player;
        });

        setBoard(newBoard);

        const opponent = player === 'black' ? 'white' : 'black';
        const opponentMoves = getValidMoves(newBoard, opponent);

        if (opponentMoves.length > 0) {
            setCurrentPlayer(opponent);
        } else {
            const myMoves = getValidMoves(newBoard, player);
            if (myMoves.length === 0) {
                setGameOver(true);
            }
        }
    };

    const resetGame = () => {
        const initial: Cell[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        initial[3][3] = 'white';
        initial[3][4] = 'black';
        initial[4][3] = 'black';
        initial[4][4] = 'white';
        setBoard(initial);
        setCurrentPlayer('black');
        setGameOver(false);
    };

    const countPieces = () => {
        let black = 0, white = 0;
        board.forEach(row => row.forEach(cell => {
            if (cell === 'black') black++;
            else if (cell === 'white') white++;
        }));
        return { black, white };
    };

    const { black, white } = countPieces();
    const isValid = (r: number, c: number) => validMoves.some(([vr, vc]) => vr === r && vc === c);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">⚫ 오셀로 (Othello)</h1>

            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 'black' ? 'bg-slate-800 text-white ring-2 ring-green-400' : 'bg-slate-200'}`}>
                    ⚫ {black}
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 'white' ? 'bg-white text-slate-800 ring-2 ring-green-400' : 'bg-slate-200'}`}>
                    ⚪ {white}
                </div>
            </div>

            {gameOver && (
                <div className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold">
                    게임 종료! {black > white ? '⚫ 흑 승리!' : white > black ? '⚪ 백 승리!' : '무승부!'}
                </div>
            )}

            <div className="bg-green-700 p-2 rounded-xl shadow-2xl">
                <div className="grid grid-cols-8 gap-0.5">
                    {board.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => handleClick(rowIdx, colIdx)}
                                className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-all
                                    bg-green-600 hover:bg-green-500
                                    ${isValid(rowIdx, colIdx) ? 'ring-2 ring-yellow-400 ring-inset' : ''}`}
                            >
                                {cell && (
                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all
                                        ${cell === 'black'
                                            ? 'bg-gradient-to-br from-gray-700 to-black'
                                            : 'bg-gradient-to-br from-white to-gray-200 border border-gray-300'}`}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button onClick={resetGame} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                🔄 새 게임
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 상대 돌을 사이에 두고 놓으면 뒤집을 수 있습니다.</p>
            </div>
        </div>
    );
};

export default OthelloGame;
