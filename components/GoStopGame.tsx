import React, { useState, useRef, memo, useEffect } from 'react';

// 화투 카드 타입
type CardType = 'gwang' | 'yul' | 'tti' | 'pi';
type TtiType = 'hong' | 'cheong' | 'cho' | null;

interface HwatuCard {
    month: number;
    type: CardType;
    tti?: TtiType;
    name: string;
    isDouble?: boolean; // 쌍피
}

// 화투 48장 정의
const createHwatuDeck = (): HwatuCard[] => {
    const deck: HwatuCard[] = [
        // 1월 송학
        { month: 1, type: 'gwang', name: '송학 광' },
        { month: 1, type: 'tti', tti: 'hong', name: '송학 홍단' },
        { month: 1, type: 'pi', name: '송학 피' },
        { month: 1, type: 'pi', name: '송학 피' },
        // 2월 매화
        { month: 2, type: 'yul', name: '매화 열끗' }, // 고도리
        { month: 2, type: 'tti', tti: 'hong', name: '매화 홍단' },
        { month: 2, type: 'pi', name: '매화 피' },
        { month: 2, type: 'pi', name: '매화 피' },
        // 3월 벚꽃
        { month: 3, type: 'gwang', name: '벚꽃 광' },
        { month: 3, type: 'tti', tti: 'hong', name: '벚꽃 홍단' },
        { month: 3, type: 'pi', name: '벚꽃 피' },
        { month: 3, type: 'pi', name: '벚꽃 피' },
        // 4월 흑싸리
        { month: 4, type: 'yul', name: '흑싸리 열끗' }, // 고도리
        { month: 4, type: 'tti', tti: 'cho', name: '흑싸리 초단' },
        { month: 4, type: 'pi', name: '흑싸리 피' },
        { month: 4, type: 'pi', name: '흑싸리 피' },
        // 5월 난초
        { month: 5, type: 'yul', name: '난초 열끗' },
        { month: 5, type: 'tti', tti: 'cho', name: '난초 초단' },
        { month: 5, type: 'pi', name: '난초 피' },
        { month: 5, type: 'pi', name: '난초 피' },
        // 6월 모란
        { month: 6, type: 'yul', name: '모란 열끗' },
        { month: 6, type: 'tti', tti: 'cheong', name: '모란 청단' },
        { month: 6, type: 'pi', name: '모란 피' },
        { month: 6, type: 'pi', name: '모란 피' },
        // 7월 홍싸리
        { month: 7, type: 'yul', name: '홍싸리 열끗' },
        { month: 7, type: 'tti', tti: 'cho', name: '홍싸리 초단' },
        { month: 7, type: 'pi', name: '홍싸리 피' },
        { month: 7, type: 'pi', name: '홍싸리 피' },
        // 8월 공산
        { month: 8, type: 'gwang', name: '공산 광' },
        { month: 8, type: 'yul', name: '공산 열끗' }, // 고도리
        { month: 8, type: 'pi', name: '공산 피' },
        { month: 8, type: 'pi', name: '공산 피' },
        // 9월 국화
        { month: 9, type: 'yul', name: '국화 열끗' },
        { month: 9, type: 'tti', tti: 'cheong', name: '국화 청단' },
        { month: 9, type: 'pi', name: '국화 피' },
        { month: 9, type: 'pi', name: '국화 피' },
        // 10월 단풍
        { month: 10, type: 'yul', name: '단풍 열끗' },
        { month: 10, type: 'tti', tti: 'cheong', name: '단풍 청단' },
        { month: 10, type: 'pi', name: '단풍 피' },
        { month: 10, type: 'pi', name: '단풍 피' },
        // 11월 오동
        { month: 11, type: 'gwang', name: '오동 광' },
        { month: 11, type: 'pi', name: '오동 피' },
        { month: 11, type: 'pi', name: '오동 피' },
        { month: 11, type: 'pi', isDouble: true, name: '오동 쌍피' },
        // 12월 비
        { month: 12, type: 'gwang', name: '비 광' },
        { month: 12, type: 'yul', name: '비 열끗' },
        { month: 12, type: 'tti', tti: null, name: '비 띠' }, // 비 띠는 특수 족보(홍/청/초)에 포함되지 않음
        { month: 12, type: 'pi', isDouble: true, name: '비 쌍피' },
    ];
    return deck.map((card, idx) => ({ ...card, id: idx }));
};

// 족보 데이터
const gostopRankings = [
    { name: '오광', desc: '광 5장', points: 15, cards: ['1광', '3광', '8광', '11광', '12광'] },
    { name: '사광', desc: '비광 제외 광 4장', points: 4, cards: ['1광', '3광', '8광', '11광'] },
    { name: '비사광', desc: '비광 포함 광 4장', points: 4, cards: ['1광', '3광', '8광', '12광'] },
    { name: '삼광', desc: '비광 제외 광 3장', points: 3, cards: ['1광', '3광', '8광'] },
    { name: '비삼광', desc: '비광 포함 광 3장', points: 2, cards: ['1광', '3광', '12광'] },
    { name: '고도리', desc: '2,4,8월 열끗', points: 5, cards: ['2열', '4열', '8열'] },
    { name: '홍단', desc: '1,2,3월 홍단', points: 3, cards: ['1홍', '2홍', '3홍'] },
    { name: '청단', desc: '6,9,10월 청단', points: 3, cards: ['6청', '9청', '10청'] },
    { name: '초단', desc: '4,5,7월 초단', points: 3, cards: ['4초', '5초', '7초'] },
    { name: '띠 5장', desc: '띠 5장 이상', points: 1, cards: ['띠×5+'] },
    { name: '열끗 5장', desc: '열끗 5장 이상', points: 1, cards: ['열×5+'] },
    { name: '피 10장', desc: '피 10장 이상', points: 1, cards: ['피×10+'] },
];

// 월 이름
const monthNames = ['', '송학', '매화', '벚꽃', '흑싸리', '난초', '모란', '홍싸리', '공산', '국화', '단풍', '오동', '비'];

// 월 이모지
const monthEmojis = ['', '🌲', '🌸', '🌸', '🌑', '🌿', '🌺', '🔴', '🌕', '🌼', '🍁', '🎋', '🌧️'];

