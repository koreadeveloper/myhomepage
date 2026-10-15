import React, { useState, useEffect, useCallback } from 'react';

interface Card {
    suit: '♠' | '♥' | '♦' | '♣';
    value: string;
    numValue: number;
    id: number;
}

const SpeedCardGame: React.FC = () => {
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [aiDeck, setAiDeck] = useState<Card[]>([]);
    const [centerPiles, setCenterPiles] = useState<[Card | null, Card | null]>([null, null]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
    const [message, setMessage] = useState('게임을 시작하세요');

    const createDeck = useCallback((): Card[] => {
        const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck: Card[] = [];
        let id = 0;

        for (const suit of suits) {
            for (let i = 0; i < values.length; i++) {
                deck.push({
                    suit,
                    value: values[i],
                    numValue: i + 1,
                    id: id++
                });
            }
        }

        return deck.sort(() => Math.random() - 0.5);
    }, []);

    const initGame = useCallback(() => {
        const deck = createDeck();
        const half = Math.floor(deck.length / 2);

        setPlayerDeck(deck.slice(0, half - 4));
        setAiDeck(deck.slice(half, deck.length - 4));
        setPlayerHand(deck.slice(half - 4, half));
        setCenterPiles([deck[deck.length - 2], deck[deck.length - 1]]);
        setGameStarted(true);
        setWinner(null);
        setMessage('카드를 중앙에 놓으세요!');
    }, [createDeck]);

    const canPlay = (card: Card, centerCard: Card | null): boolean => {
        if (!centerCard) return true;
        const diff = Math.abs(card.numValue - centerCard.numValue);
        // A와 K는 연결 (1과 13)
        return diff === 1 || diff === 12;
    };

    const playCard = (cardIndex: number, pileIndex: number) => {
        if (!gameStarted || winner) return;

        const card = playerHand[cardIndex];
        if (!canPlay(card, centerPiles[pileIndex])) {
            setMessage('이 카드는 놓을 수 없습니다!');
            return;
        }

        // 카드 놓기
        const newPiles: [Card | null, Card | null] = [centerPiles[0], centerPiles[1]];
        newPiles[pileIndex] = card;
        setCenterPiles(newPiles);

        // 손에서 제거하고 덱에서 보충
        const newHand = [...playerHand];
        newHand.splice(cardIndex, 1);

        if (playerDeck.length > 0) {
            const [drawn, ...rest] = playerDeck;
            newHand.push(drawn);
            setPlayerDeck(rest);
        }

        setPlayerHand(newHand);
        setMessage('좋아요! 👍');

        // 승리 체크
        if (newHand.length === 0 && playerDeck.length === 0) {
            setWinner('player');
            setMessage('🎉 승리!');
            return;
        }
    };

    // AI 턴
    useEffect(() => {
        if (!gameStarted || winner) return;

        const aiInterval = setInterval(() => {
            // AI가 놓을 수 있는 카드 찾기
            for (let pileIdx = 0; pileIdx < 2; pileIdx++) {
                // AI 덱에서 카드 확인
                if (aiDeck.length > 0) {
                    const topCard = aiDeck[0];
                    if (canPlay(topCard, centerPiles[pileIdx])) {
                        const newPiles: [Card | null, Card | null] = [centerPiles[0], centerPiles[1]];
                        newPiles[pileIdx] = topCard;
                        setCenterPiles(newPiles);
                        setAiDeck(aiDeck.slice(1));

                        if (aiDeck.length === 1) {
                            setWinner('ai');
                            setMessage('😢 AI 승리!');
                        }
                        return;
                    }
                }
            }
        }, 1500);

        return () => clearInterval(aiInterval);
    }, [gameStarted, winner, aiDeck, centerPiles]);

    // 막힘 체크
    const isStuck = () => {
        if (!gameStarted || winner) return false;

        const playerCanPlay = playerHand.some(card =>
            canPlay(card, centerPiles[0]) || canPlay(card, centerPiles[1])
        );

        const aiCanPlay = aiDeck.length > 0 && (
            canPlay(aiDeck[0], centerPiles[0]) || canPlay(aiDeck[0], centerPiles[1])
        );

        return !playerCanPlay && !aiCanPlay;
    };

    const flipNewCards = () => {
        if (playerDeck.length > 0 && aiDeck.length > 0) {
            const [pCard, ...pRest] = playerDeck;
            const [aCard, ...aRest] = aiDeck;
            setCenterPiles([pCard, aCard]);
            setPlayerDeck(pRest);
            setAiDeck(aRest);
            setMessage('새 카드가 놓였습니다!');
        }
    };

    const getCardColor = (suit: Card['suit']) =>
        suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-slate-800';

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">⚡ 스피드 카드</h1>

            <div className="flex gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-xl">
                    내 덱: {playerDeck.length + playerHand.length}
                </div>
                <div className="bg-red-100 dark:bg-red-900 px-4 py-2 rounded-xl">
                    AI 덱: {aiDeck.length}
                </div>
            </div>

            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold">
                {message}
            </div>

            {/* 중앙 카드 */}
            <div className="flex gap-8">
                {centerPiles.map((card, idx) => (
                    <div
                        key={idx}
                        className="w-24 h-36 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center
                            border-4 border-slate-300"
                    >
                        {card ? (
                            <>
                                <span className={`text-3xl font-bold ${getCardColor(card.suit)}`}>
                                    {card.value}
                                </span>
                                <span className={`text-4xl ${getCardColor(card.suit)}`}>
                                    {card.suit}
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-300 text-3xl">?</span>
                        )}
                    </div>
                ))}
            </div>

            {/* 플레이어 손패 */}
            <div className="flex gap-2 flex-wrap justify-center">
                {playerHand.map((card, idx) => {
                    const canPlayLeft = canPlay(card, centerPiles[0]);
                    const canPlayRight = canPlay(card, centerPiles[1]);
                    const playable = canPlayLeft || canPlayRight;

                    return (
                        <div key={card.id} className="flex flex-col gap-1">
                            <div
                                className={`w-16 h-24 bg-white rounded-lg shadow flex flex-col items-center justify-center
                                    cursor-pointer transition-all
                                    ${playable ? 'hover:scale-110 ring-2 ring-green-400' : 'opacity-70'}`}
                            >
                                <span className={`text-xl font-bold ${getCardColor(card.suit)}`}>
                                    {card.value}
                                </span>
                                <span className={`text-2xl ${getCardColor(card.suit)}`}>
                                    {card.suit}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => playCard(idx, 0)}
                                    disabled={!canPlayLeft}
                                    className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded disabled:opacity-30"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => playCard(idx, 1)}
                                    disabled={!canPlayRight}
                                    className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded disabled:opacity-30"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                {isStuck() && (
                    <button
                        onClick={flipNewCards}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700"
                    >
                        🔄 카드 뒤집기
                    </button>
                )}
                <button
                    onClick={initGame}
                    className="px-4 py-2 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700"
                >
                    {gameStarted ? '🔄 새 게임' : '▶️ 시작'}
                </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 중앙 카드와 1 차이나는 카드를 빨리 놓으세요!</p>
                <p>A-K도 연결됩니다.</p>
            </div>
        </div>
    );
};

export default SpeedCardGame;
