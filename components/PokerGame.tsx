import React, { useState, useRef, memo } from 'react';

// 족보 데이터 (컴포넌트 외부에 정의)
const handRankingsData = [
    { rank: 10, nameKr: '로열 플러시', desc: 'A-K-Q-J-10 같은 무늬', cards: [{ v: 'A', s: '♠' }, { v: 'K', s: '♠' }, { v: 'Q', s: '♠' }, { v: 'J', s: '♠' }, { v: '10', s: '♠' }] },
    { rank: 9, nameKr: '스트레이트 플러시', desc: '연속 5장 같은 무늬', cards: [{ v: '9', s: '♥' }, { v: '8', s: '♥' }, { v: '7', s: '♥' }, { v: '6', s: '♥' }, { v: '5', s: '♥' }] },
    { rank: 8, nameKr: '포카드', desc: '같은 숫자 4장', cards: [{ v: 'K', s: '♠' }, { v: 'K', s: '♥' }, { v: 'K', s: '♦' }, { v: 'K', s: '♣' }, { v: '2', s: '♠' }] },
    { rank: 7, nameKr: '풀하우스', desc: '트리플 + 페어', cards: [{ v: 'Q', s: '♠' }, { v: 'Q', s: '♥' }, { v: 'Q', s: '♦' }, { v: '7', s: '♣' }, { v: '7', s: '♠' }] },
    { rank: 6, nameKr: '플러시', desc: '같은 무늬 5장', cards: [{ v: 'A', s: '♦' }, { v: 'J', s: '♦' }, { v: '8', s: '♦' }, { v: '6', s: '♦' }, { v: '3', s: '♦' }] },
    { rank: 5, nameKr: '스트레이트', desc: '연속 5장', cards: [{ v: '10', s: '♠' }, { v: '9', s: '♥' }, { v: '8', s: '♦' }, { v: '7', s: '♣' }, { v: '6', s: '♠' }] },
    { rank: 4, nameKr: '트리플', desc: '같은 숫자 3장', cards: [{ v: '8', s: '♠' }, { v: '8', s: '♥' }, { v: '8', s: '♦' }, { v: 'K', s: '♣' }, { v: '4', s: '♠' }] },
    { rank: 3, nameKr: '투페어', desc: '페어 2개', cards: [{ v: 'J', s: '♠' }, { v: 'J', s: '♥' }, { v: '5', s: '♦' }, { v: '5', s: '♣' }, { v: 'K', s: '♠' }] },
    { rank: 2, nameKr: '원페어', desc: '같은 숫자 2장', cards: [{ v: '10', s: '♠' }, { v: '10', s: '♥' }, { v: 'A', s: '♦' }, { v: '8', s: '♣' }, { v: '4', s: '♠' }] },
    { rank: 1, nameKr: '하이카드', desc: '조합 없음', cards: [{ v: 'A', s: '♠' }, { v: 'J', s: '♥' }, { v: '8', s: '♦' }, { v: '6', s: '♣' }, { v: '2', s: '♠' }] },
];

// 미니 카드 컴포넌트 (외부)
const MiniCardComponent = ({ v, s }: { v: string; s: string }) => {
    const isRed = s === '♥' || s === '♦';
    return (
        <div className={`w-7 h-10 sm:w-8 sm:h-11 rounded flex flex-col items-center justify-center text-xs font-bold bg-white border border-slate-300 shadow-sm ${isRed ? 'text-red-500' : 'text-slate-800'}`}>
            <span className="leading-none">{v}</span>
            <span className="text-[10px]">{s}</span>
        </div>
    );
};