// 화투 이미지 매핑 데이터
const hwatuImageMap: Record<string, string> = {
    // 광 (Gwang)
    'gwang-1': '/hwatu/hwatu_s_1_1.png',   // 1월 송학 (광)
    'gwang-3': '/hwatu/hwatu_s_3_1.png',   // 3월 벚꽃 (광)
    'gwang-8': '/hwatu/hwatu_s_8_1.png',   // 8월 공산 (광)
    'gwang-11': '/hwatu/hwatu_s_11_1.png', // 11월 오동 (광)
    'gwang-12': '/hwatu/hwatu_s_12_1.png', // 12월 비 (광)

    // 열 (Yul)
    'yul-2': '/hwatu/hwatu_s_2_1.png',     // 2월 매화 (열)
    'yul-4': '/hwatu/hwatu_s_4_1.png',     // 4월 흑싸리 (열)
    'yul-5': '/hwatu/hwatu_s_5_1.png',     // 5월 난초 (열)
    'yul-6': '/hwatu/hwatu_s_6_1.png',     // 6월 모란 (열)
    'yul-7': '/hwatu/hwatu_s_7_1.png',     // 7월 홍싸리 (열)
    'yul-8': '/hwatu/hwatu_s_8_2.png',     // 8월 공산 (열 - 새)
    'yul-9': '/hwatu/hwatu_s_9_1.png',     // 9월 국화 (열 - 쌍국화/술잔?) - Check mapping, usually 9-1 is Yul (Sake cup) or Tti? 
    // Let's assume standard order from sheet provided usually: 
    // 9월: 국진(Double Pi/Yul?), Tti, Pi, Pi. Wait.
    // Image sheet row 5: 9월. 9-1(Sake Cup?), 9-2(Tti?), 9-3, 9-4.
    // Let's verify standard order later, but map strictly for now.
    // Assuming 9-1 is the Sake Cup (Yul/Double)
    'yul-10': '/hwatu/hwatu_s_10_1.png',   // 10월 단풍 (열 - 사슴)
    'yul-12': '/hwatu/hwatu_s_12_2.png',   // 12월 비 (열 - 새? No, 12월 is Gwang, Yul(Bird), Tti, Pi. usually 12-2 is bird)

    // 띠 (Tti)
    'tti-1': '/hwatu/hwatu_s_1_2.png',     // 1월 홍단
    'tti-2': '/hwatu/hwatu_s_2_2.png',     // 2월 홍단
    'tti-3': '/hwatu/hwatu_s_3_2.png',     // 3월 홍단
    'tti-4': '/hwatu/hwatu_s_4_2.png',     // 4월 초단
    'tti-5': '/hwatu/hwatu_s_5_2.png',     // 5월 초단
    'tti-6': '/hwatu/hwatu_s_6_2.png',     // 6월 청단
    'tti-7': '/hwatu/hwatu_s_7_2.png',     // 7월 초단
    'tti-9': '/hwatu/hwatu_s_9_2.png',     // 9월 청단
    'tti-10': '/hwatu/hwatu_s_10_2.png',   // 10월 청단
    'tti-12': '/hwatu/hwatu_s_12_3.png',   // 12월 띠 (Usually 12-3)

    // 피 (Pi) & 쌍피 (Double Pi) - Individual Mappings
    // 1월
    'pi-1': '/hwatu/hwatu_s_1_3.png',
    'pi-1-2': '/hwatu/hwatu_s_1_4.png',
    // 2월
    'pi-2': '/hwatu/hwatu_s_2_3.png',
    'pi-2-2': '/hwatu/hwatu_s_2_4.png',
    // 3월
    'pi-3': '/hwatu/hwatu_s_3_3.png',
    'pi-3-2': '/hwatu/hwatu_s_3_4.png',
    // 4월
    'pi-4': '/hwatu/hwatu_s_4_3.png',
    'pi-4-2': '/hwatu/hwatu_s_4_4.png',
    // 5월
    'pi-5': '/hwatu/hwatu_s_5_3.png',
    'pi-5-2': '/hwatu/hwatu_s_5_4.png',
    // 6월
    'pi-6': '/hwatu/hwatu_s_6_3.png',
    'pi-6-2': '/hwatu/hwatu_s_6_4.png',
    // 7월
    'pi-7': '/hwatu/hwatu_s_7_3.png',
    'pi-7-2': '/hwatu/hwatu_s_7_4.png',
    // 8월
    'pi-8': '/hwatu/hwatu_s_8_3.png',
    'pi-8-2': '/hwatu/hwatu_s_8_4.png',
    // 9월
    'pi-9': '/hwatu/hwatu_s_9_3.png',
    'pi-9-2': '/hwatu/hwatu_s_9_4.png',
    // 10월
    'pi-10': '/hwatu/hwatu_s_10_3.png',
    'pi-10-2': '/hwatu/hwatu_s_10_4.png',
    // 11월 (Double Pi is usually 11-2 or 11-3? 11 is Gwang(1), Double(2), Pi(3), Pi(4) or Gwang, Pi, Pi, Double? )
    // Standard: 11-1 Gwang, 11-2 Double, 11-3 Pi, 11-4 Pi.
    'pi-11': '/hwatu/hwatu_s_11_2.png', // Let's check visual later.
    'pi-11-2': '/hwatu/hwatu_s_11_3.png',
    'pi-11-3': '/hwatu/hwatu_s_11_4.png',
    // 12월 (Double Pi is usually 12-4? 12 has Gwang, Bird, Ribbon, Double Pi)
    'pi-12': '/hwatu/hwatu_s_12_4.png',

    // 공통 뒷면
    'back': '/hwatu/hwatu_card_back_1768309360746.png',
};

// getGlobalHwatuImage 업데이트: 피(Pi)도 개별 이미지 리턴하도록 수정
const getGlobalHwatuImage = (month: number, type: CardType, isDouble: boolean = false): string | null => {
    // 예외 처리: 피(Pi)는 카드가 여러장이므로 id나 순서를 알아야 정확하지만, 
    // 현재 구조상 type과 month만으로는 구분이 어려울 수 있음.
    // 임시로 랜덤하거나 순서대로 매핑? 
    // GoStopGame에서 card 객체에 unique ID가 있으므로 그것을 활용하거나,
    // 일단 랜덤/순환 리턴은 렌더링 시 깜빡일 수 있음.

    // 단순화: Pi는 기본적으로 3번 이미지 사용, 쌍피는 별도 처리 필요한데...
    // 기존 구조에서 card 객체를 전달받지 않고 month, type만 받음 -> card 객체 받는 걸로 변경 필요?
    // 아니면 여기서 간단히 매핑.

    const key = `${type}-${month}`;
    if (hwatuImageMap[key]) return hwatuImageMap[key];

    // Pi 처리
    if (type === 'pi') {
        // 단순히 pi-{month} 리턴 (나중에 렌더링에서 구체화)
        // 하지만 파일명은 pi-1, pi-1-2 등으로 되어 있음.
        // 여기서는 대표 이미지만 리턴하고,
        // renderHwatuCard 내부에서 구체적으로 처리하는 것이 좋음.
        return hwatuImageMap[`pi-${month}`] || null;
    }

    return null;
};

