import React, { useState, useEffect, useCallback } from 'react';

interface Card {
    id: number;
    suit: '♠' | '♥' | '♦' | '♣';
    value: string;
    numValue: number;
}

const WarCardGame: React.FC = () => {
    const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
    const [aiDeck, setAiDeck] = useState<Card[]>([]);
    const [playerCard, setPlayerCard] = useState<Card | null>(null);
    const [aiCard, setAiCard] = useState<Card | null>(null);
    const [warPile, setWarPile] = useState<Card[]>([]);
    const [message, setMessage] = useState('게임을 시작하세요');
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
    const [isWar, setIsWar] = useState(false);

    const createDeck = useCallback((): Card[] => {
        const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck: Card[] = [];
        let id = 0;

        for (const suit of suits) {
            for (let i = 0; i < values.length; i++) {
                deck.push({
                    id: id++,
                    suit,
                    value: values[i],
                    numValue: i + 2, // 2-14 (A = 14)
                });
            }
        }

        return deck.sort(() => Math.random() - 0.5);
    }, []);

    const initGame = useCallback(() => {
        const deck = createDeck();
        const half = Math.floor(deck.length / 2);
        setPlayerDeck(deck.slice(0, half));
        setAiDeck(deck.slice(half));
        setPlayerCard(null);
        setAiCard(null);
        setWarPile([]);
        setMessage('카드를 클릭하여 뒤집으세요!');
        setIsPlaying(true);
        setGameOver(false);
        setWinner(null);
        setIsWar(false);
    }, [createDeck]);

    const checkGameOver = useCallback((pDeck: Card[], aDeck: Card[]) => {
        if (pDeck.length === 0) {
            setGameOver(true);
            setWinner('ai');
            setMessage('😢 AI 승리! 카드를 모두 잃었습니다.');
            return true;
        }
        if (aDeck.length === 0) {
            setGameOver(true);
            setWinner('player');
            setMessage('🎉 승리! 모든 카드를 얻었습니다!');
            return true;
        }
        return false;
    }, []);

    const flipCard = () => {
        if (!isPlaying || gameOver || playerDeck.length === 0 || aiDeck.length === 0) return;

        const [pCard, ...pRest] = playerDeck;
        const [aCard, ...aRest] = aiDeck;

        setPlayerCard(pCard);
        setAiCard(aCard);
        setPlayerDeck(pRest);
        setAiDeck(aRest);

        // 승부 결정
        setTimeout(() => {
            resolveCards(pCard, aCard, pRest, aRest, [...warPile, pCard, aCard]);
        }, 1000);
    };

    const resolveCards = (pCard: Card, aCard: Card, pDeck: Card[], aDeck: Card[], pile: Card[]) => {
        if (pCard.numValue > aCard.numValue) {
            // 플레이어 승
            const wonCards = pile.sort(() => Math.random() - 0.5);
            setPlayerDeck([...pDeck, ...wonCards]);
            setMessage(`${pCard.value} > ${aCard.value} - ${pile.length}장 획득! 🎉`);
            setWarPile([]);
            setIsWar(false);
            checkGameOver([...pDeck, ...wonCards], aDeck);
        } else if (aCard.numValue > pCard.numValue) {
            // AI 승
            const wonCards = pile.sort(() => Math.random() - 0.5);
            setAiDeck([...aDeck, ...wonCards]);
            setMessage(`${pCard.value} < ${aCard.value} - AI가 ${pile.length}장 획득`);
            setWarPile([]);
            setIsWar(false);
            checkGameOver(pDeck, [...aDeck, ...wonCards]);
        } else {
            // WAR!
            setMessage('⚔️ WAR! 동점! 추가 카드를 놓습니다...');
            setIsWar(true);
            setWarPile(pile);

            // 전쟁용 카드 (덮어놓을 카드 3장 + 승부 카드 1장)
            if (pDeck.length < 4 || aDeck.length < 4) {
                // 카드 부족시 남은 카드로
                if (pDeck.length <= aDeck.length) {
                    setGameOver(true);
                    setWinner('ai');
                    setMessage('😢 전쟁에서 카드 부족! AI 승리');
                } else {
                    setGameOver(true);
                    setWinner('player');
                    setMessage('🎉 AI 카드 부족! 플레이어 승리');
                }
                return;
            }

            setTimeout(() => {
                const warCards = pDeck.slice(0, 3);
                const pWarCard = pDeck[3];
                const aiWarCards = aDeck.slice(0, 3);
                const aWarCard = aDeck[3];

                setPlayerDeck(pDeck.slice(4));
                setAiDeck(aDeck.slice(4));
                setPlayerCard(pWarCard);
                setAiCard(aWarCard);

                const newPile = [...pile, ...warCards, ...aiWarCards, pWarCard, aWarCard];

                setTimeout(() => {
                    resolveCards(pWarCard, aWarCard, pDeck.slice(4), aDeck.slice(4), newPile);
                }, 1000);
            }, 1500);
        }
    };

    const getCardColor = (suit: Card['suit']) =>
        suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-slate-800';

    const renderCard = (card: Card | null, label: string) => (
        <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-slate-500">{label}</div>
            <div
                className={`w-20 h-28 sm:w-24 sm:h-32 rounded-xl shadow-lg flex flex-col items-center justify-center
                    ${card ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-blue-800'} border-4 border-slate-300`}
            >
                {card ? (
                    <>
                        <span className={`text-2xl sm:text-3xl font-bold ${getCardColor(card.suit)}`}>
                            {card.value}
                        </span>
                        <span className={`text-3xl sm:text-4xl ${getCardColor(card.suit)}`}>
                            {card.suit}
                        </span>
                    </>
                ) : (
                    <span className="text-4xl">🃏</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">⚔️ 카드 전쟁 (War)</h1>

            <div className="flex gap-4">
                <div className="bg-blue-100 px-4 py-2 rounded-xl">
                    내 카드: <span className="font-bold">{playerDeck.length}</span>
                </div>
                <div className="bg-red-100 px-4 py-2 rounded-xl">
                    AI 카드: <span className="font-bold">{aiDeck.length}</span>
                </div>
                {warPile.length > 0 && (
                    <div className="bg-amber-100 px-4 py-2 rounded-xl">
                        전쟁판: <span className="font-bold">{warPile.length}</span>
                    </div>
                )}
            </div>

            <div className={`px-4 py-2 rounded-xl text-sm font-bold
                ${isWar ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {message}
            </div>

            {/* 카드 영역 */}
            <div className="flex gap-8 items-center">
                {renderCard(playerCard, '내 카드')}
                <div className="text-3xl font-bold text-slate-400">VS</div>
                {renderCard(aiCard, 'AI 카드')}
            </div>

            {/* 덱 */}
            <div
                onClick={flipCard}
                className={`w-24 h-32 rounded-xl shadow-lg flex items-center justify-center cursor-pointer
                    bg-gradient-to-br from-indigo-600 to-purple-700 border-4 border-indigo-400
                    hover:scale-105 transition-transform
                    ${gameOver ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="text-center text-white">
                    <div className="text-3xl">🃏</div>
                    <div className="text-xs mt-1">클릭!</div>
                </div>
            </div>

            <button
                onClick={initGame}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700"
            >
                {isPlaying ? '🔄 새 게임' : '▶️ 시작'}
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 덱을 클릭하여 카드를 뒤집으세요.</p>
                <p>높은 카드가 이기고, 동점이면 전쟁(WAR)!</p>
            </div>
        </div>
    );
};

export default WarCardGame;
