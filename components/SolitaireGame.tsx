import React, { useState, useCallback, useEffect } from 'react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    suit: Suit;
    value: CardValue;
    faceUp: boolean;
}

const SolitaireGame: React.FC = () => {
    const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
    const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
    const [stock, setStock] = useState<Card[]>([]);
    const [waste, setWaste] = useState<Card[]>([]);
    const [selectedCards, setSelectedCards] = useState<{ cards: Card[], from: string, fromIndex: number } | null>(null);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const createDeck = (): Card[] => {
        const deck: Card[] = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value, faceUp: false });
            }
        }
        return deck;
    };

    const shuffleDeck = (deck: Card[]): Card[] => {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const dealCards = useCallback(() => {
        const deck = shuffleDeck(createDeck());
        const newTableau: Card[][] = [[], [], [], [], [], [], []];
        let cardIndex = 0;

        // 태블로 배치 (1, 2, 3, 4, 5, 6, 7장씩)
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = { ...deck[cardIndex], faceUp: row === col };
                newTableau[col].push(card);
                cardIndex++;
            }
        }

        const remainingCards = deck.slice(cardIndex);
        setTableau(newTableau);
        setFoundation([[], [], [], []]);
        setStock(remainingCards);
        setWaste([]);
        setSelectedCards(null);
        setMoves(0);
        setGameWon(false);
    }, []);

    useEffect(() => {
        dealCards();
    }, [dealCards]);

    // 카드 값 숫자로 변환
    const getValueNumber = (value: CardValue): number => {
        if (value === 'A') return 1;
        if (value === 'J') return 11;
        if (value === 'Q') return 12;
        if (value === 'K') return 13;
        return parseInt(value);
    };

    // 색상 확인
    const isRed = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

    // 태블로 이동 가능 체크
    const canMoveToTableau = (card: Card, targetPile: Card[]): boolean => {
        if (targetPile.length === 0) {
            return card.value === 'K';
        }
        const topCard = targetPile[targetPile.length - 1];
        return isRed(card.suit) !== isRed(topCard.suit) &&
            getValueNumber(card.value) === getValueNumber(topCard.value) - 1;
    };

    // 기초 이동 가능 체크
    const canMoveToFoundation = (card: Card, targetPile: Card[]): boolean => {
        if (targetPile.length === 0) {
            return card.value === 'A';
        }
        const topCard = targetPile[targetPile.length - 1];
        return card.suit === topCard.suit &&
            getValueNumber(card.value) === getValueNumber(topCard.value) + 1;
    };

    // 스톡에서 카드 뒤집기
    const drawFromStock = () => {
        if (stock.length === 0) {
            // waste를 다시 stock으로
            setStock(waste.map(c => ({ ...c, faceUp: false })).reverse());
            setWaste([]);
        } else {
            const card = { ...stock[stock.length - 1], faceUp: true };
            setStock(stock.slice(0, -1));
            setWaste([...waste, card]);
        }
        setMoves(m => m + 1);
    };

    // 카드 선택
    const selectCard = (cards: Card[], from: string, fromIndex: number) => {
        if (selectedCards) {
            // 이미 선택된 카드가 있으면 이동 시도
            tryMoveCards(from, fromIndex);
        } else {
            setSelectedCards({ cards, from, fromIndex });
        }
    };

    // 카드 이동 시도
    const tryMoveCards = (to: string, toIndex: number) => {
        if (!selectedCards) return;

        const { cards, from, fromIndex } = selectedCards;
        let moved = false;

        if (to.startsWith('tableau-')) {
            const targetCol = parseInt(to.split('-')[1]);
            if (canMoveToTableau(cards[0], tableau[targetCol])) {
                moveToTableau(cards, from, fromIndex, targetCol);
                moved = true;
            }
        } else if (to.startsWith('foundation-') && cards.length === 1) {
            const targetPile = parseInt(to.split('-')[1]);
            if (canMoveToFoundation(cards[0], foundation[targetPile])) {
                moveToFoundation(cards[0], from, fromIndex, targetPile);
                moved = true;
            }
        }

        if (moved) {
            setMoves(m => m + 1);
        }
        setSelectedCards(null);
    };

    // 태블로로 이동
    const moveToTableau = (cards: Card[], from: string, fromIndex: number, toCol: number) => {
        const newTableau = tableau.map(col => [...col]);

        // 원래 위치에서 제거
        if (from === 'waste') {
            setWaste(waste.slice(0, -1));
        } else if (from.startsWith('tableau-')) {
            const fromCol = parseInt(from.split('-')[1]);
            newTableau[fromCol] = newTableau[fromCol].slice(0, fromIndex);
            // 맨 위 카드 뒤집기
            if (newTableau[fromCol].length > 0 && !newTableau[fromCol][newTableau[fromCol].length - 1].faceUp) {
                newTableau[fromCol][newTableau[fromCol].length - 1].faceUp = true;
            }
        } else if (from.startsWith('foundation-')) {
            const fromPile = parseInt(from.split('-')[1]);
            const newFoundation = foundation.map(pile => [...pile]);
            newFoundation[fromPile] = newFoundation[fromPile].slice(0, -1);
            setFoundation(newFoundation);
        }

        // 목적지에 추가
        newTableau[toCol] = [...newTableau[toCol], ...cards];
        setTableau(newTableau);
    };

    // 기초로 이동
    const moveToFoundation = (card: Card, from: string, fromIndex: number, toPile: number) => {
        const newFoundation = foundation.map(pile => [...pile]);
        newFoundation[toPile] = [...newFoundation[toPile], card];
        setFoundation(newFoundation);

        // 원래 위치에서 제거
        if (from === 'waste') {
            setWaste(waste.slice(0, -1));
        } else if (from.startsWith('tableau-')) {
            const fromCol = parseInt(from.split('-')[1]);
            const newTableau = tableau.map(col => [...col]);
            newTableau[fromCol] = newTableau[fromCol].slice(0, -1);
            if (newTableau[fromCol].length > 0 && !newTableau[fromCol][newTableau[fromCol].length - 1].faceUp) {
                newTableau[fromCol][newTableau[fromCol].length - 1].faceUp = true;
            }
            setTableau(newTableau);
        }
    };

    // 승리 체크 — foundation 변경 후 실행되므로 stale state 문제 없음
    useEffect(() => {
        if (foundation.reduce((sum, pile) => sum + pile.length, 0) === 52) {
            setGameWon(true);
        }
    }, [foundation]);

    // 더블클릭: 가능하면 기초로 자동 이동
    const autoMoveToFoundation = (card: Card, from: string, fromIndex: number) => {
        for (let i = 0; i < 4; i++) {
            if (canMoveToFoundation(card, foundation[i])) {
                moveToFoundation(card, from, fromIndex, i);
                setMoves(m => m + 1);
                setSelectedCards(null);
                return;
            }
        }
    };

    // 카드 렌더링
    const renderCard = (card: Card, onClick?: () => void, isSelected?: boolean) => {
        const suitSymbol = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        const red = isRed(card.suit);

        if (!card.faceUp) {
            return (
                <div className="w-14 h-20 sm:w-16 sm:h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-md flex items-center justify-center">
                    <span className="text-2xl">🃏</span>
                </div>
            );
        }

        return (
            <div
                onClick={onClick}
                className={`w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-lg border-2 shadow-md flex flex-col items-center justify-between p-1 cursor-pointer transition-all
                    ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : 'border-slate-300 hover:border-blue-400'}
                    ${red ? 'text-red-600' : 'text-slate-800'}`}
            >
                <div className="text-xs sm:text-sm font-bold self-start">{card.value}</div>
                <div className="text-lg sm:text-xl">{suitSymbol[card.suit]}</div>
                <div className="text-xs sm:text-sm font-bold self-end rotate-180">{card.value}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center w-full h-full p-2 sm:p-4 overflow-y-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">🃏 솔리테어</h1>

            {/* 상태 바 */}
            <div className="flex gap-4 mb-4">
                <div className="text-sm text-slate-600 dark:text-slate-300">이동: {moves}</div>
                <button
                    onClick={dealCards}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                >
                    새 게임
                </button>
            </div>

            {gameWon && (
                <div className="mb-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-xl animate-bounce">
                    🎉 축하합니다! 승리!
                </div>
            )}

            {/* 상단: 스톡, 웨이스트, 기초 */}
            <div className="flex gap-2 mb-4 w-full max-w-2xl justify-between">
                {/* 스톡 */}
                <div className="flex gap-2">
                    <div
                        onClick={drawFromStock}
                        className="w-12 h-16 sm:w-14 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        {stock.length > 0 ? (
                            <div className="w-14 h-20 sm:w-16 sm:h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-md flex items-center justify-center">
                                <span className="text-xs text-white font-bold">{stock.length}</span>
                            </div>
                        ) : (
                            <span className="text-2xl text-slate-400">↻</span>
                        )}
                    </div>

                    {/* 웨이스트 */}
                    <div
                        onClick={() => waste.length > 0 && selectCard([waste[waste.length - 1]], 'waste', waste.length - 1)}
                        className="w-12 h-16 sm:w-14 sm:h-20"
                    >
                        {waste.length > 0 && renderCard(
                            waste[waste.length - 1],
                            () => selectCard([waste[waste.length - 1]], 'waste', waste.length - 1),
                            selectedCards?.from === 'waste'
                        )}
                    </div>
                </div>

                {/* 기초 */}
                <div className="flex gap-1 sm:gap-2">
                    {foundation.map((pile, i) => (
                        <div
                            key={i}
                            onClick={() => tryMoveCards(`foundation-${i}`, 0)}
                            className="w-12 h-16 sm:w-14 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-dashed border-green-400 flex items-center justify-center"
                        >
                            {pile.length > 0 ? (
                                renderCard(pile[pile.length - 1])
                            ) : (
                                <span className="text-lg text-green-400">
                                    {['♥', '♦', '♣', '♠'][i]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 태블로 */}
            <div className="flex gap-1 sm:gap-2 w-full max-w-2xl justify-center">
                {tableau.map((column, colIndex) => (
                    <div
                        key={colIndex}
                        onClick={() => column.length === 0 && tryMoveCards(`tableau-${colIndex}`, 0)}
                        className="flex flex-col min-h-[200px]"
                    >
                        {column.length === 0 ? (
                            <div className="w-12 h-16 sm:w-14 sm:h-20 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-400" />
                        ) : (
                            column.map((card, cardIndex) => (
                                <div
                                    key={cardIndex}
                                    style={{ marginTop: cardIndex === 0 ? 0 : '-48px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (card.faceUp) {
                                            const cardsToMove = column.slice(cardIndex);
                                            selectCard(cardsToMove, `tableau-${colIndex}`, cardIndex);
                                        }
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        // 맨 위 카드만 기초로 이동 가능
                                        if (card.faceUp && cardIndex === column.length - 1 && !selectedCards) {
                                            autoMoveToFoundation(card, `tableau-${colIndex}`, cardIndex);
                                        }
                                    }}
                                >
                                    {renderCard(
                                        card,
                                        undefined,
                                        selectedCards?.from === `tableau-${colIndex}` && selectedCards?.fromIndex === cardIndex
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 카드를 클릭하여 선택하고, 목적지를 클릭하여 이동하세요.</p>
                <p>맨 위 카드를 더블클릭하면 기초로 자동 이동합니다.</p>
            </div>
        </div>
    );
};

export default SolitaireGame;