// 족보 컨텐츠 (외부, memoized)
const HandRankingsContentComponent = memo(() => (
    <div className="space-y-2">
        {handRankingsData.map((hand, idx) => (
            <div key={hand.rank} className={`p-2 rounded-lg ${idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{hand.nameKr}</span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">#{11 - hand.rank}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{hand.desc}</div>
                <div className="flex gap-1">
                    {hand.cards.map((c, i) => <MiniCardComponent key={i} v={c.v} s={c.s} />)}
                </div>
            </div>
        ))}
    </div>
));

// 게임방법 컨텐츠 (외부, memoized)
const HowToPlayContentComponent = memo(() => (
    <div className="space-y-4 text-sm">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-xl border border-green-200 dark:border-green-700">
            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">🎯 게임 목표</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                내 카드 2장 + 테이블 카드 5장 중에서<br />
                <strong>가장 좋은 5장 조합</strong>을 만들어 딜러를 이기세요!
            </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-700">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">📋 게임 순서</h4>
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">프리플롭</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">각자 2장씩 받습니다</div>
                        <div className="flex gap-1 mt-1">
                            <MiniCardComponent v="A" s="♠" /><MiniCardComponent v="K" s="♥" />
                            <span className="text-xs text-slate-400 self-center ml-1">← 내 카드</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">플롭</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">테이블에 3장 공개</div>
                        <div className="flex gap-1 mt-1">
                            <MiniCardComponent v="Q" s="♠" /><MiniCardComponent v="J" s="♦" /><MiniCardComponent v="10" s="♣" />
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                    <div><div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">턴</div><div className="text-xs text-slate-500 dark:text-slate-400">1장 추가 (총 4장)</div></div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">4</span>
                    <div><div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">리버</div><div className="text-xs text-slate-500 dark:text-slate-400">마지막 1장 (총 5장)</div></div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">5</span>
                    <div><div className="font-semibold text-slate-700 dark:text-slate-200 text-xs">쇼다운</div><div className="text-xs text-slate-500 dark:text-slate-400">카드 공개 & 승부!</div></div>
                </div>
            </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-1">💰 베팅 방법</h4>
            <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2"><span className="bg-slate-500 text-white px-2 py-0.5 rounded font-bold">체크</span><span className="text-slate-600 dark:text-slate-300">베팅 없이 넘기기</span></div>
                <div className="flex items-center gap-2"><span className="bg-blue-500 text-white px-2 py-0.5 rounded font-bold">콜</span><span className="text-slate-600 dark:text-slate-300">상대 베팅에 맞추기</span></div>
                <div className="flex items-center gap-2"><span className="bg-yellow-500 text-white px-2 py-0.5 rounded font-bold">레이즈</span><span className="text-slate-600 dark:text-slate-300">베팅 금액 올리기</span></div>
                <div className="flex items-center gap-2"><span className="bg-red-500 text-white px-2 py-0.5 rounded font-bold">폴드</span><span className="text-slate-600 dark:text-slate-300">포기 (팟 잃음)</span></div>
            </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl border border-purple-200 dark:border-purple-700">
            <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-1">💡 초보자 팁</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>좋은 카드가 오면 레이즈!</li>
                <li>애매하면 체크로 무료 확인</li>
                <li>너무 나쁘면 과감히 폴드</li>
                <li>페어 이상이면 승산 있어요</li>
            </ul>
        </div>
    </div>
));

// PC 사이드바 컴포넌트 (외부, memoized - 스크롤 위치 유지)
const DesktopSidebarComponent = memo(() => {
    const [showRankings, setShowRankings] = useState(true);
    const [showHowTo, setShowHowTo] = useState(true);

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer" onClick={() => setShowRankings(!showRankings)}>
                    <div className="flex items-center gap-2"><span className="text-lg">🃏</span><span className="font-bold text-sm">포커 족보</span></div>
                    <span className="material-icons-round text-lg transition-transform" style={{ transform: showRankings ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </div>
                {showRankings && <div className="p-3 max-h-[350px] overflow-y-auto"><HandRankingsContentComponent /></div>}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-teal-600 text-white cursor-pointer" onClick={() => setShowHowTo(!showHowTo)}>
                    <div className="flex items-center gap-2"><span className="text-lg">📖</span><span className="font-bold text-sm">게임 방법</span></div>
                    <span className="material-icons-round text-lg transition-transform" style={{ transform: showHowTo ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </div>
                {showHowTo && <div className="p-3 max-h-[400px] overflow-y-auto"><HowToPlayContentComponent /></div>}
            </div>
        </div>
    );
});

// 텍사스 홀덤 포커 게임
const PokerGame: React.FC = () => {
    // 카드 타입 정의
    type Card = { suit: string; value: string; numValue: number };
    type HandRank = {
        rank: number;
        name: string;
        nameKr: string;
        highCards: number[];
    };

    // 게임 상태 타입
    type GamePhase = 'betting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'result';

    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];



    // 덱은 ref로 관리
    const deckRef = useRef<Card[]>([]);

    // 게임 상태
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [communityCards, setCommunityCards] = useState<Card[]>([]);
    const [chips, setChips] = useState(1000);
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [dealerBet, setDealerBet] = useState(0);
    const [phase, setPhase] = useState<GamePhase>('betting');
    const [result, setResult] = useState<'win' | 'lose' | 'tie' | null>(null);
    const [playerRank, setPlayerRank] = useState<HandRank | null>(null);
    const [dealerRank, setDealerRank] = useState<HandRank | null>(null);
    const [message, setMessage] = useState('');
    const [betAmount, setBetAmount] = useState(20);

    // 가이드 상태
    const [showHandRankings, setShowHandRankings] = useState(true);
    const [showHowToPlay, setShowHowToPlay] = useState(true);
    const [mobileTab, setMobileTab] = useState<'rankings' | 'howto'>('rankings');
    const [showMobileModal, setShowMobileModal] = useState(false);

    // 덱 생성 및 셔플
    const createDeck = (): Card[] => {
        const newDeck: Card[] = [];
        for (const suit of suits) {
            for (let i = 0; i < values.length; i++) {
                newDeck.push({ suit, value: values[i], numValue: i + 2 });
            }
        }
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    };

    // 핸드 랭킹 평가
    const evaluateHand = (cards: Card[]): HandRank => {
        if (cards.length < 5) return { rank: 0, name: 'High Card', nameKr: '하이카드', highCards: [] };
        const combinations = getCombinations(cards, 5);
        let bestRank: HandRank = { rank: 0, name: 'High Card', nameKr: '하이카드', highCards: [] };
        for (const combo of combinations) {
            const rank = evaluateFiveCards(combo);
            if (rank.rank > bestRank.rank || (rank.rank === bestRank.rank && compareHighCards(rank.highCards, bestRank.highCards) > 0)) {
                bestRank = rank;
            }
        }
        return bestRank;
    };

    const getCombinations = (arr: Card[], k: number): Card[][] => {
        const res: Card[][] = [];
        const combine = (start: number, combo: Card[]) => {
            if (combo.length === k) { res.push([...combo]); return; }
            for (let i = start; i < arr.length; i++) { combo.push(arr[i]); combine(i + 1, combo); combo.pop(); }
        };
        combine(0, []);
        return res;
    };

    const compareHighCards = (a: number[], b: number[]): number => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) { if (a[i] !== b[i]) return a[i] - b[i]; }
        return 0;
    };

    const evaluateFiveCards = (cards: Card[]): HandRank => {
        const sortedCards = [...cards].sort((a, b) => b.numValue - a.numValue);
        const vals = sortedCards.map(c => c.numValue);
        const cardSuits = sortedCards.map(c => c.suit);
        const isFlush = cardSuits.every(s => s === cardSuits[0]);
        const isStraight = checkStraight(vals);
        const counts = getValueCounts(vals);
        const countValues = Object.values(counts).sort((a, b) => b - a);

        if (isFlush && isStraight && vals[0] === 14) return { rank: 10, name: 'Royal Flush', nameKr: '로열 플러시', highCards: vals };
        if (isFlush && isStraight) return { rank: 9, name: 'Straight Flush', nameKr: '스트레이트 플러시', highCards: vals };
        if (countValues[0] === 4) { const k = getKeyByValue(counts, 4); return { rank: 8, name: 'Four of a Kind', nameKr: '포카드', highCards: [k, ...vals.filter(v => v !== k)] }; }
        if (countValues[0] === 3 && countValues[1] === 2) { const t = getKeyByValue(counts, 3); const p = getKeyByValue(counts, 2); return { rank: 7, name: 'Full House', nameKr: '풀하우스', highCards: [t, p] }; }
        if (isFlush) return { rank: 6, name: 'Flush', nameKr: '플러시', highCards: vals };
        if (isStraight) return { rank: 5, name: 'Straight', nameKr: '스트레이트', highCards: vals };
        if (countValues[0] === 3) { const t = getKeyByValue(counts, 3); return { rank: 4, name: 'Three of a Kind', nameKr: '트리플', highCards: [t, ...vals.filter(v => v !== t)] }; }
        if (countValues[0] === 2 && countValues[1] === 2) { const pairs = Object.entries(counts).filter(([, c]) => c === 2).map(([v]) => parseInt(v)).sort((a, b) => b - a); return { rank: 3, name: 'Two Pair', nameKr: '투페어', highCards: [...pairs, vals.find(v => !pairs.includes(v)) || 0] }; }
        if (countValues[0] === 2) { const p = getKeyByValue(counts, 2); return { rank: 2, name: 'One Pair', nameKr: '원페어', highCards: [p, ...vals.filter(v => v !== p)] }; }
        return { rank: 1, name: 'High Card', nameKr: '하이카드', highCards: vals };
    };

    const checkStraight = (vals: number[]): boolean => {
        const sorted = [...new Set(vals)].sort((a, b) => b - a);
        if (sorted.length < 5) return false;
        for (let i = 0; i < sorted.length - 4; i++) { if (sorted[i] - sorted[i + 4] === 4) return true; }
        if (sorted.includes(14) && sorted.includes(5) && sorted.includes(4) && sorted.includes(3) && sorted.includes(2)) return true;
        return false;
    };

    const getValueCounts = (vals: number[]): Record<number, number> => vals.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<number, number>);
    const getKeyByValue = (obj: Record<number, number>, value: number): number => { const keys = Object.entries(obj).filter(([, v]) => v === value).map(([k]) => parseInt(k)).sort((a, b) => b - a); return keys[0] || 0; };

    // 게임 시작
    const startGame = () => {
        if (betAmount > chips) return;
        const newDeck = createDeck();
        const pHand = [newDeck.pop()!, newDeck.pop()!];
        const dHand = [newDeck.pop()!, newDeck.pop()!];
        deckRef.current = newDeck;
        setPlayerHand(pHand); setDealerHand(dHand); setCommunityCards([]);
        setPot(betAmount * 2); setCurrentBet(betAmount); setDealerBet(betAmount);
        setChips(c => c - betAmount); setPhase('preflop'); setResult(null);
        setPlayerRank(null); setDealerRank(null); setMessage('프리플롭 - 베팅하세요!');
    };

    const goToFlop = () => { const f = [deckRef.current.pop()!, deckRef.current.pop()!, deckRef.current.pop()!]; setCommunityCards(f); setPhase('flop'); setMessage('플롭 - 베팅하세요!'); setCurrentBet(0); setDealerBet(0); };
    const goToTurn = () => { const t = deckRef.current.pop()!; setCommunityCards(p => [...p, t]); setPhase('turn'); setMessage('턴 - 베팅하세요!'); setCurrentBet(0); setDealerBet(0); };
    const goToRiver = () => { const r = deckRef.current.pop()!; setCommunityCards(p => [...p, r]); setPhase('river'); setMessage('리버 - 최종 베팅!'); setCurrentBet(0); setDealerBet(0); };

    const goToShowdown = (pHand: Card[], dHand: Card[], comCards: Card[], currentPot: number) => {
        setPhase('showdown');
        const pRank = evaluateHand([...pHand, ...comCards]);
        const dRank = evaluateHand([...dHand, ...comCards]);
        setPlayerRank(pRank); setDealerRank(dRank);
        setTimeout(() => {
            if (pRank.rank > dRank.rank) { setResult('win'); setChips(c => c + currentPot); setMessage(`승리! ${pRank.nameKr}로 이겼습니다!`); }
            else if (pRank.rank < dRank.rank) { setResult('lose'); setMessage(`패배... 딜러의 ${dRank.nameKr}에 졌습니다.`); }
            else {
                const comp = compareHighCards(pRank.highCards, dRank.highCards);
                if (comp > 0) { setResult('win'); setChips(c => c + currentPot); setMessage(`승리!`); }
                else if (comp < 0) { setResult('lose'); setMessage(`패배...`); }
                else { setResult('tie'); setChips(c => c + Math.floor(currentPot / 2)); setMessage('무승부!'); }
            }
            setPhase('result');
        }, 1500);
    };

    const handleCheck = () => { if (currentBet < dealerBet) return; switch (phase) { case 'preflop': goToFlop(); break; case 'flop': goToTurn(); break; case 'turn': goToRiver(); break; case 'river': setCommunityCards(p => { goToShowdown(playerHand, dealerHand, p, pot); return p; }); break; } };
    const handleCall = () => { const ca = dealerBet - currentBet; if (ca > chips) return; const np = pot + ca; setChips(c => c - ca); setPot(np); setCurrentBet(dealerBet); switch (phase) { case 'preflop': goToFlop(); break; case 'flop': goToTurn(); break; case 'turn': goToRiver(); break; case 'river': setCommunityCards(p => { goToShowdown(playerHand, dealerHand, p, np); return p; }); break; } };
    const handleRaise = () => { const ra = betAmount; const tb = dealerBet + ra - currentBet; if (tb > chips) return; setChips(c => c - tb); const np = pot + tb; setPot(np); const npb = dealerBet + ra; setCurrentBet(npb); const ai = Math.random(); if (ai < 0.2 && phase !== 'preflop') { setMessage('딜러가 폴드!'); setResult('win'); setChips(c => c + np); setPhase('result'); } else if (ai < 0.5) { setDealerBet(npb + ra); setPot(p => p + ra); setMessage('딜러가 레이즈!'); } else { setDealerBet(npb); switch (phase) { case 'preflop': goToFlop(); break; case 'flop': goToTurn(); break; case 'turn': goToRiver(); break; case 'river': setCommunityCards(p => { goToShowdown(playerHand, dealerHand, p, np); return p; }); break; } } };
    const handleFold = () => { setResult('lose'); setMessage('폴드...'); setPhase('result'); };
    const resetGame = () => { setPhase('betting'); setPlayerHand([]); setDealerHand([]); setCommunityCards([]); setPot(0); setCurrentBet(0); setDealerBet(0); setResult(null); setPlayerRank(null); setDealerRank(null); setMessage(''); deckRef.current = []; };

    // 카드 렌더링
    const renderCard = (card: Card, hidden = false, isSmall = false) => {
        const isRed = card.suit === '♥' || card.suit === '♦';
        const sizeClass = isSmall ? 'w-14 h-20 sm:w-16 sm:h-24 text-lg sm:text-xl' : 'w-20 h-28 sm:w-24 sm:h-32 lg:w-28 lg:h-40 text-2xl sm:text-3xl lg:text-4xl';
        return (
            <div className={`${sizeClass} rounded-xl shadow-xl flex flex-col items-center justify-center font-bold ${hidden ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-white'} ${!hidden && isRed ? 'text-red-500' : 'text-slate-800'} border-2 border-slate-300 transition-all hover:scale-105`}>
                {hidden ? <span className="text-white text-4xl sm:text-5xl">🂠</span> : <><span className="leading-tight">{card.value}</span><span className={`${isSmall ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} ${isRed ? 'text-red-500' : 'text-slate-800'}`}>{card.suit}</span></>}
            </div>
        );
    };

    // 모바일 모달
    const MobileModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">포커 가이드</span>
                        <button onClick={() => setShowMobileModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><span className="material-icons-round">close</span></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setMobileTab('rankings')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'rankings' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}>🃏 족보</button>
                        <button onClick={() => setMobileTab('howto')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'howto' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'}`}>📖 게임방법</button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {mobileTab === 'rankings' ? <HandRankingsContentComponent /> : <HowToPlayContentComponent />}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 w-full min-h-screen p-2 sm:p-4 overflow-y-auto pb-24">
            {/* 메인 게임 영역 */}
            <div className="flex-1 flex flex-col items-center gap-4 sm:gap-6 max-w-4xl mx-auto">
                {/* 칩 & 팟 정보 + 모바일 가이드 버튼 */}
                <div className="flex justify-between items-center w-full px-4">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-500 drop-shadow-lg">💰 {chips}</div>
                    <button onClick={() => setShowMobileModal(true)} className="lg:hidden flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg active:scale-95">
                        <span>📖</span><span>가이드</span>
                    </button>
                    <div className="text-2xl sm:text-3xl font-bold text-green-500 drop-shadow-lg">🏆 {pot}</div>
                </div>

                {/* 딜러 영역 */}
                <div className="text-center w-full">
                    <div className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-3 font-semibold">딜러 {dealerRank ? <span className="text-red-500">- {dealerRank.nameKr}</span> : ''}</div>
                    <div className="flex gap-3 sm:gap-4 justify-center">
                        {dealerHand.map((card, i) => <React.Fragment key={`dealer-${i}`}>{renderCard(card, phase !== 'showdown' && phase !== 'result')}</React.Fragment>)}
                    </div>
                </div>

                {/* 커뮤니티 카드 */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-2xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl border-4 border-green-500/30">
                    <div className="text-sm sm:text-base text-green-100 mb-3 text-center font-semibold">커뮤니티 카드 ({communityCards.length}/5)</div>
                    <div className="flex gap-2 sm:gap-3 justify-center min-h-[100px] sm:min-h-[130px] items-center flex-wrap">
                        {communityCards.length > 0 ? communityCards.map((card, i) => <React.Fragment key={`community-${i}`}>{renderCard(card, false, true)}</React.Fragment>) : <div className="text-green-200 text-base sm:text-lg">아직 공개되지 않음</div>}
                    </div>
                </div>

                {/* 메시지 */}
                <div className={`text-xl sm:text-2xl font-bold text-center px-6 py-3 rounded-xl shadow-lg ${result === 'win' ? 'text-green-600 bg-green-100 dark:bg-green-900/50' : result === 'lose' ? 'text-red-600 bg-red-100 dark:bg-red-900/50' : result === 'tie' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50' : 'text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80'}`}>
                    {message || `현재: ${phase}`}
                </div>

                {/* 플레이어 영역 */}
                <div className="text-center w-full">
                    <div className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-3 font-semibold">플레이어 {playerRank ? <span className="text-blue-500">- {playerRank.nameKr}</span> : ''}</div>
                    <div className="flex gap-3 sm:gap-4 justify-center">
                        {playerHand.map((card, i) => <React.Fragment key={`player-${i}`}>{renderCard(card)}</React.Fragment>)}
                    </div>
                </div>

                {/* 컨트롤 */}
                {phase === 'betting' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setBetAmount(b => Math.max(10, b - 10))} className="px-5 py-3 bg-slate-600 text-white text-lg rounded-xl font-bold active:bg-slate-500 shadow-lg">-10</button>
                            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white min-w-[100px] text-center">베팅: {betAmount}</span>
                            <button onClick={() => setBetAmount(b => Math.min(chips, b + 10))} className="px-5 py-3 bg-slate-600 text-white text-lg rounded-xl font-bold active:bg-slate-500 shadow-lg">+10</button>
                        </div>
                        <button onClick={startGame} disabled={betAmount > chips || chips <= 0} className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 disabled:from-slate-400 disabled:to-slate-500 shadow-xl transition-all hover:scale-105">
                            {chips <= 0 ? '게임 오버' : '🎴 게임 시작'}
                        </button>
                    </div>
                )}

                {(phase === 'preflop' || phase === 'flop' || phase === 'turn' || phase === 'river') && (
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                        {currentBet >= dealerBet && <button onClick={handleCheck} className="px-6 py-4 bg-slate-500 text-white text-lg font-bold rounded-xl hover:bg-slate-400 shadow-lg transition-all hover:scale-105">✓ 체크</button>}
                        {currentBet < dealerBet && <button onClick={handleCall} disabled={dealerBet - currentBet > chips} className="px-6 py-4 bg-blue-500 text-white text-lg font-bold rounded-xl hover:bg-blue-400 disabled:bg-slate-400 shadow-lg transition-all hover:scale-105">📞 콜 ({dealerBet - currentBet})</button>}
                        <button onClick={handleRaise} disabled={betAmount + (dealerBet - currentBet) > chips} className="px-6 py-4 bg-yellow-500 text-white text-lg font-bold rounded-xl hover:bg-yellow-400 disabled:bg-slate-400 shadow-lg transition-all hover:scale-105">⬆️ 레이즈 (+{betAmount})</button>
                        <button onClick={handleFold} className="px-6 py-4 bg-red-500 text-white text-lg font-bold rounded-xl hover:bg-red-400 shadow-lg transition-all hover:scale-105">✖ 폴드</button>
                    </div>
                )}

                {phase === 'showdown' && <div className="text-xl text-slate-500 dark:text-slate-400 animate-pulse font-semibold">⏳ 결과 확인 중...</div>}
                {phase === 'result' && <button onClick={resetGame} disabled={chips <= 0} className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-xl hover:from-green-400 hover:to-emerald-400 disabled:from-slate-400 disabled:to-slate-500 shadow-xl transition-all hover:scale-105">{chips <= 0 ? '칩이 없습니다' : '🔄 다음 게임'}</button>}
            </div>

            {/* PC 사이드바 */}
            <div className="hidden lg:block w-72 shrink-0"><DesktopSidebarComponent /></div>

            {/* 모바일 모달 */}
            {showMobileModal && <MobileModal />}
        </div>
    );
};

export default PokerGame;
