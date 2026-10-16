import React, { useState, useCallback, useEffect } from 'react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    suit: Suit;
    value: CardValue;
}

const FreecellGame: React.FC = () => {
    const [cascade, setCascade] = useState<Card[][]>([[], [], [], [], [], [], [], []]);
    const [freeCell, setFreeCell] = useState<(Card | null)[]>([null, null, null, null]);
    const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
    const [selectedCard, setSelectedCard] = useState<{ cards: Card[], from: string, fromIndex: number } | null>(null);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const createDeck = (): Card[] => {
        const deck: Card[] = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
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
        const newCascade: Card[][] = [[], [], [], [], [], [], [], []];

        // 8개 열에 카드 배분 (앞 4열은 7장, 뒤 4열은 6장)
        deck.forEach((card, index) => {
            newCascade[index % 8].push(card);
        });

        setCascade(newCascade);
        setFreeCell([null, null, null, null]);
        setFoundation([[], [], [], []]);
        setSelectedCard(null);
        setMoves(0);
        setGameWon(false);
    }, []);

    useEffect(() => {
        dealCards();
    }, [dealCards]);

    const getValueNumber = (value: CardValue): number => {
        if (value === 'A') return 1;
        if (value === 'J') return 11;
        if (value === 'Q') return 12;
        if (value === 'K') return 13;
        return parseInt(value);
    };

    const isRed = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

    // 캐스케이드로 이동 가능 체크
    const canMoveToCascade = (card: Card, targetPile: Card[]): boolean => {
        if (targetPile.length === 0) return true; // 빈 열에는 아무 카드나 가능
        const topCard = targetPile[targetPile.length - 1];
        return isRed(card.suit) !== isRed(topCard.suit) &&
            getValueNumber(card.value) === getValueNumber(topCard.value) - 1;
    };

    // 기초로 이동 가능 체크
    const canMoveToFoundation = (card: Card, targetPile: Card[]): boolean => {
        if (targetPile.length === 0) return card.value === 'A';
        const topCard = targetPile[targetPile.length - 1];
        return card.suit === topCard.suit &&
            getValueNumber(card.value) === getValueNumber(topCard.value) + 1;
    };

    // 이동 가능한 최대 카드 수 (프리셀 규칙: (빈 프리셀+1) * 2^(빈 캐스케이드 수))
    const maxMovable = (excludeCol = -1) => {
        const freeCells = freeCell.filter(c => c === null).length;
        const emptyCols = cascade.filter((col, i) => col.length === 0 && i !== excludeCol).length;
        return (freeCells + 1) * Math.pow(2, emptyCols);
    };

    // 카드 선택 — 여러 장 시퀀스 지원
    const selectCard = (cards: Card[], from: string, fromIndex: number) => {
        if (selectedCard) {
            tryMoveCard(from, fromIndex);
        } else {
            setSelectedCard({ cards, from, fromIndex });
        }
    };

    // 카드 이동 시도
    const tryMoveCard = (to: string, toIndex: number) => {
        if (!selectedCard) return;

        const { cards, from, fromIndex } = selectedCard;
        const card = cards[0];
        let moved = false;

        if (to.startsWith('cascade-')) {
            const targetCol = parseInt(to.split('-')[1]);
            // 여러 장 이동은 캐스케이드로만 가능 + 이동 한도 체크
            if (cards.length <= maxMovable(targetCol) && canMoveToCascade(card, cascade[targetCol])) {
                moveToCascade(cards, from, fromIndex, targetCol);
                moved = true;
            }
        } else if (to.startsWith('foundation-') && cards.length === 1) {
            const targetPile = parseInt(to.split('-')[1]);
            if (canMoveToFoundation(card, foundation[targetPile])) {
                moveToFoundation(card, from, fromIndex, targetPile);
                moved = true;
            }
        } else if (to.startsWith('freecell-') && cards.length === 1) {
            const targetCell = parseInt(to.split('-')[1]);
            if (freeCell[targetCell] === null) {
                moveToFreeCell(card, from, fromIndex, targetCell);
                moved = true;
            }
        }

        if (moved) {
            setMoves(m => m + 1);
        }
        setSelectedCard(null);
    };

    // 캐스케이드로 이동 (여러 장 지원)
    const moveToCascade = (cards: Card[], from: string, fromIndex: number, toCol: number) => {
        const newCascade = cascade.map(col => [...col]);

        // 원래 위치에서 제거
        if (from.startsWith('cascade-')) {
            const fromCol = parseInt(from.split('-')[1]);
            newCascade[fromCol] = newCascade[fromCol].slice(0, fromIndex);
        } else if (from.startsWith('freecell-')) {
            const fromCell = parseInt(from.split('-')[1]);
            const newFreeCell = [...freeCell];
            newFreeCell[fromCell] = null;
            setFreeCell(newFreeCell);
        } else if (from.startsWith('foundation-')) {
            const fromPile = parseInt(from.split('-')[1]);
            const newFoundation = foundation.map(pile => [...pile]);
            newFoundation[fromPile] = newFoundation[fromPile].slice(0, -1);
            setFoundation(newFoundation);
        }

        newCascade[toCol] = [...newCascade[toCol], ...cards];
        setCascade(newCascade);
    };

    // 기초로 이동
    const moveToFoundation = (card: Card, from: string, fromIndex: number, toPile: number) => {
        const newFoundation = foundation.map(pile => [...pile]);
        newFoundation[toPile] = [...newFoundation[toPile], card];
        setFoundation(newFoundation);

        // 원래 위치에서 제거
        if (from.startsWith('cascade-')) {
            const fromCol = parseInt(from.split('-')[1]);
            const newCascade = cascade.map(col => [...col]);
            newCascade[fromCol] = newCascade[fromCol].slice(0, -1);
            setCascade(newCascade);
        } else if (from.startsWith('freecell-')) {
            const fromCell = parseInt(from.split('-')[1]);
            const newFreeCell = [...freeCell];
            newFreeCell[fromCell] = null;
            setFreeCell(newFreeCell);
        }
    };

    // 프리셀로 이동
    const moveToFreeCell = (card: Card, from: string, fromIndex: number, toCell: number) => {
        const newFreeCell = [...freeCell];
        newFreeCell[toCell] = card;
        setFreeCell(newFreeCell);

        // 원래 위치에서 제거
        if (from.startsWith('cascade-')) {
            const fromCol = parseInt(from.split('-')[1]);
            const newCascade = cascade.map(col => [...col]);
            newCascade[fromCol] = newCascade[fromCol].slice(0, -1);
            setCascade(newCascade);
        }
    };

    // 승리 체크 — foundation 변경 후 실행 (stale state 방지)
    useEffect(() => {
        if (foundation.reduce((sum, pile) => sum + pile.length, 0) === 52) {
            setGameWon(true);
        }
    }, [foundation]);

    // 카드 아래가 유효한 시퀀스(내림차순+색 교대)인지 확인
    const isValidSequence = (cards: Card[]): boolean => {
        for (let i = 0; i < cards.length - 1; i++) {
            if (isRed(cards[i].suit) === isRed(cards[i + 1].suit)) return false;
            if (getValueNumber(cards[i].value) !== getValueNumber(cards[i + 1].value) + 1) return false;
        }
        return true;
    };

    // 캐스케이드 카드 클릭 — 시퀀스이고 이동 한도 내면 선택
    const handleCascadeCardClick = (column: Card[], colIndex: number, cardIndex: number) => {
        const cardsToMove = column.slice(cardIndex);
        if (isValidSequence(cardsToMove) && cardsToMove.length <= maxMovable()) {
            selectCard(cardsToMove, `cascade-${colIndex}`, cardIndex);
        }
    };

    // 카드 렌더링
    const renderCard = (card: Card | null, onClick?: () => void, isSelected?: boolean) => {
        if (!card) {
            return (
                <div className="w-13 h-19 sm:w-14 sm:h-21 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-400" />
            );
        }

        const suitSymbol = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        const red = isRed(card.suit);

        return (
            <div
                onClick={onClick}
                className={`w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-lg border-2 shadow-md flex flex-col items-center justify-between py-1 cursor-pointer transition-all
                    ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10' : 'border-slate-300 hover:border-blue-400'}
                    ${red ? 'text-red-600' : 'text-slate-800'}`}
            >
                <div className="text-xs font-bold self-start ml-1">{card.value}</div>
                <div className="text-base">{suitSymbol[card.suit]}</div>
                <div className="text-xs font-bold self-end mr-1 rotate-180">{card.value}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center w-full h-full p-2 sm:p-4 overflow-y-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">🃏 프리셀</h1>

            {/* 상태 바 */}
            <div className="flex gap-4 mb-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">이동: {moves}</div>
                <button
                    onClick={dealCards}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                    새 게임
                </button>
            </div>

            {gameWon && (
                <div className="mb-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-xl animate-bounce">
                    🎉 축하합니다! 승리!
                </div>
            )}

            {/* 상단: 프리셀 + 기초 */}
            <div className="flex gap-2 sm:gap-4 mb-4 w-full max-w-xl justify-between">
                {/* 프리셀 */}
                <div className="flex gap-1">
                    {freeCell.map((cell, i) => (
                        <div
                            key={i}
                            onClick={() => cell ? selectCard([cell], `freecell-${i}`, 0) : tryMoveCard(`freecell-${i}`, 0)}
                        >
                            {cell ? renderCard(cell, undefined, selectedCard?.from === `freecell-${i}`) : renderCard(null)}
                        </div>
                    ))}
                </div>

                {/* 기초 */}
                <div className="flex gap-1">
                    {foundation.map((pile, i) => (
                        <div
                            key={i}
                            onClick={() => tryMoveCard(`foundation-${i}`, 0)}
                            className="w-11 h-16 sm:w-12 sm:h-18 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-dashed border-green-400 flex items-center justify-center"
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

            {/* 캐스케이드 */}
            <div className="flex gap-1 w-full max-w-xl justify-center">
                {cascade.map((column, colIndex) => (
                    <div
                        key={colIndex}
                        onClick={() => column.length === 0 && tryMoveCard(`cascade-${colIndex}`, 0)}
                        className="flex flex-col min-h-[180px]"
                    >
                        {column.length === 0 ? (
                            <div className="w-13 h-19 sm:w-14 sm:h-21 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-400" />
                        ) : (
                            column.map((card, cardIndex) => (
                                <div
                                    key={cardIndex}
                                    style={{ marginTop: cardIndex === 0 ? 0 : '-40px' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCascadeCardClick(column, colIndex, cardIndex);
                                    }}
                                >
                                    {renderCard(
                                        card,
                                        undefined,
                                        selectedCard?.from === `cascade-${colIndex}` && selectedCard?.fromIndex === cardIndex
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                <p>💡 모든 카드가 보입니다! 4개의 프리셀을 활용하세요.</p>
                <p>연속된 카드도 이동 가능 (빈 프리셀/열이 많을수록 더 많이).</p>
            </div>
        </div>
    );
};

export default FreecellGame;