// 미니 화투 카드 컴포넌트 (족보 예시용)
const MiniHwatuCard = memo(({ month, type, tti, mode = 'classic' }: { month: number; type: CardType; tti?: TtiType; mode?: 'classic' | 'reality' }) => {
    const imagePath = getGlobalHwatuImage(month, type);

    if (mode === 'reality' && imagePath) {
        return (
            <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg overflow-hidden shadow-sm border border-slate-200">
                <img src={imagePath} alt={`${month}월`} className="w-full h-full object-cover" />
            </div>
        );
    }

    const bgColor = type === 'gwang' ? 'bg-yellow-100' : type === 'yul' ? 'bg-blue-100' : type === 'tti' ? (tti === 'hong' ? 'bg-red-100' : tti === 'cheong' ? 'bg-blue-100' : 'bg-green-100') : 'bg-gray-100';
    const borderColor = type === 'gwang' ? 'border-yellow-400' : type === 'yul' ? 'border-blue-400' : type === 'tti' ? (tti === 'hong' ? 'border-red-400' : tti === 'cheong' ? 'border-blue-400' : 'border-green-400') : 'border-gray-300';
    const typeLabel = type === 'gwang' ? '光' : type === 'yul' ? '열' : type === 'tti' ? (tti === 'hong' ? '홍' : tti === 'cheong' ? '청' : '초') : '피';

    return (
        <div className={`w-10 h-14 sm:w-12 sm:h-16 ${bgColor} ${borderColor} border-2 rounded-lg flex flex-col items-center justify-center shadow-sm`}>
            <span className="text-xs">{monthEmojis[month]}</span>
            <span className="text-[10px] font-bold text-slate-700">{month}월</span>
            <span className={`text-[8px] font-bold ${type === 'gwang' ? 'text-yellow-600' : type === 'tti' && tti === 'hong' ? 'text-red-500' : type === 'tti' && tti === 'cheong' ? 'text-blue-500' : type === 'tti' ? 'text-green-600' : 'text-gray-500'}`}>{typeLabel}</span>
        </div>
    );
});

