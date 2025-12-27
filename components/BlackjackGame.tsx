import React, { useState, useCallback } from 'react';

// 블랙잭 게임
const BlackjackGame = () => {
    type Card = { suit: string; value: string; numValue: number };

    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'result'>('betting');
    const [result, setResult] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null);
    const [chips, setChips] = useState(1000);
    const [bet, setBet] = useState(100);
    const [showDealerCard, setShowDealerCard] = useState(false);

    const createDeck = useCallback(() => {
        const newDeck: Card[] = [];
        for (const suit of suits) {
            for (let i = 0; i < values.length; i++) {
                const value = values[i];
                let numValue = i + 1;
                if (i >= 10) numValue = 10;
                if (i === 0) numValue = 11; // Ace
                newDeck.push({ suit, value, numValue });
            }
        }
        // Shuffle
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }, []);

    const calculateScore = (hand: Card[]) => {
        let score = 0;
        let aces = 0;
        for (const card of hand) {
            score += card.numValue;
            if (card.value === 'A') aces++;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    };

    const startGame = useCallback(() => {
        if (bet > chips) return;

        const newDeck = createDeck();
        const pHand = [newDeck.pop()!, newDeck.pop()!];
        const dHand = [newDeck.pop()!, newDeck.pop()!];

        setDeck(newDeck);
        setPlayerHand(pHand);
        setDealerHand(dHand);
        setPlayerScore(calculateScore(pHand));
        setDealerScore(calculateScore([dHand[0]]));
        setGameState('playing');
        setResult(null);
        setShowDealerCard(false);

        // Check for blackjack
        if (calculateScore(pHand) === 21) {
            setShowDealerCard(true);
            if (calculateScore(dHand) === 21) {
                setResult('push');
            } else {
                setResult('blackjack');
                setChips(c => c + Math.floor(bet * 1.5));
            }
            setGameState('result');
        }
    }, [bet, chips, createDeck]);

    const hit = useCallback(() => {
        if (gameState !== 'playing') return;

        const newDeck = [...deck];
        const newCard = newDeck.pop()!;
        const newHand = [...playerHand, newCard];
        const newScore = calculateScore(newHand);

        setDeck(newDeck);
        setPlayerHand(newHand);
        setPlayerScore(newScore);

        if (newScore > 21) {
            setShowDealerCard(true);
            setDealerScore(calculateScore(dealerHand));
            setResult('lose');
            setChips(c => c - bet);
            setGameState('result');
        }
    }, [gameState, deck, playerHand, dealerHand, bet]);

    const stand = useCallback(() => {
        if (gameState !== 'playing') return;

        setShowDealerCard(true);
        setGameState('dealerTurn');

        let currentDeck = [...deck];
        let currentDealerHand = [...dealerHand];
        let currentDealerScore = calculateScore(currentDealerHand);

        // Dealer draws until 17 or higher
        const dealerPlay = () => {
            if (currentDealerScore < 17 && currentDeck.length > 0) {
                const newCard = currentDeck.pop()!;
                currentDealerHand = [...currentDealerHand, newCard];
                currentDealerScore = calculateScore(currentDealerHand);
                setDeck([...currentDeck]);
                setDealerHand([...currentDealerHand]);
                setDealerScore(currentDealerScore);
                setTimeout(dealerPlay, 500);
            } else {
                // Determine winner
                const pScore = calculateScore(playerHand);
                if (currentDealerScore > 21) {
                    setResult('win');
                    setChips(c => c + bet);
                } else if (currentDealerScore > pScore) {
                    setResult('lose');
                    setChips(c => c - bet);
                } else if (currentDealerScore < pScore) {
                    setResult('win');
                    setChips(c => c + bet);
                } else {
                    setResult('push');
                }
                setGameState('result');
            }
        };

        setTimeout(dealerPlay, 500);
    }, [gameState, deck, dealerHand, playerHand, bet]);

    const renderCard = (card: Card, hidden = false) => (
        <div className={`w-16 h-24 lg:w-20 lg:h-28 rounded-lg shadow-lg flex items-center justify-center text-2xl lg:text-3xl font-bold
            ${hidden ? 'bg-blue-600' : 'bg-white'}
            ${!hidden && (card.suit === '♥' || card.suit === '♦') ? 'text-red-500' : 'text-slate-800'}
        `}>
            {hidden ? '?' : `${card.value}${card.suit}`}
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-xl font-bold text-yellow-500">💰 칩: {chips}</div>

            {/* Dealer's hand */}
            <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">딜러 {showDealerCard ? `(${dealerScore})` : ''}</div>
                <div className="flex gap-2 justify-center">
                    {dealerHand.map((card, i) => (
                        <React.Fragment key={i}>{renderCard(card, !showDealerCard && i === 1)}</React.Fragment>
                    ))}
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`text-2xl font-bold 
                    ${result === 'blackjack' ? 'text-yellow-500' : ''}
                    ${result === 'win' ? 'text-green-500' : ''}
                    ${result === 'lose' ? 'text-red-500' : ''}
                    ${result === 'push' ? 'text-slate-500' : ''}
                `}>
                    {result === 'blackjack' && '🎰 블랙잭! +' + Math.floor(bet * 1.5)}
                    {result === 'win' && '🎉 승리! +' + bet}
                    {result === 'lose' && '😢 패배 -' + bet}
                    {result === 'push' && '🤝 무승부'}
                </div>
            )}

            {/* Player's hand */}
            <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">플레이어 ({playerScore})</div>
                <div className="flex gap-2 justify-center">
                    {playerHand.map((card, i) => (
                        <React.Fragment key={i}>{renderCard(card, false)}</React.Fragment>
                    ))}
                </div>
            </div>

            {/* Controls */}
            {gameState === 'betting' && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setBet(b => Math.max(10, b - 50))} className="px-4 py-2 bg-slate-600 text-white rounded-lg">-50</button>
                        <span className="text-xl font-bold text-slate-800 dark:text-white">베팅: {bet}</span>
                        <button onClick={() => setBet(b => Math.min(chips, b + 50))} className="px-4 py-2 bg-slate-600 text-white rounded-lg">+50</button>
                    </div>
                    <button onClick={startGame} disabled={bet > chips || chips <= 0} className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 disabled:bg-slate-400">
                        {chips <= 0 ? '게임 오버' : '게임 시작'}
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="flex gap-4">
                    <button onClick={hit} className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400">
                        힛 (카드 받기)
                    </button>
                    <button onClick={stand} className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400">
                        스탠드 (멈추기)
                    </button>
                </div>
            )}

            {gameState === 'dealerTurn' && (
                <div className="text-lg text-slate-500 dark:text-slate-400">딜러 차례...</div>
            )}

            {gameState === 'result' && (
                <button onClick={() => setGameState('betting')} className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400">
                    다음 게임
                </button>
            )}
        </div>
    );
};

export default BlackjackGame;
