import React, { useState, useCallback } from 'react';

// 퀴즈 게임 (한국어 어려운 버전)
const QuizGame = () => {
    const quizData = [
        // 역사
        { question: "조선을 건국한 왕은?", options: ["이성계", "왕건", "주몽", "김유신"], answer: 0, category: "역사" },
        { question: "임진왜란이 일어난 해는?", options: ["1592년", "1453년", "1910년", "1636년"], answer: 0, category: "역사" },
        { question: "광개토대왕릉비가 있는 곳은?", options: ["중국 지린성", "평양", "경주", "서울"], answer: 0, category: "역사" },
        { question: "조선의 마지막 왕은?", options: ["순종", "고종", "철종", "헌종"], answer: 0, category: "역사" },
        { question: "한글을 창제한 왕은?", options: ["세종대왕", "태종", "정조", "영조"], answer: 0, category: "역사" },
        { question: "을사늑약이 체결된 해는?", options: ["1905년", "1910년", "1895년", "1919년"], answer: 0, category: "역사" },

        // 과학
        { question: "물의 화학식은?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0, category: "과학" },
        { question: "빛의 속도는 약 몇 km/s?", options: ["300,000", "150,000", "500,000", "1,000,000"], answer: 0, category: "과학" },
        { question: "DNA를 구성하는 염기가 아닌 것은?", options: ["우라실", "아데닌", "구아닌", "티민"], answer: 0, category: "과학" },
        { question: "지구에서 가장 가까운 항성은?", options: ["태양", "프록시마 센타우리", "시리우스", "베텔게우스"], answer: 0, category: "과학" },
        { question: "원자번호 79번 원소는?", options: ["금(Au)", "은(Ag)", "구리(Cu)", "철(Fe)"], answer: 0, category: "과학" },
        { question: "절대영도는 섭씨 몇 도?", options: ["-273.15°C", "-100°C", "-459.67°C", "0°C"], answer: 0, category: "과학" },

        // 지리
        { question: "세계에서 가장 긴 강은?", options: ["나일강", "아마존강", "양쯔강", "미시시피강"], answer: 0, category: "지리" },
        { question: "일본의 수도는?", options: ["도쿄", "오사카", "교토", "나고야"], answer: 0, category: "지리" },
        { question: "세계에서 가장 높은 산은?", options: ["에베레스트", "K2", "칸첸중가", "로체"], answer: 0, category: "지리" },
        { question: "대한민국의 면적은 약?", options: ["100,000km²", "50,000km²", "200,000km²", "150,000km²"], answer: 0, category: "지리" },
        { question: "가장 넓은 바다는?", options: ["태평양", "대서양", "인도양", "북극해"], answer: 0, category: "지리" },

        // 문학
        { question: "춘향전의 남자 주인공은?", options: ["이몽룡", "춘향", "변학도", "방자"], answer: 0, category: "문학" },
        { question: "'무정'의 작가는?", options: ["이광수", "김동인", "현진건", "채만식"], answer: 0, category: "문학" },
        { question: "윤동주의 대표 시집은?", options: ["하늘과 바람과 별과 시", "님의 침묵", "진달래꽃", "청록집"], answer: 0, category: "문학" },

        // 수학/논리
        { question: "원주율(π)의 처음 5자리는?", options: ["3.1415", "3.1416", "3.1417", "3.1414"], answer: 0, category: "수학" },
        { question: "1부터 100까지의 합은?", options: ["5050", "5000", "5100", "4950"], answer: 0, category: "수학" },
        { question: "피보나치 수열에서 8 다음 수는?", options: ["13", "12", "14", "15"], answer: 0, category: "수학" },

        // 예술/문화
        { question: "'별이 빛나는 밤'을 그린 화가는?", options: ["반 고흐", "모네", "피카소", "다빈치"], answer: 0, category: "예술" },
        { question: "베토벤의 교향곡 9번의 별칭은?", options: ["합창", "영웅", "운명", "전원"], answer: 0, category: "예술" },
        { question: "세계 3대 영화제가 아닌 것은?", options: ["토론토", "칸", "베니스", "베를린"], answer: 0, category: "예술" },

        // IT/기술
        { question: "HTTP는 무엇의 약자?", options: ["Hypertext Transfer Protocol", "High Tech Transfer Protocol", "Hyper Terminal Transfer Protocol", "Home Text Transfer Protocol"], answer: 0, category: "IT" },
        { question: "최초의 컴퓨터 프로그래머는?", options: ["에이다 러브레이스", "앨런 튜링", "찰스 배비지", "빌 게이츠"], answer: 0, category: "IT" },
        { question: "이진수 1010은 십진수로?", options: ["10", "8", "12", "11"], answer: 0, category: "IT" },

        // 스포츠
        { question: "축구 월드컵이 4년마다 열리기 시작한 해는?", options: ["1930년", "1950년", "1920년", "1940년"], answer: 0, category: "스포츠" },
        { question: "올림픽 오륜기의 색이 아닌 것은?", options: ["보라", "빨강", "노랑", "파랑"], answer: 0, category: "스포츠" },
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [shuffledQuizzes, setShuffledQuizzes] = useState<typeof quizData>([]);
    const [gameOver, setGameOver] = useState(false);

    const startGame = useCallback(() => {
        const shuffled = [...quizData]
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
            .map(q => {
                // Shuffle options but keep track of correct answer
                const correctOption = q.options[q.answer];
                const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
                const newAnswer = shuffledOptions.indexOf(correctOption);
                return { ...q, options: shuffledOptions, answer: newAnswer };
            });
        setShuffledQuizzes(shuffled);
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setGameOver(false);
    }, []);

    const handleAnswer = useCallback((answerIndex: number) => {
        if (showResult) return;

        const correct = answerIndex === shuffledQuizzes[currentQuestion].answer;
        setSelectedAnswer(answerIndex);
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            const streakBonus = streak >= 3 ? 20 : streak >= 2 ? 10 : 0;
            setScore(s => s + 10 + streakBonus);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }
    }, [currentQuestion, shuffledQuizzes, showResult, streak]);

    const nextQuestion = useCallback(() => {
        if (currentQuestion < shuffledQuizzes.length - 1) {
            setCurrentQuestion(c => c + 1);
            setShowResult(false);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            setGameOver(true);
        }
    }, [currentQuestion, shuffledQuizzes.length]);

    if (shuffledQuizzes.length === 0) {
        return (
            <div className="flex flex-col items-center gap-6 p-4 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">🧠 어려운 상식 퀴즈</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 text-center">역사, 과학, 문학, IT 등 다양한 분야의 어려운 문제!</p>
                <button onClick={startGame} className="px-10 py-5 bg-purple-500 text-white text-xl lg:text-2xl font-bold rounded-xl hover:bg-purple-400 active:bg-purple-400">
                    퀴즈 시작
                </button>
            </div>
        );
    }

    if (gameOver) {
        const grade = score >= 90 ? '천재' : score >= 70 ? '수재' : score >= 50 ? '평범' : '노력 필요';
        return (
            <div className="flex flex-col items-center gap-6 p-4 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">퀴즈 완료!</h2>
                <div className="text-7xl lg:text-8xl font-black text-purple-500">{score}점</div>
                <div className="text-2xl text-slate-600 dark:text-slate-300">등급: {grade}</div>
                <button onClick={startGame} className="px-10 py-5 bg-purple-500 text-white text-xl font-bold rounded-xl hover:bg-purple-400 active:bg-purple-400">
                    다시 도전
                </button>
            </div>
        );
    }

    const quiz = shuffledQuizzes[currentQuestion];

    return (
        <div className="flex flex-col items-center gap-4 lg:gap-6 p-4 w-full max-w-3xl mx-auto">
            <div className="flex justify-between w-full text-base lg:text-xl">
                <span className="font-bold text-slate-800 dark:text-white">문제 {currentQuestion + 1}/10</span>
                <span className="font-bold text-purple-500">점수: {score}</span>
                {streak >= 2 && <span className="font-bold text-orange-500">🔥 {streak}연속!</span>}
            </div>

            <div className="text-sm lg:text-base text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                {quiz.category}
            </div>

            <div className="text-lg lg:text-2xl font-bold text-center text-slate-800 dark:text-white p-6 lg:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full">
                {quiz.question}
            </div>

            <div className="grid grid-cols-1 gap-3 lg:gap-4 w-full">
                {quiz.options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showResult}
                        className={`p-4 lg:p-5 text-base lg:text-lg font-medium rounded-xl transition-all text-left active:scale-[0.98]
                            ${showResult && i === quiz.answer ? 'bg-green-500 text-white' : ''}
                            ${showResult && i === selectedAnswer && i !== quiz.answer ? 'bg-red-500 text-white' : ''}
                            ${!showResult ? 'bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900 active:bg-purple-200 text-slate-800 dark:text-white' : ''}
                            ${showResult && i !== quiz.answer && i !== selectedAnswer ? 'opacity-50' : ''}
                        `}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {showResult && (
                <div className="text-center">
                    <div className={`text-2xl lg:text-3xl font-bold mb-3 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrect ? '✅ 정답!' : '❌ 오답!'}
                    </div>
                    <button onClick={nextQuestion} className="px-8 py-4 bg-purple-500 text-white text-lg lg:text-xl font-bold rounded-lg hover:bg-purple-400 active:bg-purple-400">
                        {currentQuestion < shuffledQuizzes.length - 1 ? '다음 문제' : '결과 보기'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizGame;