// 족보 가이드 컴포넌트 - 초보자용 상세 버전
const RankingsGuide = memo(({ mode = 'classic' }: { mode?: 'classic' | 'reality' }) => (
    <div className="space-y-4">
        {/* 화투 기본 설명 */}
        <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-200 dark:border-amber-700">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2 text-sm">🎴 화투란?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                화투는 <strong>12달(월)</strong>을 상징하는 총 <strong>48장</strong>의 카드입니다.<br />
                각 달마다 4장씩 있으며, 카드 종류는 <strong>광, 열끗, 띠, 피</strong>로 나뉩니다.
            </p>
        </div>

        {/* 카드 종류 설명 */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm">📋 카드 종류 (4가지)</h4>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <MiniHwatuCard month={1} type="gwang" mode={mode} />
                    <div className="flex-1">
                        <div className="font-bold text-yellow-600 text-sm">光 광 (5장)</div>
                        <div className="text-xs text-slate-500">가장 귀한 카드! 1,3,8,11,12월에 있음</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <MiniHwatuCard month={5} type="yul" mode={mode} />
                    <div className="flex-1">
                        <div className="font-bold text-blue-600 text-sm">열끗 (10장)</div>
                        <div className="text-xs text-slate-500">동물이 그려진 카드. 고도리용!</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <MiniHwatuCard month={1} type="tti" tti="hong" mode={mode} />
                    <div className="flex-1">
                        <div className="font-bold text-red-600 text-sm">띠 (10장)</div>
                        <div className="text-xs text-slate-500">글씨가 적힌 띠. 홍단/청단/초단</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <MiniHwatuCard month={7} type="pi" mode={mode} />
                    <div className="flex-1">
                        <div className="font-bold text-gray-600 text-sm">피 (23장+)</div>
                        <div className="text-xs text-slate-500">가장 많음. 10장 모으면 1점!</div>
                    </div>
                </div>
            </div>
        </div>

        {/* 족보 상세 */}
        <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
            <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-3 text-sm">🏆 점수 나는 족보 (점수 조합)</h4>

            {/* 광 족보 */}
            <div className="mb-4">
                <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-2 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded inline-block">⭐ 광 족보</div>
                <div className="space-y-2 ml-1">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">오광</span>
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">15점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">광 5장 모두 모으기 (최고 족보!)</div>
                        <div className="flex gap-1 flex-wrap">
                            <MiniHwatuCard month={1} type="gwang" mode={mode} />
                            <MiniHwatuCard month={3} type="gwang" mode={mode} />
                            <MiniHwatuCard month={8} type="gwang" mode={mode} />
                            <MiniHwatuCard month={11} type="gwang" mode={mode} />
                            <MiniHwatuCard month={12} type="gwang" mode={mode} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">사광</span>
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">4점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">12월(비) 제외 광 4장</div>
                        <div className="flex gap-1 flex-wrap">
                            <MiniHwatuCard month={1} type="gwang" mode={mode} />
                            <MiniHwatuCard month={3} type="gwang" mode={mode} />
                            <MiniHwatuCard month={8} type="gwang" mode={mode} />
                            <MiniHwatuCard month={11} type="gwang" mode={mode} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">삼광</span>
                            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">3점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">12월(비) 제외 광 3장</div>
                        <div className="flex gap-1">
                            <MiniHwatuCard month={1} type="gwang" mode={mode} />
                            <MiniHwatuCard month={3} type="gwang" mode={mode} />
                            <MiniHwatuCard month={8} type="gwang" mode={mode} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">비삼광</span>
                            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">2점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">12월(비) 포함 광 3장</div>
                        <div className="flex gap-1">
                            <MiniHwatuCard month={1} type="gwang" mode={mode} />
                            <MiniHwatuCard month={3} type="gwang" mode={mode} />
                            <MiniHwatuCard month={12} type="gwang" mode={mode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 고도리 */}
            <div className="mb-4">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded inline-block">🐦 고도리</div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm ml-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">고도리</span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">5점</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">2월(매화), 4월(흑싸리), 8월(공산)의 열끗</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">💡 새가 그려진 3장의 열끗!</div>
                    <div className="flex gap-1">
                        <MiniHwatuCard month={2} type="yul" mode={mode} />
                        <MiniHwatuCard month={4} type="yul" mode={mode} />
                        <MiniHwatuCard month={8} type="yul" mode={mode} />
                    </div>
                </div>
            </div>

            {/* 띠 족보 */}
            <div className="mb-4">
                <div className="text-xs font-bold text-pink-600 dark:text-pink-400 mb-2 bg-pink-50 dark:bg-pink-900/30 px-2 py-1 rounded inline-block">🎀 띠 족보</div>
                <div className="space-y-2 ml-1">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-red-600">홍단</span>
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">3점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">1,2,3월의 빨간 띠 (홍단에 글씨 있음)</div>
                        <div className="flex gap-1">
                            <MiniHwatuCard month={1} type="tti" tti="hong" mode={mode} />
                            <MiniHwatuCard month={2} type="tti" tti="hong" mode={mode} />
                            <MiniHwatuCard month={3} type="tti" tti="hong" mode={mode} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-blue-600">청단</span>
                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">3점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">6,9,10월의 파란 띠</div>
                        <div className="flex gap-1">
                            <MiniHwatuCard month={6} type="tti" tti="cheong" mode={mode} />
                            <MiniHwatuCard month={9} type="tti" tti="cheong" mode={mode} />
                            <MiniHwatuCard month={10} type="tti" tti="cheong" mode={mode} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-green-600">초단</span>
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">3점</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">4,5,7월의 글씨 없는 띠</div>
                        <div className="flex gap-1">
                            <MiniHwatuCard month={4} type="tti" tti="cho" mode={mode} />
                            <MiniHwatuCard month={5} type="tti" tti="cho" mode={mode} />
                            <MiniHwatuCard month={7} type="tti" tti="cho" mode={mode} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 개수 족보 */}
            <div>
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded inline-block">📊 개수 족보</div>
                <div className="space-y-2 ml-1 text-xs">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <span>띠 5장 이상</span>
                        <span className="font-bold">1점 + 추가 1점/장</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <span>열끗 5장 이상</span>
                        <span className="font-bold">1점 + 추가 1점/장</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <span>피 10장 이상 (쌍피=2장)</span>
                        <span className="font-bold">1점 + 추가 1점/장</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

// 게임방법 가이드 컴포넌트 - 초보자용 상세 버전
const HowToPlayGuide = memo(({ mode = 'classic' }: { mode?: 'classic' | 'reality' }) => (
    <div className="space-y-4 text-sm">
        {/* 게임 목표 */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 p-3 rounded-xl border border-orange-200 dark:border-orange-700">
            <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">🎯 게임 목표</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                상대보다 먼저 <strong className="text-orange-600">7점</strong> 이상을 달성하세요!<br />
                점수가 나면 <strong>"스톱"</strong> 해서 승리하거나,<br />
                <strong>"고"</strong>를 외쳐 점수 2배를 노릴 수 있습니다!
            </p>
        </div>

        {/* 게임 화면 설명 */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">🖥️ 게임 화면 구성</h4>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex gap-2 items-center">
                    <span className="bg-red-700 text-white px-1.5 py-0.5 rounded text-[10px]">상단</span>
                    <span>AI의 패 (뒷면으로 보임)</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="bg-green-700 text-white px-1.5 py-0.5 rounded text-[10px]">중앙</span>
                    <span>바닥 패 (여기서 카드를 가져감)</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">하단</span>
                    <span>내 패 (여기서 카드를 내려놓음)</span>
                </div>
            </div>
        </div>

        {/* 게임 진행 순서 */}
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-700">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-3">📋 한 턴 진행 순서</h4>
            <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">1</span>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg flex-1">
                        <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">내 패에서 1장 선택</div>
                        <div className="text-slate-500 dark:text-slate-400">내가 가진 카드 중 1장을 클릭합니다</div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">2</span>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg flex-1">
                        <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">바닥과 매칭 확인</div>
                        <div className="text-slate-500 dark:text-slate-400 mb-2">바닥에 <strong>같은 월</strong>의 카드가 있는지 확인!</div>
                        <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-green-700 dark:text-green-400 font-bold">예시:</span>
                                <MiniHwatuCard month={3} type="gwang" mode={mode} />
                                <span className="text-slate-400">→ 바닥의</span>
                                <MiniHwatuCard month={3} type="pi" mode={mode} />
                                <span className="text-green-600 font-bold">= 매칭!</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">3월 광 → 3월 피 = 같은 3월이므로 둘 다 가져옴</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-blue-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">3</span>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg flex-1">
                        <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">결과에 따라 행동</div>
                        <div className="space-y-1 text-slate-500 dark:text-slate-400">
                            <div>✅ <strong>매칭 성공</strong>: 두 카드 모두 획득!</div>
                            <div>❌ <strong>매칭 실패</strong>: 내 카드가 바닥에 남음</div>
                            <div>⚠️ <strong>2장 이상 매칭</strong>: 가져갈 1장 선택</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-purple-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">4</span>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg flex-1">
                        <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">덱에서 1장 뒤집기</div>
                        <div className="text-slate-500 dark:text-slate-400">자동으로 덱에서 카드 1장이 뒤집히고,<br />바닥과 또 매칭되면 가져갑니다!</div>
                    </div>
                </div>
            </div>
        </div>

        {/* 고와 스톱 */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 p-3 rounded-xl border border-red-200 dark:border-red-700">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">🔥 고 vs 스톱</h4>
            <div className="text-xs space-y-2">
                <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg">
                    <div className="font-bold text-blue-600 mb-1">✋ 스톱</div>
                    <div className="text-slate-500 dark:text-slate-400">
                        7점 이상일 때 선택하면 <strong>게임 종료</strong>하고 승리!<br />
                        안전하게 점수를 챙기는 방법입니다.
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-2 rounded-lg">
                    <div className="font-bold text-red-600 mb-1">🔥 고!</div>
                    <div className="text-slate-500 dark:text-slate-400">
                        게임을 계속하면서 <strong>점수 배율 증가!</strong><br />
                        고 1회 = 2배, 고 2회 = 3배...<br />
                        <span className="text-red-500 font-bold">단, AI에게 역전당할 수 있음!</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 점수 계산 요약 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">📊 점수 계산 요약</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                    <div className="font-bold text-yellow-600">광 점수</div>
                    <div className="text-slate-500">5광=15점, 4광=4점</div>
                    <div className="text-slate-500">3광=3점, 비3광=2점</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                    <div className="font-bold text-blue-600">고도리</div>
                    <div className="text-slate-500">2,4,8월 열끗</div>
                    <div className="text-slate-500">= 5점</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                    <div className="font-bold text-pink-600">띠 족보</div>
                    <div className="text-slate-500">홍단/청단/초단</div>
                    <div className="text-slate-500">= 각 3점</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                    <div className="font-bold text-gray-600">개수 족보</div>
                    <div className="text-slate-500">띠5+,열5+,피10+</div>
                    <div className="text-slate-500">= 1점+α</div>
                </div>
            </div>
        </div>

        {/* 초보자 팁 */}
        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl border border-purple-200 dark:border-purple-700">
            <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-2">💡 초보자 필수 팁!</h4>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex gap-2">
                    <span>1️⃣</span>
                    <span><strong>광을 최우선!</strong> 광 3장만 모아도 3점으로 거의 반은 채움</span>
                </li>
                <li className="flex gap-2">
                    <span>2️⃣</span>
                    <span><strong>고도리(2,4,8월)를 노려라!</strong> 열끗 3장으로 5점 대박</span>
                </li>
                <li className="flex gap-2">
                    <span>3️⃣</span>
                    <span><strong>피는 10장 이상!</strong> 쌍피는 2장으로 계산되어 유리</span>
                </li>
                <li className="flex gap-2">
                    <span>4️⃣</span>
                    <span><strong>매칭이 안 되면</strong> 가치 낮은 피를 버려라</span>
                </li>
                <li className="flex gap-2">
                    <span>5️⃣</span>
                    <span><strong>첫판은 스톱!</strong> 익숙해지면 고를 외쳐보세요</span>
                </li>
            </ul>
        </div>

        {/* 용어 사전 */}
        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-xl">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">📚 용어 사전</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>월:</strong> 카드의 종류(1~12)</div>
                <div><strong>바닥:</strong> 공용 카드 영역</div>
                <div><strong>매칭:</strong> 같은 월 카드 맞추기</div>
                <div><strong>획득:</strong> 카드를 가져오기</div>
                <div><strong>쌍피:</strong> 2장으로 치는 피</div>
                <div><strong>뒤집기:</strong> 덱에서 카드 뽑기</div>
            </div>
        </div>
    </div>
));


// PC 사이드바
const DesktopSidebar = memo(({ mode = 'classic' }: { mode?: 'classic' | 'reality' }) => {
    const [showRankings, setShowRankings] = useState(true);
    const [showHowTo, setShowHowTo] = useState(true);

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-pointer" onClick={() => setShowRankings(!showRankings)}>
                    <div className="flex items-center gap-2"><span className="text-lg">🎴</span><span className="font-bold text-sm">고스톱 족보</span></div>
                    <span className="material-icons-round text-lg transition-transform" style={{ transform: showRankings ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </div>
                {showRankings && <div className="p-3 max-h-[350px] overflow-y-auto"><RankingsGuide mode={mode} /></div>}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-teal-600 text-white cursor-pointer" onClick={() => setShowHowTo(!showHowTo)}>
                    <div className="flex items-center gap-2"><span className="text-lg">📖</span><span className="font-bold text-sm">게임 방법</span></div>
                    <span className="material-icons-round text-lg transition-transform" style={{ transform: showHowTo ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                </div>
                {showHowTo && <div className="p-3 max-h-[400px] overflow-y-auto"><HowToPlayGuide mode={mode} /></div>}
            </div>
        </div>
    );
});

// 메인 게임 컴포넌트
const GoStopGame: React.FC = () => {
    type GameMode = 'classic' | 'reality';
    const [gameMode, setGameMode] = useState<GameMode>('classic');
    const [phase, setPhase] = useState<GamePhase>('ready');
    const deckRef = useRef<(HwatuCard & { id: number })[]>([]);
    const [playerHand, setPlayerHand] = useState<(HwatuCard & { id: number })[]>([]);
    const [aiHand, setAiHand] = useState<(HwatuCard & { id: number })[]>([]);
    const [field, setField] = useState<(HwatuCard & { id: number })[]>([]);
    const [playerCapture, setPlayerCapture] = useState<(HwatuCard & { id: number })[]>([]);
    const [aiCapture, setAiCapture] = useState<(HwatuCard & { id: number })[]>([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [goCount, setGoCount] = useState(0);
    const [message, setMessage] = useState('게임을 시작하세요!');
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [selectedCard, setSelectedCard] = useState<(HwatuCard & { id: number }) | null>(null);
    const [matchingCards, setMatchingCards] = useState<(HwatuCard & { id: number })[]>([]);
    const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

    // 모바일 가이드
    const [mobileTab, setMobileTab] = useState<'rankings' | 'howto'>('rankings');
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [deckCount, setDeckCount] = useState(0);
    const [showPlayerCapture, setShowPlayerCapture] = useState(false);
    const [showAiCapture, setShowAiCapture] = useState(false);

    // 게임 종료 체크 useEffect
    useEffect(() => {
        if (phase === 'playing' || phase === 'selectMatch') {
            // 모든 패가 소진되었는지 확인
            if (playerHand.length === 0 && aiHand.length === 0 && deckRef.current.length === 0) {
                // 최종 점수 계산
                const finalPlayerScore = calculateScore(playerCapture);
                const finalAiScore = calculateScore(aiCapture);

                setPlayerScore(finalPlayerScore);
                setAiScore(finalAiScore);

                if (finalPlayerScore > finalAiScore) {
                    setWinner('player');
                    setMessage(`🎉 승리! (${finalPlayerScore}점 vs ${finalAiScore}점)`);
                } else if (finalAiScore > finalPlayerScore) {
                    setWinner('ai');
                    setMessage(`😢 패배... (${finalPlayerScore}점 vs ${finalAiScore}점)`);
                } else {
                    setMessage(`🤝 무승부! (${finalPlayerScore}점)`);
                }
                setPhase('finished');
            }
        }
    }, [playerHand.length, aiHand.length, phase, playerCapture, aiCapture]);

    // 덱 카운트 업데이트
    useEffect(() => {
        setDeckCount(deckRef.current.length);
    });

    // 덱 셔플
    const shuffleDeck = (deck: (HwatuCard & { id: number })[]) => {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // 점수 계산
    const calculateScore = (captured: (HwatuCard & { id: number })[]) => {
        let score = 0;
        const gwangs = captured.filter(c => c.type === 'gwang');
        const yuls = captured.filter(c => c.type === 'yul');
        const ttis = captured.filter(c => c.type === 'tti');
        const pis = captured.filter(c => c.type === 'pi');

        // 광 점수
        if (gwangs.length === 5) score += 15;
        else if (gwangs.length === 4) {
            if (gwangs.some(c => c.month === 12)) score += 4; // 비광 포함
            else score += 4;
        } else if (gwangs.length === 3) {
            if (gwangs.some(c => c.month === 12)) score += 2;
            else score += 3;
        }

        // 고도리 (2,4,8월 열끗)
        const godori = [2, 4, 8].every(m => yuls.some(c => c.month === m));
        if (godori) score += 5;

        // 홍단, 청단, 초단
        const hongMonths = [1, 2, 3];
        const cheongMonths = [6, 9, 10];
        const choMonths = [4, 5, 7];
        if (hongMonths.every(m => ttis.some(c => c.month === m && c.tti === 'hong'))) score += 3;
        if (cheongMonths.every(m => ttis.some(c => c.month === m && c.tti === 'cheong'))) score += 3;
        if (choMonths.every(m => ttis.some(c => c.month === m && c.tti === 'cho'))) score += 3;

        // 띠 5장 이상
        if (ttis.length >= 5) score += 1 + (ttis.length - 5);

        // 열끗 5장 이상
        if (yuls.length >= 5) score += 1 + (yuls.length - 5);

        // 피 10장 이상 (쌍피는 2장으로 계산)
        const piCount = pis.reduce((acc, c) => acc + (c.isDouble ? 2 : 1), 0);
        if (piCount >= 10) score += 1 + (piCount - 10);

        return score;
    };

    // 모드 선택 및 게임 시작 핸들러
    const handleModeSelect = (mode: GameMode, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setGameMode(mode);
        // 상태 업데이트 보장을 위해 약간의 지연 후 시작
        setTimeout(() => {
            startGame();
        }, 50);
    };

    // 게임 시작
    const startGame = () => {
        try {
            const deck = shuffleDeck(createHwatuDeck().map((c, i) => ({ ...c, id: i })));

            // 패 분배: 각자 10장, 바닥 8장
            const pHand = deck.splice(0, 10);
            const aHand = deck.splice(0, 10);
            const fieldCards = deck.splice(0, 8);

            deckRef.current = deck;
            setPlayerHand(pHand);
            setAiHand(aHand);
            setField(fieldCards);
            setPlayerCapture([]);
            setAiCapture([]);
            setPlayerScore(0);
            setAiScore(0);
            setGoCount(0);

            // Phase 변경을 마지막에 수행
            setIsPlayerTurn(true);
            setSelectedCard(null);
            setMatchingCards([]);
            setWinner(null);
            setMessage('카드를 선택하세요!');
            setPhase('playing');
        } catch (error) {
            console.error("Game start failed:", error);
            setMessage("게임을 시작할 수 없습니다. 다시 시도해주세요.");
        }
    };

    // 카드 선택
    const handleCardClick = (card: HwatuCard & { id: number }) => {
        if (!isPlayerTurn || phase !== 'playing') return;

        // 바닥에서 매칭되는 카드 찾기
        const matches = field.filter(f => f.month === card.month);

        if (matches.length === 0) {
            // 매칭 없음 - 바닥에 버리기
            setField(prev => [...prev, card]);
            setPlayerHand(prev => prev.filter(c => c.id !== card.id));
            flipCard();
        } else if (matches.length === 1) {
            // 1개 매칭 - 자동 획득
            setPlayerCapture(prev => [...prev, card, matches[0]]);
            setField(prev => prev.filter(c => c.id !== matches[0].id));
            setPlayerHand(prev => prev.filter(c => c.id !== card.id));
            flipCard();
        } else {
            // 2개 이상 매칭 - 선택 필요
            setSelectedCard(card);
            setMatchingCards(matches);
            setPhase('selectMatch');
            setMessage('가져갈 카드를 선택하세요!');
        }
    };

    // 매칭 선택
    const handleMatchSelect = (matchCard: HwatuCard & { id: number }) => {
        if (!selectedCard) return;

        setPlayerCapture(prev => [...prev, selectedCard, matchCard]);
        setField(prev => prev.filter(c => c.id !== matchCard.id));
        setPlayerHand(prev => prev.filter(c => c.id !== selectedCard.id));
        setSelectedCard(null);
        setMatchingCards([]);
        setPhase('playing');
        flipCard();
    };

    // 덱에서 카드 뒤집기
    const flipCard = () => {
        if (deckRef.current.length === 0) {
            endTurn();
            return;
        }

        const flipped = deckRef.current.pop()!;
        const matches = field.filter(f => f.month === flipped.month);

        if (matches.length === 0) {
            setField(prev => [...prev, flipped]);
        } else if (matches.length === 1) {
            if (isPlayerTurn) {
                setPlayerCapture(prev => [...prev, flipped, matches[0]]);
            } else {
                setAiCapture(prev => [...prev, flipped, matches[0]]);
            }
            setField(prev => prev.filter(c => c.id !== matches[0].id));
        } else {
            // 여러 개 매칭 시 첫 번째 가져가기 (간단화)
            if (isPlayerTurn) {
                setPlayerCapture(prev => [...prev, flipped, matches[0]]);
            } else {
                setAiCapture(prev => [...prev, flipped, matches[0]]);
            }
            setField(prev => prev.filter(c => c.id !== matches[0].id));
        }

        endTurn();
    };

    // 턴 종료
    const endTurn = () => {
        // 점수 체크
        const pScore = calculateScore(playerCapture);
        const aScore = calculateScore(aiCapture);
        setPlayerScore(pScore);
        setAiScore(aScore);

        // 게임 종료 체크
        if (playerHand.length === 0 && aiHand.length === 0) {
            if (pScore > aScore) {
                setWinner('player');
                setMessage('🎉 승리!');
            } else if (aScore > pScore) {
                setWinner('ai');
                setMessage('😢 패배...');
            } else {
                setMessage('무승부!');
            }
            setPhase('finished');
            return;
        }

        // 7점 이상 체크 (고/스톱)
        if (isPlayerTurn && pScore >= 7) {
            setPhase('goOrStop');
            setMessage('고 하시겠습니까?');
            return;
        }

        // 턴 전환
        if (isPlayerTurn) {
            setIsPlayerTurn(false);
            setMessage('AI 턴...');
            setTimeout(aiTurn, 1000);
        } else {
            setIsPlayerTurn(true);
            setMessage('카드를 선택하세요!');
        }
    };

    // AI 턴
    const aiTurn = () => {
        if (aiHand.length === 0) {
            endTurn();
            return;
        }

        // 간단한 AI: 매칭되는 카드 우선, 없으면 아무거나
        let cardToPlay: (HwatuCard & { id: number }) | null = null;

        for (const card of aiHand) {
            const matches = field.filter(f => f.month === card.month);
            if (matches.length > 0) {
                cardToPlay = card;
                break;
            }
        }

        if (!cardToPlay) {
            cardToPlay = aiHand[0];
        }

        // 카드 내기
        const matches = field.filter(f => f.month === cardToPlay!.month);

        if (matches.length === 0) {
            setField(prev => [...prev, cardToPlay!]);
        } else {
            setAiCapture(prev => [...prev, cardToPlay!, matches[0]]);
            setField(prev => prev.filter(c => c.id !== matches[0].id));
        }

        setAiHand(prev => prev.filter(c => c.id !== cardToPlay!.id));

        // 덱에서 뒤집기
        setTimeout(() => {
            if (deckRef.current.length > 0) {
                const flipped = deckRef.current.pop()!;
                const flipMatches = field.filter(f => f.month === flipped.month);

                if (flipMatches.length === 0) {
                    setField(prev => [...prev, flipped]);
                } else {
                    setAiCapture(prev => [...prev, flipped, flipMatches[0]]);
                    setField(prev => prev.filter(c => c.id !== flipMatches[0].id));
                }
            }

            // 턴 종료
            setIsPlayerTurn(true);
            setMessage('카드를 선택하세요!');

            // 점수 업데이트
            const aScore = calculateScore(aiCapture);
            setAiScore(aScore);

            if (aiHand.length === 0 && playerHand.length === 0) {
                const pScore = calculateScore(playerCapture);
                if (pScore > aScore) {
                    setWinner('player');
                    setMessage('🎉 승리!');
                } else if (aScore > pScore) {
                    setWinner('ai');
                    setMessage('😢 패배...');
                } else {
                    setMessage('무승부!');
                }
                setPhase('finished');
            }
        }, 500);
    };

    // 고/스톱 선택
    const handleGo = () => {
        setGoCount(prev => prev + 1);
        setPhase('playing');
        setIsPlayerTurn(false);
        setMessage('AI 턴...');
        setTimeout(aiTurn, 1000);
    };

    const handleStop = () => {
        const finalScore = playerScore * (goCount + 1);
        setMessage(`🎉 스톱! 최종 점수: ${finalScore}점`);
        setWinner('player');
        setPhase('finished');
    };

    // 화투 카드 렌더링
    const renderHwatuCard = (card: HwatuCard & { id: number }, onClick?: () => void, isSelectable = false, isHighlighted = false, isHidden = false) => {
        // 이미지를 가져올 때, 피(Pi)의 경우 카드 ID나 속성을 이용하여 다른 이미지를 매핑
        let imageKey = `${card.type}-${card.month}`;

        if (card.type === 'pi') {
            // 같은 월의 피가 2~3장이므로, card.id를 이용해서 구분하거나, 
            // createHwatuDeck에서 부여된 순서를 이용해야 함.
            // 여기서는 간단히 isDouble 속성을 확인
            if (card.isDouble) {
                // 쌍피인 경우 (보통 마지막 카드)
                // 월별 쌍피 위치가 다르지만, 슬라이싱된 이미지 중 4번째(혹은 2,3번째)가 쌍피인 경우가 많음
                // 11월, 12월 등 특수 케이스 제외하고 보통 4번째가 쌍피 혹은 국진
                if (card.month === 11 || card.month === 12) imageKey = `pi-${card.month}-2`; // 쌍피용 임시 키
                else imageKey = `pi-${card.month}-2`;
            } else {
                // 일반 피
                // 첫번째 피인지 두번째 피인지 구분 필요. 
                // 하지만 데이터상 구분이 없으므로 랜덤하게 보일 수 있음.
                // card.id % 2 로 구분?
                imageKey = `pi-${card.month}`;
            }
        }

        let imagePath = isHidden ? hwatuImageMap['back'] : (hwatuImageMap[imageKey] || getGlobalHwatuImage(card.month, card.type));

        // Fallback to simpler slicing logic if map fails but we know slicing exists
        if (!isHidden && !imagePath && gameMode === 'reality') {
            // 슬라이싱된 이미지가 있으므로 최대한 매칭 시도
            // 그냥 type과 무관하게 month 기반으로 뿌릴 수도 있지만 type이 정확해야 함.
        }

        const borderColor = isHighlighted ? 'ring-4 ring-yellow-400 ring-offset-2' : '';

        // 리얼리티 모드이고 이미지가 있거나, 뒷면인 경우
        if ((gameMode === 'reality' && imagePath) || (isHidden && gameMode === 'reality')) {
            return (
                <div
                    className={`w-14 h-20 sm:w-16 sm:h-24 lg:w-20 lg:h-28 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all ${isSelectable ? 'hover:scale-110 hover:shadow-xl' : ''} ${isHighlighted ? 'scale-105' : ''} ${borderColor} bg-slate-200`}
                    onClick={onClick}
                >
                    <img
                        src={imagePath || hwatuImageMap['back']}
                        alt={isHidden ? '뒷면' : `${card.month}월 ${card.type}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        // 클래식 모드(기존 스타일) 또는 이미지가 없는 경우
        if (isHidden) {
            return (
                <div className="w-14 h-20 sm:w-16 sm:h-24 lg:w-20 lg:h-28 bg-gradient-to-br from-red-700 to-red-900 border-2 border-slate-300 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl sm:text-4xl">🎴</span>
                </div>
            );
        }

        const bgColor = card.type === 'gwang' ? 'bg-gradient-to-br from-yellow-200 to-yellow-400'
            : card.type === 'yul' ? 'bg-gradient-to-br from-blue-100 to-blue-300'
                : card.type === 'tti' ? (card.tti === 'hong' ? 'bg-gradient-to-br from-red-100 to-red-300' : card.tti === 'cheong' ? 'bg-gradient-to-br from-blue-100 to-blue-300' : 'bg-gradient-to-br from-green-100 to-green-300')
                    : 'bg-gradient-to-br from-gray-100 to-gray-300';

        const styledBorderColor = isHighlighted ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-slate-300';

        return (
            <div
                className={`w-14 h-20 sm:w-16 sm:h-24 lg:w-20 lg:h-28 ${bgColor} ${styledBorderColor} border-2 rounded-xl flex flex-col items-center justify-center shadow-lg cursor-pointer transition-all ${isSelectable ? 'hover:scale-110 hover:shadow-xl' : ''} ${isHighlighted ? 'scale-105' : ''}`}
                onClick={onClick}
            >
                <span className="text-xl sm:text-2xl">{monthEmojis[card.month]}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{card.month}월</span>
                <span className={`text-[10px] sm:text-xs font-bold ${card.type === 'gwang' ? 'text-yellow-700'
                    : card.type === 'tti' && card.tti === 'hong' ? 'text-red-600'
                        : card.type === 'tti' && card.tti === 'cheong' ? 'text-blue-600'
                            : card.type === 'tti' ? 'text-green-600'
                                : 'text-gray-600'
                    }`}>
                    {card.type === 'gwang' ? '光' : card.type === 'yul' ? '열' : card.type === 'tti' ? (card.tti === 'hong' ? '홍' : card.tti === 'cheong' ? '청' : card.tti === 'cho' ? '초' : '띠') : '피'}
                </span>
            </div>
        );
    };

    // 모바일 모달
    const MobileModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">고스톱 가이드</span>
                        <button onClick={() => setShowMobileModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><span className="material-icons-round">close</span></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setMobileTab('rankings')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'rankings' ? 'bg-white text-orange-600' : 'bg-white/20 hover:bg-white/30'}`}>🎴 족보</button>
                        <button onClick={() => setMobileTab('howto')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'howto' ? 'bg-white text-orange-600' : 'bg-white/20 hover:bg-white/30'}`}>📖 게임방법</button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    {mobileTab === 'rankings' ? <RankingsGuide mode={gameMode} /> : <HowToPlayGuide mode={gameMode} />}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 w-full min-h-screen p-2 sm:p-4 overflow-y-auto pb-24">
            {/* 메인 게임 영역 */}
            <div className="flex-1 flex flex-col items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
                {/* 점수 & 가이드 버튼 */}
                <div className="flex justify-between items-center w-full px-4">
                    <div className="flex items-center gap-4">
                        <div className="text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                            나: <span className="text-orange-600">{playerScore}</span>점
                            <span className="ml-2 text-xs font-normal text-slate-400">({gameMode === 'classic' ? '클래식' : '리얼리티'})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-800 dark:from-slate-400 dark:to-white">
                            AI: <span className="text-blue-600">{aiScore}</span>점
                        </div>
                        <button onClick={() => setShowMobileModal(true)} className="lg:hidden p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <span className="material-icons-round">menu_book</span>
                        </button>
                    </div>
                </div>

                {/* AI 패 (뒷면) */}
                <div className="text-center w-full">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">AI ({aiHand.length}장)</div>
                    <div className="flex gap-1 justify-center flex-wrap">
                        {aiHand.map((card, i) => (
                            <React.Fragment key={card.id}>
                                {renderHwatuCard(card, undefined, false, false, true)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* 바닥 패 */}
                <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-4 w-full shadow-2xl border-4 border-green-600/50 relative">
                    <div className="flex justify-between items-center text-sm text-green-200 mb-2">
                        <span>바닥 ({field.length}장)</span>
                        <span className="bg-green-900/50 px-2 py-1 rounded-lg text-xs">
                            🃏 덱: {deckCount}장 남음
                        </span>
                    </div>
                    <div className="flex gap-2 justify-center flex-wrap min-h-[100px] items-center">
                        {field.length > 0 ? (
                            field.map(card => (
                                <React.Fragment key={card.id}>
                                    {renderHwatuCard(
                                        card,
                                        phase === 'selectMatch' && matchingCards.some(m => m.id === card.id)
                                            ? () => handleMatchSelect(card)
                                            : undefined,
                                        phase === 'selectMatch' && matchingCards.some(m => m.id === card.id),
                                        matchingCards.some(m => m.id === card.id)
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="text-green-200">바닥에 카드가 없습니다</div>
                        )}
                    </div>
                </div>

                {/* 메시지 */}
                <div className={`text-lg sm:text-xl font-bold text-center px-6 py-3 rounded-xl shadow-lg ${winner === 'player' ? 'text-green-600 bg-green-100 dark:bg-green-900/50' :
                    winner === 'ai' ? 'text-red-600 bg-red-100 dark:bg-red-900/50' :
                        'text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80'
                    }`}>
                    {message}
                    {goCount > 0 && <span className="ml-2 text-orange-500">(고 {goCount}회)</span>}
                </div>

                {/* 내 패 */}
                <div className="text-center w-full">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">내 패 ({playerHand.length}장)</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {playerHand.map(card => (
                            <React.Fragment key={card.id}>
                                {renderHwatuCard(card, () => handleCardClick(card), isPlayerTurn && phase === 'playing')}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* 획득한 카드 - 플레이어 */}
                <div className="w-full bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 shadow-lg">
                    <button
                        onClick={() => setShowPlayerCapture(!showPlayerCapture)}
                        className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 mb-2"
                    >
                        <span>
                            🎴 내 획득:
                            <span className="ml-2 text-yellow-600">{playerCapture.filter(c => c.type === 'gwang').length}광</span>
                            <span className="ml-1 text-blue-600">{playerCapture.filter(c => c.type === 'yul').length}열</span>
                            <span className="ml-1 text-red-600">{playerCapture.filter(c => c.type === 'tti').length}띠</span>
                            <span className="ml-1 text-gray-600">{playerCapture.filter(c => c.type === 'pi').reduce((a, c) => a + (c.isDouble ? 2 : 1), 0)}피</span>
                        </span>
                        <span className="material-icons-round text-lg transition-transform" style={{ transform: showPlayerCapture ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                    </button>
                    {showPlayerCapture && playerCapture.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {/* 광 */}
                            {playerCapture.filter(c => c.type === 'gwang').length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                                    <div className="text-xs text-yellow-600 font-bold mb-1">광 ({playerCapture.filter(c => c.type === 'gwang').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {playerCapture.filter(c => c.type === 'gwang').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* 열 */}
                            {playerCapture.filter(c => c.type === 'yul').length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                    <div className="text-xs text-blue-600 font-bold mb-1">열 ({playerCapture.filter(c => c.type === 'yul').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {playerCapture.filter(c => c.type === 'yul').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* 띠 */}
                            {playerCapture.filter(c => c.type === 'tti').length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                    <div className="text-xs text-red-600 font-bold mb-1">띠 ({playerCapture.filter(c => c.type === 'tti').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {playerCapture.filter(c => c.type === 'tti').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* 피 */}
                            {playerCapture.filter(c => c.type === 'pi').length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2">
                                    <div className="text-xs text-gray-600 font-bold mb-1">피 ({playerCapture.filter(c => c.type === 'pi').reduce((a, c) => a + (c.isDouble ? 2 : 1), 0)})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {playerCapture.filter(c => c.type === 'pi').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AI 획득 카드 */}
                <div className="w-full bg-slate-100/80 dark:bg-slate-700/80 rounded-xl p-3 shadow-lg">
                    <button
                        onClick={() => setShowAiCapture(!showAiCapture)}
                        className="w-full flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-2"
                    >
                        <span>
                            🤖 AI 획득:
                            <span className="ml-2 text-yellow-600">{aiCapture.filter(c => c.type === 'gwang').length}광</span>
                            <span className="ml-1 text-blue-600">{aiCapture.filter(c => c.type === 'yul').length}열</span>
                            <span className="ml-1 text-red-600">{aiCapture.filter(c => c.type === 'tti').length}띠</span>
                            <span className="ml-1 text-gray-600">{aiCapture.filter(c => c.type === 'pi').reduce((a, c) => a + (c.isDouble ? 2 : 1), 0)}피</span>
                        </span>
                        <span className="material-icons-round text-lg transition-transform" style={{ transform: showAiCapture ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                    </button>
                    {showAiCapture && aiCapture.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {aiCapture.filter(c => c.type === 'gwang').length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                                    <div className="text-xs text-yellow-600 font-bold mb-1">광 ({aiCapture.filter(c => c.type === 'gwang').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {aiCapture.filter(c => c.type === 'gwang').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {aiCapture.filter(c => c.type === 'yul').length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                    <div className="text-xs text-blue-600 font-bold mb-1">열 ({aiCapture.filter(c => c.type === 'yul').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {aiCapture.filter(c => c.type === 'yul').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {aiCapture.filter(c => c.type === 'tti').length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                    <div className="text-xs text-red-600 font-bold mb-1">띠 ({aiCapture.filter(c => c.type === 'tti').length})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {aiCapture.filter(c => c.type === 'tti').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {aiCapture.filter(c => c.type === 'pi').length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2">
                                    <div className="text-xs text-gray-600 font-bold mb-1">피 ({aiCapture.filter(c => c.type === 'pi').reduce((a, c) => a + (c.isDouble ? 2 : 1), 0)})</div>
                                    <div className="flex flex-wrap gap-1">
                                        {aiCapture.filter(c => c.type === 'pi').map(card => (
                                            <div key={card.id} className="w-8 h-12 rounded overflow-hidden shadow-sm">
                                                {renderHwatuCard(card, undefined, false, false, false)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 컨트롤 버튼 */}
                {phase === 'ready' && (
                    <div className="flex flex-col items-center gap-6 p-8 bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">게임 스타일 선택</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">원하시는 화투 디자인을 선택하세요</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                            <button
                                onClick={(e) => handleModeSelect('classic', e)}
                                className={`flex-1 group relative p-6 rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden border-4 ${gameMode === 'classic' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                            >
                                <div className="text-4xl mb-4 group-hover:animate-bounce">🌲</div>
                                <div className="font-bold text-lg dark:text-white">클래식 모드</div>
                                <div className="text-xs text-slate-500 mt-1 italic">이모지 스타일 디자인</div>
                                {gameMode === 'classic' && <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-lg"><span className="material-icons-round text-sm">check</span></div>}
                            </button>

                            <button
                                onClick={(e) => handleModeSelect('reality', e)}
                                className={`flex-1 group relative p-6 rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden border-4 ${gameMode === 'reality' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                            >
                                <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform h-10 flex items-center justify-center">
                                    <img src="/hwatu/hwatu_1_gwang_1768309213000.png" alt="preview" className="h-full rounded shadow-sm" />
                                </div>
                                <div className="font-bold text-lg dark:text-white">리얼리티 모드</div>
                                <div className="text-xs text-slate-500 mt-1 italic">실제 전통 화투 이미지</div>
                                {gameMode === 'reality' && <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1 shadow-lg"><span className="material-icons-round text-sm">check</span></div>}
                            </button>
                        </div>

                        <div className="text-slate-400 text-[10px] mt-2 italic">* 리얼리티 모드의 일부 카드는 제작중으로 클래식 스타일로 대체될 수 있습니다.</div>
                    </div>
                )}

                {phase === 'goOrStop' && (
                    <div className="flex gap-4">
                        <button onClick={handleGo} className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-105">
                            🔥 고!
                        </button>
                        <button onClick={handleStop} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-105">
                            ✋ 스톱
                        </button>
                    </div>
                )}

                {phase === 'finished' && (
                    <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-105">
                        🔄 다시 하기
                    </button>
                )}
            </div>

            {/* PC 가이드 사이드바 */}
            <div className="hidden lg:block w-80 shrink-0">
                <DesktopSidebar mode={gameMode} />
            </div>

            {/* 모바일 모달 */}
            {showMobileModal && <MobileModal />}
        </div>
    );
};

export default GoStopGame;
