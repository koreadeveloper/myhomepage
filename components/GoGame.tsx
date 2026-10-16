import React, { useState, useCallback, useRef } from 'react';

type Stone = 'black' | 'white' | null;

interface Position {
    row: number;
    col: number;
}

const GoGame: React.FC = () => {
    const [boardSize, setBoardSize] = useState<9 | 13 | 19>(9);
    const [board, setBoard] = useState<Stone[][]>(() =>
        Array(9).fill(null).map(() => Array(9).fill(null))
    );
    const [turn, setTurn] = useState<'black' | 'white'>('black');
    const [captured, setCaptured] = useState({ black: 0, white: 0 });
    const [lastMove, setLastMove] = useState<Position | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [passCount, setPassCount] = useState(0);
    const [koBlocked, setKoBlocked] = useState(false);
    // 코 룰: 직전 보드 상태 (되돌리는 수 금지)
    const prevBoardRef = useRef<Stone[][] | null>(null);

    // 보드 초기화
    const initBoard = useCallback((size: 9 | 13 | 19) => {
        setBoardSize(size);
        setBoard(Array(size).fill(null).map(() => Array(size).fill(null)));
        setTurn('black');
        setCaptured({ black: 0, white: 0 });
        setLastMove(null);
        setGameOver(false);
        setPassCount(0);
        setKoBlocked(false);
        prevBoardRef.current = null;
    }, []);

    const boardsEqual = (a: Stone[][], b: Stone[][]): boolean => {
        for (let r = 0; r < boardSize; r++)
            for (let c = 0; c < boardSize; c++)
                if (a[r][c] !== b[r][c]) return false;
        return true;
    };

    // 인접한 위치들
    const getNeighbors = (row: number, col: number): Position[] => {
        const neighbors: Position[] = [];
        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < boardSize - 1) neighbors.push({ row: row + 1, col });
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < boardSize - 1) neighbors.push({ row, col: col + 1 });
        return neighbors;
    };

    // 돌 그룹 찾기 (연결된 같은 색 돌)
    const findGroup = (row: number, col: number, boardState: Stone[][]): Position[] => {
        const color = boardState[row][col];
        if (!color) return [];

        const group: Position[] = [];
        const visited = new Set<string>();
        const stack: Position[] = [{ row, col }];

        while (stack.length > 0) {
            const pos = stack.pop()!;
            const key = `${pos.row},${pos.col}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (boardState[pos.row][pos.col] === color) {
                group.push(pos);
                getNeighbors(pos.row, pos.col).forEach(n => {
                    if (!visited.has(`${n.row},${n.col}`)) {
                        stack.push(n);
                    }
                });
            }
        }

        return group;
    };

    // 그룹의 활로(빈 칸) 수 계산
    const countLiberties = (group: Position[], boardState: Stone[][]): number => {
        const liberties = new Set<string>();
        group.forEach(pos => {
            getNeighbors(pos.row, pos.col).forEach(n => {
                if (boardState[n.row][n.col] === null) {
                    liberties.add(`${n.row},${n.col}`);
                }
            });
        });
        return liberties.size;
    };

    // 돌 잡기 (활로가 0인 그룹 제거)
    const captureStones = (boardState: Stone[][], color: 'black' | 'white'): { board: Stone[][], captured: number } => {
        const newBoard = boardState.map(row => [...row]);
        let capturedCount = 0;
        const visited = new Set<string>();

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (newBoard[row][col] === color && !visited.has(`${row},${col}`)) {
                    const group = findGroup(row, col, newBoard);
                    group.forEach(p => visited.add(`${p.row},${p.col}`));

                    if (countLiberties(group, newBoard) === 0) {
                        group.forEach(p => {
                            newBoard[p.row][p.col] = null;
                            capturedCount++;
                        });
                    }
                }
            }
        }

        return { board: newBoard, captured: capturedCount };
    };

    // 돌 놓기
    const placeStone = (row: number, col: number) => {
        if (gameOver || board[row][col] !== null) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = turn;

        // 상대 돌 먼저 잡기
        const opponent = turn === 'black' ? 'white' : 'black';
        const opponentCapture = captureStones(newBoard, opponent);
        let finalBoard = opponentCapture.board;

        // 자살 수 체크 (자신의 활로가 0이면 무효)
        const selfGroup = findGroup(row, col, finalBoard);
        if (countLiberties(selfGroup, finalBoard) === 0 && opponentCapture.captured === 0) {
            return; // 자살 수는 무효
        }

        // 코 룰: 직전 보드로 되돌리는 수 금지
        if (prevBoardRef.current && boardsEqual(finalBoard, prevBoardRef.current)) {
            setKoBlocked(true);
            setTimeout(() => setKoBlocked(false), 1200);
            return;
        }

        prevBoardRef.current = board;
        setBoard(finalBoard);
        setCaptured(prev => ({
            ...prev,
            [turn]: prev[turn] + opponentCapture.captured
        }));
        setLastMove({ row, col });
        setPassCount(0);
        setTurn(opponent);

        // AI 턴
        setTimeout(() => aiMove(finalBoard, opponent), 300);
    };

    // 개선된 AI (잡기 우선, 위협 방어, 중앙 우선, 연결 우선)
    const aiMove = (currentBoard: Stone[][], color: 'black' | 'white') => {
        if (gameOver) return;

        const opponent = color === 'black' ? 'white' : 'black';
        const center = Math.floor(boardSize / 2);

        interface ScoredMove {
            pos: Position;
            score: number;
        }

        const scoredMoves: ScoredMove[] = [];

        // 19x19 성능: 돌 주변(거리 2 이내) 후보만 평가
        const anyStone = currentBoard.some(r => r.some(c => c !== null));
        const nearStone = (r: number, c: number): boolean => {
            for (let dr = -2; dr <= 2; dr++)
                for (let dc = -2; dc <= 2; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize && currentBoard[nr][nc] !== null)
                        return true;
                }
            return false;
        };

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (currentBoard[row][col] !== null) continue;
                if (anyStone && !nearStone(row, col)) continue;
                // 빈 판이면 중앙 부근만
                if (!anyStone && Math.abs(row - center) + Math.abs(col - center) > 2) continue;

                // 자살 수 체크
                const testBoard = currentBoard.map(r => [...r]);
                testBoard[row][col] = color;

                const afterCapture = captureStones(testBoard, opponent);
                const group = findGroup(row, col, afterCapture.board);
                const liberties = countLiberties(group, afterCapture.board);

                if (liberties === 0 && afterCapture.captured === 0) continue;

                // 코 룰 체크
                if (prevBoardRef.current && boardsEqual(afterCapture.board, prevBoardRef.current)) continue;

                let score = 0;

                // 1. 잡기 점수 (가장 높은 우선순위)
                if (afterCapture.captured > 0) {
                    score += afterCapture.captured * 100;
                }

                // 2. 위협 방어 (자기 돌이 위험할 때)
                getNeighbors(row, col).forEach(n => {
                    if (currentBoard[n.row][n.col] === color) {
                        const neighborGroup = findGroup(n.row, n.col, currentBoard);
                        const neighborLiberties = countLiberties(neighborGroup, currentBoard);
                        if (neighborLiberties === 1) {
                            score += 80; // 위기 상황 방어
                        } else if (neighborLiberties === 2) {
                            score += 30;
                        }
                    }
                });

                // 3. 상대 위협 (상대 활로 줄이기)
                getNeighbors(row, col).forEach(n => {
                    if (currentBoard[n.row][n.col] === opponent) {
                        const opponentGroup = findGroup(n.row, n.col, currentBoard);
                        const opponentLiberties = countLiberties(opponentGroup, currentBoard);
                        if (opponentLiberties === 2) {
                            score += 50; // 상대 위협
                        }
                    }
                });

                // 4. 연결 보너스
                let friendlyNeighbors = 0;
                getNeighbors(row, col).forEach(n => {
                    if (currentBoard[n.row][n.col] === color) {
                        friendlyNeighbors++;
                    }
                });
                score += friendlyNeighbors * 5;

                // 5. 중앙 우선 (더 전략적인 위치)
                const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
                score += (boardSize - distFromCenter) * 2;

                // 6. 코너/변 피하기 (초기)
                if (scoredMoves.length < boardSize * 2) {
                    if ((row === 0 || row === boardSize - 1) && (col === 0 || col === boardSize - 1)) {
                        score -= 20; // 코너 피하기
                    }
                }

                // 7. 약간의 랜덤성 추가
                score += Math.random() * 10;

                scoredMoves.push({ pos: { row, col }, score });
            }
        }

        if (scoredMoves.length === 0) {
            handlePass(color);
            return;
        }

        // 최고 점수 수 선택
        scoredMoves.sort((a, b) => b.score - a.score);
        const move = scoredMoves[0].pos;

        const newBoard = currentBoard.map(r => [...r]);
        newBoard[move.row][move.col] = color;

        const opponentCapture = captureStones(newBoard, opponent);
        const finalBoard = opponentCapture.board;

        setBoard(finalBoard);
        setCaptured(prev => ({
            ...prev,
            [color]: prev[color] + opponentCapture.captured
        }));
        prevBoardRef.current = currentBoard;
        setLastMove(move);
        setPassCount(0);
        setTurn(opponent);
    };

    // 패스
    const handlePass = (color?: 'black' | 'white') => {
        const currentPassCount = passCount + 1;
        setPassCount(currentPassCount);
        prevBoardRef.current = null; // 패스 후 코 제한 해제

        if (currentPassCount >= 2) {
            setGameOver(true);
        } else {
            const nextTurn = (color || turn) === 'black' ? 'white' : 'black';
            setTurn(nextTurn);

            if (!color) {
                setTimeout(() => aiMove(board, nextTurn), 300);
            }
        }
    };

    // 점수 계산 (중국식 면적 계산: 돌 수 + 집 + 사석, 백 집계보정 6.5)
    const getScore = () => {
        const territory = { black: 0, white: 0 };
        const stones = { black: 0, white: 0 };
        const visited = new Set<string>();

        // 빈 영역 플러드필 → 한쪽 색으로만 둘러싸인 영역만 집으로 인정
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = board[r][c];
                if (cell) {
                    stones[cell]++;
                    continue;
                }
                const key = `${r},${c}`;
                if (visited.has(key)) continue;

                const region: Position[] = [];
                const borderColors = new Set<'black' | 'white'>();
                const stack: Position[] = [{ row: r, col: c }];
                while (stack.length > 0) {
                    const pos = stack.pop()!;
                    const k = `${pos.row},${pos.col}`;
                    if (visited.has(k)) continue;
                    const cellVal = board[pos.row][pos.col];
                    if (cellVal) {
                        borderColors.add(cellVal);
                        continue;
                    }
                    visited.add(k);
                    region.push(pos);
                    getNeighbors(pos.row, pos.col).forEach(n => stack.push(n));
                }
                if (borderColors.size === 1) {
                    const color = [...borderColors][0];
                    territory[color] += region.length;
                }
            }
        }

        const KOMI = 6.5;
        return {
            black: captured.black + stones.black + territory.black,
            white: captured.white + stones.white + territory.white + KOMI,
            detail: { stones, territory, captured, komi: KOMI }
        };
    };

    const score = getScore();
    const cellSize = boardSize === 9 ? 44 : boardSize === 13 ? 36 : 26;

    return (
        <div className="flex flex-col items-center justify-center w-full p-2 gap-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">⚫ 바둑 (Go)</h1>

            {/* 보드 크기 선택 */}
            <div className="flex gap-2">
                {([9, 13, 19] as const).map(size => (
                    <button
                        key={size}
                        onClick={() => initBoard(size)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${boardSize === size
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                            }`}
                    >
                        {size}×{size}
                    </button>
                ))}
            </div>

            {/* 상태 표시 */}
            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${turn === 'black' ? 'bg-slate-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                    ⚫ 흑: {score.black}
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${turn === 'white' ? 'bg-white text-slate-800 ring-2 ring-slate-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                    ⚪ 백: {score.white}
                </div>
            </div>

            {gameOver && (
                <div className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold animate-pulse text-center">
                    게임 종료! {score.black > score.white ? '흑' : score.white > score.black ? '백' : '무승부'} 승리!
                    <div className="text-xs font-normal opacity-90">
                        집 {score.detail.territory.black}:{score.detail.territory.white} · 사석 {score.detail.captured.black}:{score.detail.captured.white} · 백 덤 {score.detail.komi}
                    </div>
                </div>
            )}

            {koBlocked && (
                <div className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold">
                    코(ko) 룰: 바로 되따낼 수 없습니다
                </div>
            )}

            {/* 바둑판 */}
            <div
                className="relative bg-amber-200 dark:bg-amber-700 rounded-lg shadow-2xl p-4"
                style={{
                    width: cellSize * boardSize + 32,
                    height: cellSize * boardSize + 32,
                }}
            >
                {/* 격자선 */}
                <svg
                    className="absolute"
                    style={{ top: 16, left: 16 }}
                    width={cellSize * (boardSize - 1) + cellSize}
                    height={cellSize * (boardSize - 1) + cellSize}
                >
                    {Array(boardSize).fill(0).map((_, i) => (
                        <React.Fragment key={i}>
                            <line
                                x1={cellSize / 2}
                                y1={cellSize / 2 + i * cellSize}
                                x2={cellSize * boardSize - cellSize / 2}
                                y2={cellSize / 2 + i * cellSize}
                                stroke="#5c4a3d"
                                strokeWidth={1}
                            />
                            <line
                                x1={cellSize / 2 + i * cellSize}
                                y1={cellSize / 2}
                                x2={cellSize / 2 + i * cellSize}
                                y2={cellSize * boardSize - cellSize / 2}
                                stroke="#5c4a3d"
                                strokeWidth={1}
                            />
                        </React.Fragment>
                    ))}
                </svg>

                {/* 돌 */}
                <div
                    className="relative grid"
                    style={{
                        gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
                    }}
                >
                    {board.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => turn === 'black' && placeStone(rowIdx, colIdx)}
                                className="flex items-center justify-center cursor-pointer group"
                            >
                                {cell ? (
                                    <div
                                        className={`rounded-full shadow-lg transition-transform ${cell === 'black'
                                            ? 'bg-gradient-to-br from-gray-700 to-black'
                                            : 'bg-gradient-to-br from-white to-gray-200 border border-gray-300'
                                            } ${lastMove?.row === rowIdx && lastMove?.col === colIdx ? 'ring-2 ring-red-500' : ''}`}
                                        style={{ width: cellSize - 6, height: cellSize - 6 }}
                                    />
                                ) : (
                                    turn === 'black' && (
                                        <div
                                            className="rounded-full bg-gray-400/30 opacity-0 group-hover:opacity-50 transition-opacity"
                                            style={{ width: cellSize - 6, height: cellSize - 6 }}
                                        />
                                    )
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => handlePass()}
                    disabled={turn !== 'black' || gameOver}
                    className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    패스
                </button>
                <button
                    onClick={() => initBoard(boardSize)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
                >
                    🔄 새 게임
                </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 빈 교차점을 클릭하여 돌을 놓으세요.</p>
                <p>상대 돌의 활로를 모두 막으면 잡을 수 있습니다.</p>
            </div>
        </div>
    );
};

export default GoGame;
