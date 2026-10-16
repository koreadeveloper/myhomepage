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

    const palaceCenter = (player: Player) => player === 'cho' ? { row: 8, col: 4 } : { row: 1, col: 4 };
    const isPalaceCenter = (r: number, c: number, player: Player) => {
        const p = palaceCenter(player);
        return r === p.row && c === p.col;
    };
    const isPalaceCorner = (r: number, c: number, player: Player) => {
        const rows = player === 'cho' ? [7, 9] : [0, 2];
        return rows.includes(r) && (c === 3 || c === 5);
    };
    // 궁성 대각선 인접점 (꼭지점↔중앙)
    const palaceDiagTargets = (r: number, c: number, player: Player): Position[] => {
        const p = palaceCenter(player);
        if (r === p.row && c === p.col) {
            const rows = player === 'cho' ? [7, 9] : [0, 2];
            return rows.flatMap(rr => [{ row: rr, col: 3 }, { row: rr, col: 5 }]);
        }
        if (isPalaceCorner(r, c, player)) return [p];
        return [];
    };

    const getValidMovesOn = useCallback((b: (Piece | null)[][], row: number, col: number): Position[] => {
        const piece = b[row][col];
        if (!piece) return [];

        const moves: Position[] = [];
        const { type, player } = piece;
        const dir = player === 'cho' ? -1 : 1;

        const addMove = (r: number, c: number) => {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                const target = b[r][c];
                if (!target || target.player !== player) {
                    moves.push({ row: r, col: c });
                }
            }
        };

        switch (type) {
            case '궁':
            case '사':
                // 궁성 안에서 1칸 이동 + 대각선 (꼭지점↔중앙 양방향)
                if (isInPalace(row, col, player)) {
                    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                        const nr = row + dr, nc = col + dc;
                        if (isInPalace(nr, nc, player)) addMove(nr, nc);
                    });
                    palaceDiagTargets(row, col, player).forEach(t => addMove(t.row, t.col));
                }
                break;

            case '차':
                // 가로/세로 무제한
                for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    let r = row + dr, c = col + dc;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        const target = b[r][c];
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
                // 궁성 대각선 이동: 꼭지점→중앙→반대편 꼭지점
                if (isPalaceCorner(row, col, player)) {
                    const center = palaceCenter(player);
                    const t = b[center.row][center.col];
                    if (!t || t.player !== player) {
                        moves.push({ row: center.row, col: center.col });
                        if (!t) {
                            const or = center.row + (center.row - row), oc = center.col + (center.col - col);
                            const t2 = b[or][oc];
                            if (!t2 || t2.player !== player) moves.push({ row: or, col: oc });
                        }
                    }
                } else if (isPalaceCenter(row, col, player)) {
                    palaceDiagTargets(row, col, player).forEach(tg => {
                        const t = b[tg.row][tg.col];
                        if (!t || t.player !== player) moves.push(tg);
                    });
                }
                break;

            case '포':
                // 차처럼 이동하지만 반드시 하나를 넘어야 함
                for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                    let r = row + dr, c = col + dc;
                    let jumped = false;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                        const target = b[r][c];
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
                // 궁성 대각선: 꼭지점→(중앙 넘기)→반대편 꼭지점
                if (isPalaceCorner(row, col, player)) {
                    const center = palaceCenter(player);
                    const mid = b[center.row][center.col];
                    if (mid && mid.type !== '포') {
                        const or = center.row + (center.row - row), oc = center.col + (center.col - col);
                        const t2 = b[or][oc];
                        if (!t2 || (t2.player !== player && t2.type !== '포')) moves.push({ row: or, col: oc });
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
                    if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS && !b[br][bc]) {
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
                        if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS || b[br][bc]) {
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
                // 궁성 대각선 전진 (꼭지점↔중앙 라인, 전진 방향만)
                if (isInPalace(row, col, player)) {
                    palaceDiagTargets(row, col, player)
                        .filter(t => (t.row - row) === dir)
                        .forEach(t => addMove(t.row, t.col));
                }
                break;
        }

        return moves;
    }, []);

    const getValidMoves = (row: number, col: number) => getValidMovesOn(board, row, col);

    // 궁 위치 찾기
    const findGeneral = (b: (Piece | null)[][], player: Player): Position | null => {
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
                const p = b[r][c];
                if (p?.type === '궁' && p.player === player) return { row: r, col: c };
            }
        return null;
    };

    // 특정 칸이 byPlayer에게 공격받는지
    const isAttacked = (b: (Piece | null)[][], r: number, c: number, byPlayer: Player): boolean => {
        for (let pr = 0; pr < ROWS; pr++)
            for (let pc = 0; pc < COLS; pc++) {
                const p = b[pr][pc];
                if (p?.player !== byPlayer) continue;
                if (getValidMovesOn(b, pr, pc).some(m => m.row === r && m.col === c)) return true;
            }
        return false;
    };

    const isInCheck = (b: (Piece | null)[][], player: Player): boolean => {
        const gen = findGeneral(b, player);
        if (!gen) return false;
        return isAttacked(b, gen.row, gen.col, player === 'cho' ? 'han' : 'cho');
    };

    // 자기 궁을 공격받게 두는 수 제외한 합법수
    const legalMoves = (b: (Piece | null)[][], row: number, col: number): Position[] => {
        const piece = b[row][col];
        if (!piece) return [];
        return getValidMovesOn(b, row, col).filter(m => {
            const nb = b.map(r => [...r]);
            nb[m.row][m.col] = nb[row][col];
            nb[row][col] = null;
            return !isInCheck(nb, piece.player);
        });
    };

    const hasAnyLegalMove = (b: (Piece | null)[][], player: Player): boolean => {
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (b[r][c]?.player === player && legalMoves(b, r, c).length > 0) return true;
        return false;
    };

    const pieceValues: Record<string, number> = { '궁': 1000, '차': 13, '포': 7, '마': 5, '상': 3, '사': 3, '졸': 2, '병': 2 };

    // 한(漢) AI: 캡처 가치 + 장군 가중
    const aiMove = (b: (Piece | null)[][]) => {
        const moves: { from: Position; to: Position; score: number }[] = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const p = b[r][c];
                if (p?.player !== 'han') continue;
                for (const m of legalMoves(b, r, c)) {
                    let score = Math.random() * 4;
                    const target = b[m.row][m.col];
                    if (target) score += (pieceValues[target.type!] || 0) * 10;
                    // 장군 보너스: 수 후 상대 궁 공격
                    const nb = b.map(row => [...row]);
                    nb[m.row][m.col] = nb[r][c];
                    nb[r][c] = null;
                    if (isInCheck(nb, 'cho')) score += 15;
                    score += m.row * 0.05; // 전진 보너스 (한은 아래로)
                    moves.push({ from: { row: r, col: c }, to: m, score });
                }
            }
        }

        if (moves.length === 0) {
            // AI가 둘 수 없음 → 플레이어 승리
            setGameOver(true);
            setWinner('cho');
            return;
        }

        moves.sort((a, b) => b.score - a.score);
        const best = moves[0];
        const nb = b.map(r => [...r]);
        const captured = nb[best.to.row][best.to.col];
        nb[best.to.row][best.to.col] = nb[best.from.row][best.from.col];
        nb[best.from.row][best.from.col] = null;
        setBoard(nb);

        if (captured?.type === '궁') {
            setGameOver(true);
            setWinner('han');
            return;
        }
        // 플레이어 체크메이트/둘 곳 없음 (장기는 패스 없음 → 둘 수 없으면 패배)
        if (!hasAnyLegalMove(nb, 'cho')) {
            setGameOver(true);
            setWinner('han');
            return;
        }
        setCurrentPlayer('cho');
    };

    // AI 턴 트리거
    useEffect(() => {
        if (currentPlayer === 'han' && !gameOver) {
            const t = setTimeout(() => aiMove(board), 500);
            return () => clearTimeout(t);
        }
    }, [currentPlayer, gameOver]);

    const handleClick = (row: number, col: number) => {
        if (gameOver || currentPlayer !== 'cho') return;

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

                // 궁 잡힘 / 체크메이트 체크
                if (captured?.type === '궁') {
                    setGameOver(true);
                    setWinner('cho');
                } else if (!hasAnyLegalMove(newBoard, 'han')) {
                    setGameOver(true);
                    setWinner('cho');
                } else {
                    setCurrentPlayer('han');
                }
            }
            setSelectedPos(null);
            setValidMoves([]);
        } else if (piece && piece.player === 'cho') {
            // 기물 선택 (합법수만 표시 — 자살수 제외)
            setSelectedPos({ row, col });
            setValidMoves(legalMoves(board, row, col));
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
                    초(楚) — 나
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 'han' ? 'bg-red-500 text-white' : 'bg-red-100'}`}>
                    한(漢) — AI
                </div>
            </div>

            {!gameOver && isInCheck(board, 'cho') && (
                <div className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold animate-pulse">
                    ⚠️ 장군!
                </div>
            )}

            {gameOver && (
                <div className={`px-6 py-3 rounded-xl font-bold text-white ${winner === 'cho' ? 'bg-green-500' : 'bg-red-500'}`}>
                    🎉 {winner === 'cho' ? '초(나)' : '한(AI)'} 승리!
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
                <p>💡 초(녹색) 기물을 클릭해 이동하세요. 한(적색)은 AI가 둡니다.</p>
                <p>장군 상태에선 궁을 지키는 수만 둘 수 있습니다.</p>
            </div>
        </div>
    );
};

export default JanggiGame;
