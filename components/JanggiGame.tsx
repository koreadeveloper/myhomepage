import React, { useState, useCallback, useEffect } from 'react';

// 한국 장기 게임
type PieceType = '궁' | '차' | '포' | '마' | '상' | '사' | '졸' | '병' | null;
type Player = 'cho' | 'han';

interface Piece {
    type: PieceType;
    player: Player;
}

interface Position {
    row: number;
    col: number;
}

const JanggiGame: React.FC = () => {
    const ROWS = 10;
    const COLS = 9;

    const createInitialBoard = (): (Piece | null)[][] => {
        const board: (Piece | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

        // 한(Han) - 상단 (적색)
        board[0][0] = { type: '차', player: 'han' };
        board[0][1] = { type: '마', player: 'han' };
        board[0][2] = { type: '상', player: 'han' };
        board[0][3] = { type: '사', player: 'han' };
        board[0][5] = { type: '사', player: 'han' };
        board[0][6] = { type: '상', player: 'han' };
        board[0][7] = { type: '마', player: 'han' };
        board[0][8] = { type: '차', player: 'han' };
        board[1][4] = { type: '궁', player: 'han' };
        board[2][1] = { type: '포', player: 'han' };
        board[2][7] = { type: '포', player: 'han' };
        for (let c = 0; c < 9; c += 2) {
            board[3][c] = { type: '졸', player: 'han' };
        }

        // 초(Cho) - 하단 (녹색)
        board[9][0] = { type: '차', player: 'cho' };
        board[9][1] = { type: '마', player: 'cho' };
        board[9][2] = { type: '상', player: 'cho' };
        board[9][3] = { type: '사', player: 'cho' };
        board[9][5] = { type: '사', player: 'cho' };
        board[9][6] = { type: '상', player: 'cho' };
        board[9][7] = { type: '마', player: 'cho' };
        board[9][8] = { type: '차', player: 'cho' };
        board[8][4] = { type: '궁', player: 'cho' };
        board[7][1] = { type: '포', player: 'cho' };
        board[7][7] = { type: '포', player: 'cho' };
        for (let c = 0; c < 9; c += 2) {
            board[6][c] = { type: '병', player: 'cho' };
        }

        return board;
    };

    const [board, setBoard] = useState<(Piece | null)[][]>(createInitialBoard);
    const [selectedPos, setSelectedPos] = useState<Position | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('cho');
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);

    const isInPalace = (row: number, col: number, player: Player): boolean => {
        if (player === 'cho') {
            return row >= 7 && row <= 9 && col >= 3 && col <= 5;
        } else {
            return row >= 0 && row <= 2 && col >= 3 && col <= 5;
        }
    };

    const getValidMoves = useCallback((row: number, col: number): Position[] => {
        const piece = board[row][col];
        if (!piece) return [];

        const moves: Position[] = [];
        const { type, player } = piece;
        const dir = player === 'cho' ? -1 : 1;

        const addMove = (r: number, c: number) => {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                const target = board[r][c];
                if (!target || target.player !== player) {
                    moves.push({ row: r, col: c });
                }
            }
        };

        switch (type) {
            case '궁':
            case '사':
                // 궁성 안에서 1칸 이동
                const palace = isInPalace(row, col, player);
                if (palace) {
                    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                        const nr = row + dr, nc = col + dc;
                        if (isInPalace(nr, nc, player)) addMove(nr, nc);
                    });
                    // 대각선 (궁성 중앙 또는 꼭지점)
                    if ((row === 1 || row === 8) && col === 4) {
                        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                            const nr = row + dr, nc = col + dc;
                            if (isInPalace(nr, nc, player)) addMove(nr, nc);
                        });
                    }
                }
                break;

            case '차':
                // 가로/세로 무제한
                for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    let r = row + dr, c = col + dc;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        const target = board[r][c];
                        if (!target) {
                            moves.push({ row: r, col: c });
                        } else {
                            if (target.player !== player) moves.push({ row: r, col: c });
                            break;
                        }
                        r += dr;
                        c += dc;
                    }
                }
                break;

            case '포':
                // 차처럼 이동하지만 반드시 하나를 넘어야 함
                for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    let r = row + dr, c = col + dc;
                    let jumped = false;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        const target = board[r][c];
                        if (!jumped) {
                            if (target && target.type !== '포') {
                                jumped = true;
                            }
                        } else {
                            if (!target) {
                                moves.push({ row: r, col: c });
                            } else if (target.type !== '포') {
                                if (target.player !== player) moves.push({ row: r, col: c });
                                break;
                            } else {
                                break;
                            }
                        }
                        r += dr;
                        c += dc;
                    }
                }
                break;

            case '마':
                // 날(날)일자 + 멱(길막힘 체크)
                const horsePatterns = [
                    { block: [0, 1], end: [-1, 2] },
                    { block: [0, 1], end: [1, 2] },
                    { block: [0, -1], end: [-1, -2] },
                    { block: [0, -1], end: [1, -2] },
                    { block: [1, 0], end: [2, -1] },
                    { block: [1, 0], end: [2, 1] },
                    { block: [-1, 0], end: [-2, -1] },
                    { block: [-1, 0], end: [-2, 1] },
                ];
                for (const { block, end } of horsePatterns) {
                    const br = row + block[0], bc = col + block[1];
                    if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS && !board[br][bc]) {
                        addMove(row + end[0], col + end[1]);
                    }
                }
                break;

            case '상':
                // 마와 비슷하지만 더 멀리
                const elephantPatterns = [
                    { blocks: [[0, 1], [1, 2]], end: [2, 3] },
                    { blocks: [[0, 1], [-1, 2]], end: [-2, 3] },
                    { blocks: [[0, -1], [1, -2]], end: [2, -3] },
                    { blocks: [[0, -1], [-1, -2]], end: [-2, -3] },
                    { blocks: [[1, 0], [2, 1]], end: [3, 2] },
                    { blocks: [[1, 0], [2, -1]], end: [3, -2] },
                    { blocks: [[-1, 0], [-2, 1]], end: [-3, 2] },
                    { blocks: [[-1, 0], [-2, -1]], end: [-3, -2] },
                ];
                for (const { blocks, end } of elephantPatterns) {
                    let blocked = false;
                    for (const [bdr, bdc] of blocks) {
                        const br = row + bdr, bc = col + bdc;
                        if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS || board[br][bc]) {
                            blocked = true;
                            break;
                        }
                    }
                    if (!blocked) addMove(row + end[0], col + end[1]);
                }
                break;

            case '졸':
            case '병':
                // 앞, 좌우 1칸
                addMove(row + dir, col);
                addMove(row, col - 1);
                addMove(row, col + 1);
                break;
        }

        return moves;
    }, [board]);

    const handleClick = (row: number, col: number) => {
        if (gameOver) return;

        const piece = board[row][col];

        if (selectedPos) {
            // 이동 시도
            const isValid = validMoves.some(m => m.row === row && m.col === col);
            if (isValid) {
                const newBoard = board.map(r => [...r]);
                const captured = newBoard[row][col];

                newBoard[row][col] = newBoard[selectedPos.row][selectedPos.col];
                newBoard[selectedPos.row][selectedPos.col] = null;
                setBoard(newBoard);

                // 궁 잡힘 체크
                if (captured?.type === '궁') {
                    setGameOver(true);
                    setWinner(currentPlayer);
                } else {
                    setCurrentPlayer(currentPlayer === 'cho' ? 'han' : 'cho');
                }
            }
            setSelectedPos(null);
            setValidMoves([]);
        } else if (piece && piece.player === currentPlayer) {
            // 기물 선택
            setSelectedPos({ row, col });
            setValidMoves(getValidMoves(row, col));
        }
    };

    const resetGame = () => {
        setBoard(createInitialBoard());
        setSelectedPos(null);
        setValidMoves([]);
        setCurrentPlayer('cho');
        setGameOver(false);
        setWinner(null);
    };

    const isValidMove = (r: number, c: number) =>
        validMoves.some(m => m.row === r && m.col === c);

    const getPieceDisplay = (piece: Piece) => {
        return (
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg
                border-2 shadow-md
                ${piece.player === 'cho'
                    ? 'bg-green-100 border-green-600 text-green-700'
                    : 'bg-red-100 border-red-600 text-red-700'}`}>
                {piece.type}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full p-2 gap-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">♟️ 장기</h1>

            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 'cho' ? 'bg-green-500 text-white' : 'bg-green-100'}`}>
                    초(楚)
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 'han' ? 'bg-red-500 text-white' : 'bg-red-100'}`}>
                    한(漢)
                </div>
            </div>

            {gameOver && (
                <div className={`px-6 py-3 rounded-xl font-bold text-white ${winner === 'cho' ? 'bg-green-500' : 'bg-red-500'}`}>
                    🎉 {winner === 'cho' ? '초' : '한'} 승리!
                </div>
            )}

            {/* 장기판 */}
            <div className="bg-amber-100 p-2 rounded-xl shadow-xl">
                <div className="grid gap-0" style={{ gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                    {board.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex">
                            {row.map((cell, colIdx) => {
                                const isSelected = selectedPos?.row === rowIdx && selectedPos?.col === colIdx;
                                const isValid = isValidMove(rowIdx, colIdx);

                                return (
                                    <div
                                        key={colIdx}
                                        onClick={() => handleClick(rowIdx, colIdx)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer
                                            border border-amber-700/30 relative
                                            ${isSelected ? 'bg-yellow-300' : ''}
                                            ${isValid ? 'bg-green-200' : ''}`}
                                    >
                                        {cell && getPieceDisplay(cell)}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={resetGame} className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700">
                🔄 새 게임
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 기물을 클릭하여 선택, 이동할 위치를 클릭하세요.</p>
            </div>
        </div>
    );
};

export default JanggiGame;
