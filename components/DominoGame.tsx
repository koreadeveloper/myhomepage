import React, { useState, useCallback, useEffect } from 'react';

interface Domino {
    top: number;
    bottom: number;
    id: number;
}

const DominoGame: React.FC = () => {
    const [playerHand, setPlayerHand] = useState<Domino[]>([]);
    const [aiHand, setAiHand] = useState<Domino[]>([]);
    const [boneyard, setBoneyard] = useState<Domino[]>([]);
    const [chain, setChain] = useState<Domino[]>([]);
    const [leftEnd, setLeftEnd] = useState<number | null>(null);
    const [rightEnd, setRightEnd] = useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<'player' | 'ai'>('player');
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<'player' | 'ai' | 'draw' | null>(null);
    const [message, setMessage] = useState('');

    const createDominoes = useCallback((): Domino[] => {
        const pieces: Domino[] = [];
        let id = 0;
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                pieces.push({ top: i, bottom: j, id: id++ });
            }
        }
        return pieces.sort(() => Math.random() - 0.5);
    }, []);

    const initGame = useCallback(() => {
        const allDominoes = createDominoes();
        setPlayerHand(allDominoes.slice(0, 7));
        setAiHand(allDominoes.slice(7, 14));
        setBoneyard(allDominoes.slice(14));
        setChain([]);
        setLeftEnd(null);
        setRightEnd(null);
        setCurrentPlayer('player');
        setGameOver(false);
        setWinner(null);
        setMessage('도미노를 놓으세요');
    }, [createDominoes]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const canPlay = (domino: Domino, end: number | null): boolean => {
        if (end === null) return true;
        return domino.top === end || domino.bottom === end;
    };

    const getPlayableEnd = (domino: Domino): 'left' | 'right' | 'both' | null => {
        if (leftEnd === null) return 'both';
        const canLeft = canPlay(domino, leftEnd);
        const canRight = canPlay(domino, rightEnd);
        if (canLeft && canRight) return 'both';
        if (canLeft) return 'left';
        if (canRight) return 'right';
        return null;
    };

    const playDomino = (domino: Domino, side: 'left' | 'right', isPlayer: boolean) => {
        const targetEnd = side === 'left' ? leftEnd : rightEnd;
        let oriented = { ...domino };

        // 방향 맞추기
        if (targetEnd !== null) {
            if (side === 'left') {
                if (domino.bottom !== targetEnd) {
                    oriented = { ...domino, top: domino.bottom, bottom: domino.top };
                }
            } else {
                if (domino.top !== targetEnd) {
                    oriented = { ...domino, top: domino.bottom, bottom: domino.top };
                }
            }
        }

        // 체인에 추가
        const newChain = side === 'left'
            ? [oriented, ...chain]
            : [...chain, oriented];
        setChain(newChain);

        // 끝 업데이트
        if (side === 'left' || leftEnd === null) {
            setLeftEnd(oriented.top);
        }
        if (side === 'right' || rightEnd === null) {
            setRightEnd(oriented.bottom);
        }

        // 처음 도미노일 때 양쪽 끝 설정
        if (chain.length === 0) {
            setLeftEnd(oriented.top);
            setRightEnd(oriented.bottom);
        }

        // 손에서 제거
        if (isPlayer) {
            const newHand = playerHand.filter(d => d.id !== domino.id);
            setPlayerHand(newHand);
            if (newHand.length === 0) {
                setGameOver(true);
                setWinner('player');
                setMessage('🎉 승리!');
                return;
            }
            setCurrentPlayer('ai');
            setTimeout(() => aiTurn(newChain, oriented.top, oriented.bottom), 1000);
        } else {
            const newHand = aiHand.filter(d => d.id !== domino.id);
            setAiHand(newHand);
            if (newHand.length === 0) {
                setGameOver(true);
                setWinner('ai');
                setMessage('😢 AI 승리!');
                return;
            }
            setCurrentPlayer('player');
        }
    };

    const handleDominoClick = (domino: Domino) => {
        if (currentPlayer !== 'player' || gameOver) return;

        const playable = getPlayableEnd(domino);
        if (!playable) {
            setMessage('이 도미노는 놓을 수 없습니다!');
            return;
        }

        if (playable === 'left' || playable === 'both') {
            playDomino(domino, chain.length === 0 ? 'right' : 'left', true);
        } else {
            playDomino(domino, 'right', true);
        }
    };

    const drawFromBoneyard = () => {
        if (boneyard.length === 0) {
            // 패스
            setCurrentPlayer('ai');
            setTimeout(() => aiTurn(chain, leftEnd, rightEnd), 500);
            return;
        }

        const [drawn, ...rest] = boneyard;
        setBoneyard(rest);
        setPlayerHand([...playerHand, drawn]);
        setMessage('도미노를 뽑았습니다');
    };

    const aiTurn = (currentChain: Domino[], left: number | null, right: number | null) => {
        // AI 로직: 놓을 수 있는 도미노 찾기
        for (const domino of aiHand) {
            if (canPlay(domino, left)) {
                playDomino(domino, currentChain.length === 0 ? 'right' : 'left', false);
                return;
            }
            if (canPlay(domino, right)) {
                playDomino(domino, 'right', false);
                return;
            }
        }

        // 뽑기
        if (boneyard.length > 0) {
            const [drawn, ...rest] = boneyard;
            setBoneyard(rest);
            setAiHand([...aiHand, drawn]);
            setTimeout(() => aiTurn(currentChain, left, right), 500);
        } else {
            setCurrentPlayer('player');
        }
    };

    const hasValidMove = () => {
        return playerHand.some(d => getPlayableEnd(d) !== null);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🀱 도미노</h1>

            <div className="flex gap-4">
                <div className={`px-4 py-2 rounded-xl ${currentPlayer === 'player' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                    플레이어: {playerHand.length}
                </div>
                <div className={`px-4 py-2 rounded-xl ${currentPlayer === 'ai' ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>
                    AI: {aiHand.length}
                </div>
                <div className="px-4 py-2 rounded-xl bg-amber-100">
                    뽑을 패: {boneyard.length}
                </div>
            </div>

            {message && (
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm">
                    {message}
                </div>
            )}

            {/* 체인 (테이블) */}
            <div className="bg-green-800 p-4 rounded-xl min-h-24 w-full max-w-lg overflow-x-auto">
                <div className="flex gap-1 items-center justify-center min-w-max">
                    {chain.length === 0 ? (
                        <span className="text-green-500 text-sm">도미노를 놓으세요</span>
                    ) : (
                        chain.map((d, idx) => (
                            <div key={d.id} className="bg-white rounded px-1 py-2 shadow text-center font-bold text-sm">
                                <div>{d.top}</div>
                                <div className="border-t border-slate-300 my-0.5"></div>
                                <div>{d.bottom}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 플레이어 손패 */}
            <div className="flex flex-wrap gap-2 justify-center">
                {playerHand.map(domino => {
                    const playable = getPlayableEnd(domino);
                    return (
                        <div
                            key={domino.id}
                            onClick={() => handleDominoClick(domino)}
                            className={`bg-white rounded-lg w-16 h-28 flex flex-col items-center justify-center shadow-lg font-bold cursor-pointer transition-all
                                ${playable ? 'hover:ring-4 hover:ring-green-500 hover:scale-105' : 'opacity-60'}`}
                        >
                            <div className="text-3xl">{domino.top}</div>
                            <div className="border-t-4 border-slate-400 my-1 w-10 mx-auto"></div>
                            <div className="text-3xl">{domino.bottom}</div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                {!hasValidMove() && boneyard.length > 0 && currentPlayer === 'player' && !gameOver && (
                    <button
                        onClick={drawFromBoneyard}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
                    >
                        🃏 뽑기
                    </button>
                )}
                <button onClick={initGame} className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700">
                    🔄 새 게임
                </button>
            </div>
        </div>
    );
};

export default DominoGame;
