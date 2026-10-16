import React, { useState, useCallback, useRef } from 'react';

type Cell = 'empty' | 'ship' | 'hit' | 'miss';

interface Ship {
    name: string;
    size: number;
    placed: boolean;
}

const BattleshipGame: React.FC = () => {
    const GRID_SIZE = 10;

    const initialShips: Ship[] = [
        { name: '항공모함', size: 5, placed: false },
        { name: '전함', size: 4, placed: false },
        { name: '순양함', size: 3, placed: false },
        { name: '잠수함', size: 3, placed: false },
        { name: '구축함', size: 2, placed: false },
    ];

    const createEmptyGrid = (): Cell[][] =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'));

    const [playerBoard, setPlayerBoard] = useState<Cell[][]>(createEmptyGrid);
    const [enemyBoard, setEnemyBoard] = useState<Cell[][]>(createEmptyGrid);
    const [enemyShipsHidden, setEnemyShipsHidden] = useState<Cell[][]>(createEmptyGrid);
    const [playerShips, setPlayerShips] = useState<Ship[]>(initialShips);
    const [phase, setPhase] = useState<'placing' | 'playing' | 'won' | 'lost'>('placing');
    const [selectedShip, setSelectedShip] = useState<number>(0);
    const [isHorizontal, setIsHorizontal] = useState(true);
    const [message, setMessage] = useState('배를 배치하세요');
    const [playerHits, setPlayerHits] = useState(0);
    const [enemyHits, setEnemyHits] = useState(0);
    const [aiThinking, setAiThinking] = useState(false);

    // 최신 보드 참조 (비동기 AI 턴의 stale closure 방지)
    const playerBoardRef = useRef(playerBoard);
    const huntTargetsRef = useRef<[number, number][]>([]);

    // state 변경 시 ref 동기화
    const syncPlayerBoard = (b: Cell[][]) => {
        playerBoardRef.current = b;
        setPlayerBoard(b);
    };

    const totalShipCells = initialShips.reduce((sum, ship) => sum + ship.size, 0);

    const canPlace = useCallback((board: Cell[][], row: number, col: number, size: number, horizontal: boolean): boolean => {
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            if (r >= GRID_SIZE || c >= GRID_SIZE || board[r][c] !== 'empty') {
                return false;
            }
        }
        return true;
    }, []);

    const placeShip = useCallback((board: Cell[][], row: number, col: number, size: number, horizontal: boolean): Cell[][] => {
        const newBoard = board.map(r => [...r]);
        for (let i = 0; i < size; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            newBoard[r][c] = 'ship';
        }
        return newBoard;
    }, []);

    const handlePlayerBoardClick = (row: number, col: number) => {
        if (phase !== 'placing') return;

        const ship = playerShips[selectedShip];
        if (!ship || ship.placed) return;

        if (!canPlace(playerBoard, row, col, ship.size, isHorizontal)) {
            setMessage('여기에 배치할 수 없습니다!');
            return;
        }

        const newBoard = placeShip(playerBoard, row, col, ship.size, isHorizontal);
        syncPlayerBoard(newBoard);

        const newShips = [...playerShips];
        newShips[selectedShip].placed = true;
        setPlayerShips(newShips);

        // 다음 배가 있으면 선택
        const nextIdx = newShips.findIndex(s => !s.placed);
        if (nextIdx !== -1) {
            setSelectedShip(nextIdx);
            setMessage(`${newShips[nextIdx].name}을(를) 배치하세요`);
        } else {
            // AI 배치
            let aiBoard = createEmptyGrid();
            for (const shipData of initialShips) {
                let placed = false;
                while (!placed) {
                    const r = Math.floor(Math.random() * GRID_SIZE);
                    const c = Math.floor(Math.random() * GRID_SIZE);
                    const h = Math.random() > 0.5;
                    if (canPlace(aiBoard, r, c, shipData.size, h)) {
                        aiBoard = placeShip(aiBoard, r, c, shipData.size, h);
                        placed = true;
                    }
                }
            }
            setEnemyShipsHidden(aiBoard);
            setPhase('playing');
            setMessage('적 함대를 공격하세요!');
        }
    };

    const handleEnemyBoardClick = (row: number, col: number) => {
        if (phase !== 'playing' || aiThinking) return;
        if (enemyBoard[row][col] !== 'empty') return;

        const newEnemyBoard = enemyBoard.map(r => [...r]);
        const isHit = enemyShipsHidden[row][col] === 'ship';
        newEnemyBoard[row][col] = isHit ? 'hit' : 'miss';
        setEnemyBoard(newEnemyBoard);

        if (isHit) {
            const newHits = playerHits + 1;
            setPlayerHits(newHits);
            setMessage('명중! 💥');
            if (newHits >= totalShipCells) {
                setPhase('won');
                setMessage('🎉 승리! 모든 적함을 격침시켰습니다!');
                return;
            }
        } else {
            setMessage('빗나감...');
        }

        // AI 턴
        setAiThinking(true);
        setTimeout(() => aiAttack(), 800);
    };

    const aiAttack = () => {
        // 최신 보드 사용
        const board = playerBoardRef.current;

        // Hunt 모드: 명중된 함선 주변을 우선 공격
        const isAttacked = (r: number, c: number) => board[r][c] === 'hit' || board[r][c] === 'miss';
        huntTargetsRef.current = huntTargetsRef.current.filter(([r, c]) =>
            r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !isAttacked(r, c)
        );

        let row: number, col: number;
        if (huntTargetsRef.current.length > 0) {
            [row, col] = huntTargetsRef.current.shift()!;
        } else {
            // 랜덤 + 체커보드 패턴 (함선 효율적 탐색)
            const available: [number, number][] = [];
            const parity: [number, number][] = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (!isAttacked(r, c)) {
                        available.push([r, c]);
                        if ((r + c) % 2 === 0) parity.push([r, c]);
                    }
                }
            }
            if (available.length === 0) { setAiThinking(false); return; }
            const pool = parity.length > 0 ? parity : available;
            [row, col] = pool[Math.floor(Math.random() * pool.length)];
        }

        const newPlayerBoard = board.map(r => [...r]);
        const isHit = board[row][col] === 'ship';
        newPlayerBoard[row][col] = isHit ? 'hit' : 'miss';
        playerBoardRef.current = newPlayerBoard;
        setPlayerBoard(newPlayerBoard);

        if (isHit) {
            // 명중 → 인접 칸을 사냥 목표에 추가
            const neighbors: [number, number][] = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
            huntTargetsRef.current.push(...neighbors.filter(([r, c]) =>
                r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && !isAttacked(r, c)
            ));

            const newHits = newPlayerBoard.flat().filter(c => c === 'hit').length;
            setEnemyHits(newHits);
            if (newHits >= totalShipCells) {
                setPhase('lost');
                setMessage('😢 패배! 모든 아군 함대가 격침되었습니다...');
            }
        }
        setAiThinking(false);
    };

    const resetGame = () => {
        setPlayerBoard(createEmptyGrid());
        setEnemyBoard(createEmptyGrid());
        setEnemyShipsHidden(createEmptyGrid());
        setPlayerShips(initialShips.map(s => ({ ...s, placed: false })));
        setPhase('placing');
        setSelectedShip(0);
        setMessage('배를 배치하세요');
        setPlayerHits(0);
        setEnemyHits(0);
        setAiThinking(false);
        playerBoardRef.current = createEmptyGrid();
        huntTargetsRef.current = [];
    };

    const renderCell = (cell: Cell, isEnemy: boolean, hidden?: Cell) => {
        if (cell === 'hit') return '💥';
        if (cell === 'miss') return '🌊';
        if (!isEnemy && cell === 'ship') return '🚢';
        return '';
    };

    const renderGrid = (board: Cell[][], isEnemy: boolean, hidden?: Cell[][]) => (
        <div className="bg-blue-900 p-2 rounded-xl">
            <div className="text-xs text-white text-center mb-1">{isEnemy ? '적 함대' : '아군 함대'}</div>
            <div className="grid grid-cols-10 gap-0.5">
                {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => (
                        <div
                            key={`${rowIdx}-${colIdx}`}
                            onClick={() => isEnemy ? handleEnemyBoardClick(rowIdx, colIdx) : handlePlayerBoardClick(rowIdx, colIdx)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs cursor-pointer transition-all
                                ${cell === 'empty' ? 'bg-blue-400 hover:bg-blue-300' : ''}
                                ${cell === 'ship' && !isEnemy ? 'bg-gray-500' : ''}
                                ${cell === 'hit' ? 'bg-red-500' : ''}
                                ${cell === 'miss' ? 'bg-blue-200' : ''}`}
                        >
                            {renderCell(cell, isEnemy)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🚢 배틀쉽</h1>

            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                <p className="font-bold">{message}</p>
            </div>

            {phase === 'placing' && (
                <div className="flex gap-2 flex-wrap justify-center">
                    {playerShips.map((ship, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedShip(idx)}
                            disabled={ship.placed}
                            className={`px-3 py-1 rounded text-sm transition-all
                                ${selectedShip === idx ? 'bg-blue-600 text-white' : 'bg-slate-200'}
                                ${ship.placed ? 'opacity-50 line-through' : ''}`}
                        >
                            {ship.name} ({ship.size})
                        </button>
                    ))}
                    <button
                        onClick={() => setIsHorizontal(!isHorizontal)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                        {isHorizontal ? '가로' : '세로'}
                    </button>
                </div>
            )}

            <div className="flex gap-4 flex-wrap justify-center">
                {renderGrid(playerBoard, false)}
                {phase !== 'placing' && renderGrid(enemyBoard, true)}
            </div>

            <button onClick={resetGame} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                🔄 새 게임
            </button>
        </div>
    );
};

export default BattleshipGame;
