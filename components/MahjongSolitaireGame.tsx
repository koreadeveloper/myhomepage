import React, { useState, useEffect, useCallback } from 'react';

interface Tile {
    id: number;
    symbol: string;
    layer: number;
    row: number;
    col: number;
    removed: boolean;
}

const MahjongSolitaireGame: React.FC = () => {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const symbols = ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', // 만
        '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘', // 삭
        '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡', // 통
        '🀀', '🀁', '🀂', '🀃', '🀆', '🀅', '🀄']; // 바람/삼원

    const createPyramidLayout = useCallback((): Tile[] => {
        const newTiles: Tile[] = [];
        let id = 0;

        // 심플한 3층 피라미드 레이아웃
        const layouts = [
            // 층 0 (바닥) - 6x8
            { layer: 0, positions: [] as [number, number][] },
            // 층 1 (중간) - 4x6
            { layer: 1, positions: [] as [number, number][] },
            // 층 2 (상단) - 2x4
            { layer: 2, positions: [] as [number, number][] },
        ];

        // 층 0
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 8; c++) {
                layouts[0].positions.push([r, c]);
            }
        }
        // 층 1
        for (let r = 1; r < 5; r++) {
            for (let c = 1; c < 7; c++) {
                layouts[1].positions.push([r, c]);
            }
        }
        // 층 2
        for (let r = 2; r < 4; r++) {
            for (let c = 2; c < 6; c++) {
                layouts[2].positions.push([r, c]);
            }
        }

        // 짝수개의 타일 필요
        const allPositions: { layer: number; row: number; col: number }[] = [];
        layouts.forEach(({ layer, positions }) => {
            positions.forEach(([row, col]) => {
                allPositions.push({ layer, row, col });
            });
        });

        // 심볼 배열 생성 (각 심볼은 4개씩)
        const symbolPool: string[] = [];
        const neededPairs = Math.floor(allPositions.length / 2);
        for (let i = 0; i < neededPairs; i++) {
            const sym = symbols[i % symbols.length];
            symbolPool.push(sym, sym); // 2개씩 (매칭 쌍)
        }

        // 섞기
        symbolPool.sort(() => Math.random() - 0.5);

        allPositions.forEach((pos, idx) => {
            newTiles.push({
                id: id++,
                symbol: symbolPool[idx] || '🀄',
                layer: pos.layer,
                row: pos.row,
                col: pos.col,
                removed: false,
            });
        });

        return newTiles;
    }, []);

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        setTiles(createPyramidLayout());
        setSelectedTile(null);
        setScore(0);
        setMoves(0);
        setGameOver(false);
    };

    const isTileFree = useCallback((tile: Tile): boolean => {
        if (tile.removed) return false;

        const activeTiles = tiles.filter(t => !t.removed);

        // 위에 타일이 있으면 막힘
        const hasAbove = activeTiles.some(t =>
            t.layer > tile.layer &&
            Math.abs(t.row - tile.row) < 1 &&
            Math.abs(t.col - tile.col) < 1
        );
        if (hasAbove) return false;

        // 양옆이 모두 막혀있으면 막힘
        const hasLeft = activeTiles.some(t =>
            t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1
        );
        const hasRight = activeTiles.some(t =>
            t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1
        );

        return !(hasLeft && hasRight);
    }, [tiles]);

    const handleTileClick = (tile: Tile) => {
        if (tile.removed || !isTileFree(tile)) return;

        if (!selectedTile) {
            setSelectedTile(tile);
        } else if (selectedTile.id === tile.id) {
            setSelectedTile(null);
        } else if (selectedTile.symbol === tile.symbol) {
            // 매칭!
            const newTiles = tiles.map(t =>
                t.id === selectedTile.id || t.id === tile.id
                    ? { ...t, removed: true }
                    : t
            );
            setTiles(newTiles);
            setSelectedTile(null);
            setScore(score + 10);
            setMoves(moves + 1);

            // 승리 체크
            if (newTiles.every(t => t.removed)) {
                setGameOver(true);
            }
        } else {
            // 다른 타일 선택
            setSelectedTile(tile);
        }
    };

    const getHint = () => {
        const freeTiles = tiles.filter(t => !t.removed && isTileFree(t));
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (freeTiles[i].symbol === freeTiles[j].symbol) {
                    setSelectedTile(freeTiles[i]);
                    return;
                }
            }
        }
        alert('가능한 매칭이 없습니다!');
    };

    const remainingTiles = tiles.filter(t => !t.removed).length;

    // 층별로 그룹화하여 렌더링
    const renderLayer = (layer: number) => {
        const layerTiles = tiles.filter(t => t.layer === layer && !t.removed);

        return layerTiles.map(tile => {
            const isFree = isTileFree(tile);
            const isSelected = selectedTile?.id === tile.id;

            return (
                <div
                    key={tile.id}
                    onClick={() => handleTileClick(tile)}
                    className={`absolute w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center
                        text-3xl sm:text-4xl rounded cursor-pointer transition-all
                        ${isSelected ? 'ring-4 ring-yellow-400 z-50' : ''}
                        ${isFree ? 'bg-amber-50 hover:bg-amber-100 shadow-lg' : 'bg-gray-200 cursor-not-allowed opacity-70'}
                        border-2 border-amber-700`}
                    style={{
                        left: `${tile.col * 54 + tile.layer * 8}px`,
                        top: `${tile.row * 70 + tile.layer * 8}px`,
                        zIndex: tile.layer * 10 + tile.row,
                    }}
                >
                    {tile.symbol}
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4 overflow-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🀄 마작 솔리테어</h1>

            <div className="flex gap-4">
                <div className="bg-amber-100 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">남은 타일</div>
                    <div className="text-xl font-bold text-amber-600">{remainingTiles}</div>
                </div>
                <div className="bg-green-100 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">점수</div>
                    <div className="text-xl font-bold text-green-600">{score}</div>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-xl text-center">
                    <div className="text-xs text-slate-500">이동</div>
                    <div className="text-xl font-bold text-blue-600">{moves}</div>
                </div>
            </div>

            {gameOver && (
                <div className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold animate-bounce">
                    🎉 축하합니다! 모든 타일을 제거했습니다!
                </div>
            )}

            {/* 마작 보드 */}
            <div className="relative bg-green-800 p-8 rounded-xl shadow-2xl overflow-auto"
                style={{ minWidth: '450px', minHeight: '400px' }}>
                {[0, 1, 2].map(layer => renderLayer(layer))}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={getHint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                    💡 힌트
                </button>
                <button
                    onClick={initGame}
                    className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700"
                >
                    🔄 새 게임
                </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 같은 그림의 자유로운 타일 2개를 클릭하여 제거하세요.</p>
                <p>타일 위에 다른 타일이 없고, 좌우 중 한쪽이 열려있어야 선택 가능합니다.</p>
            </div>
        </div>
    );
};

export default MahjongSolitaireGame;
