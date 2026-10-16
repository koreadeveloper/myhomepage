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

    const canPlayOnEnds = (domino: Domino, left: number | null, right: number | null) =>
        left === null || domino.top === left || domino.bottom === left || domino.top === right || domino.bottom === right;

    // 양쪽 다 못 놓고 본야드도 비면 게임 종료 — 남은 패 숫자 합이 적은 쪽이 승리
    const checkBlockedGame = (pHand: Domino[], aHand: Domino[], left: number | null, right: number | null, yard: Domino[]) => {
        if (yard.length > 0) return false;
        const pCan = pHand.some(d => canPlayOnEnds(d, left, right));
        const aCan = aHand.some(d => canPlayOnEnds(d, left, right));
        if (pCan || aCan) return false;

        const pPips = pHand.reduce((s, d) => s + d.top + d.bottom, 0);
        const aPips = aHand.reduce((s, d) => s + d.top + d.bottom, 0);
        setGameOver(true);
        if (pPips < aPips) {
            setWinner('player');
            setMessage(`🎉 승리! (남은 패 ${pPips} vs ${aPips})`);
        } else if (aPips < pPips) {
            setWinner('ai');
            setMessage(`😢 AI 승리! (남은 패 ${aPips} vs ${pPips})`);
        } else {
            setWinner('draw');
            setMessage('무승부!');
        }
        return true;
    };

    const playDomino = (domino: Domino, side: 'left' | 'right', isPlayer: boolean, state?: { chain: Domino[], left: number | null, right: number | null, aiHand: Domino[], playerHand: Domino[], boneyard: Domino[] }) => {
        const curChain = state?.chain ?? chain;
        const curLeft = state?.left ?? leftEnd;
        const curRight = state?.right ?? rightEnd;
        const curAiHand = state?.aiHand ?? aiHand;
        const curPlayerHand = state?.playerHand ?? playerHand;
        const curBoneyard = state?.boneyard ?? boneyard;
        const targetEnd = side === 'left' ? curLeft : curRight;
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
            ? [oriented, ...curChain]
            : [...curChain, oriented];
        const newLeft = curChain.length === 0 || side === 'left' ? oriented.top : curLeft;
        const newRight = curChain.length === 0 || side === 'right' ? oriented.bottom : curRight;
        setChain(newChain);
        setLeftEnd(newLeft);
        setRightEnd(newRight);

        const nextState = { chain: newChain, left: newLeft, right: newRight, aiHand: curAiHand, playerHand: curPlayerHand, boneyard: curBoneyard };

        // 손에서 제거
        if (isPlayer) {
            const newHand = curPlayerHand.filter(d => d.id !== domino.id);
            setPlayerHand(newHand);
            nextState.playerHand = newHand;
            if (newHand.length === 0) {
                setGameOver(true);
                setWinner('player');
                setMessage('🎉 승리!');
                return;
            }
            if (checkBlockedGame(newHand, curAiHand, newLeft, newRight, curBoneyard)) return;
            setCurrentPlayer('ai');
            setTimeout(() => aiTurn(nextState), 1000);
        } else {
            const newHand = curAiHand.filter(d => d.id !== domino.id);
            setAiHand(newHand);
            nextState.aiHand = newHand;
            if (newHand.length === 0) {
                setGameOver(true);
                setWinner('ai');
                setMessage('😢 AI 승리!');
                return;
            }
            if (checkBlockedGame(curPlayerHand, newHand, newLeft, newRight, curBoneyard)) return;
            setCurrentPlayer('player');
            setMessage('도미노를 놓으세요');
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
        const [drawn, ...rest] = boneyard;
        const newHand = [...playerHand, drawn];
        setBoneyard(rest);
        setPlayerHand(newHand);
        setMessage('도미노를 뽑았습니다');
    };

    const passTurn = () => {
        // 뽑을 패 없고 놓을 수도 없으면 패스
        setCurrentPlayer('ai');
        setMessage('패스... AI 턴');
        setTimeout(() => aiTurn({ chain, left: leftEnd, right: rightEnd, aiHand, playerHand, boneyard }), 700);
    };

    // AI 턴 — state를 파라미터로 받아 stale closure 방지
    const aiTurn = (state: { chain: Domino[], left: number | null, right: number | null, aiHand: Domino[], playerHand: Domino[], boneyard: Domino[] }) => {
        // 놓을 수 있는 도미노 찾기
        for (const domino of state.aiHand) {
            if (canPlay(domino, state.left)) {
                playDomino(domino, state.chain.length === 0 ? 'right' : 'left', false, state);
                return;
            }
            if (canPlay(domino, state.right)) {
                playDomino(domino, 'right', false, state);
                return;
            }
        }

        // 못 놓으면 뽑기 (뽑은 패 포함 최신 hand로 재귀)
        if (state.boneyard.length > 0) {
            const [drawn, ...rest] = state.boneyard;
            const newHand = [...state.aiHand, drawn];
            const newYard = rest;
            setBoneyard(newYard);
            setAiHand(newHand);
            setTimeout(() => aiTurn({ ...state, aiHand: newHand, boneyard: newYard }), 500);
        } else {
            // AI 패스 — 양쪽 막힘 체크
            if (!checkBlockedGame(state.playerHand, state.aiHand, state.left, state.right, [])) {
                setCurrentPlayer('player');
                setMessage('AI 패스! 당신 턴');
            }
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
                {currentPlayer === 'player' && !gameOver && !hasValidMove() && (
                    boneyard.length > 0 ? (
                        <button
                            onClick={drawFromBoneyard}
                            className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
                        >
                            🃏 뽑기
                        </button>
                    ) : (
                        <button
                            onClick={passTurn}
                            className="px-4 py-2 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600"
                        >
                            ⏭️ 패스
                        </button>
                    )
                )}
                <button onClick={initGame} className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700">
                    🔄 새 게임
                </button>
            </div>
        </div>
    );
};

export default DominoGame;
