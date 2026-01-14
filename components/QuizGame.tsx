import React, { useState, useCallback } from 'react';

// 퀴즈 게임 (한국어 어려운 버전)
const QuizGame = () => {
    const quizData = [
        // ===== 역사 (20문제) =====
        { question: "조선을 건국한 왕은?", options: ["이성계", "왕건", "주몽", "김유신"], answer: 0, category: "역사" },
        { question: "임진왜란이 일어난 해는?", options: ["1592년", "1453년", "1910년", "1636년"], answer: 0, category: "역사" },
        { question: "광개토대왕릉비가 있는 곳은?", options: ["중국 지린성", "평양", "경주", "서울"], answer: 0, category: "역사" },
        { question: "조선의 마지막 왕은?", options: ["순종", "고종", "철종", "헌종"], answer: 0, category: "역사" },
        { question: "한글을 창제한 왕은?", options: ["세종대왕", "태종", "정조", "영조"], answer: 0, category: "역사" },
        { question: "을사늑약이 체결된 해는?", options: ["1905년", "1910년", "1895년", "1919년"], answer: 0, category: "역사" },
        { question: "고려를 건국한 인물은?", options: ["왕건", "궁예", "견훤", "이성계"], answer: 0, category: "역사" },
        { question: "삼국통일을 이룬 나라는?", options: ["신라", "고구려", "백제", "가야"], answer: 0, category: "역사" },
        { question: "병인양요가 일어난 해는?", options: ["1866년", "1871년", "1882년", "1894년"], answer: 0, category: "역사" },
        { question: "을지문덕이 활약한 전투는?", options: ["살수대첩", "귀주대첩", "한산도대첩", "행주대첩"], answer: 0, category: "역사" },
        { question: "동학농민운동이 일어난 해는?", options: ["1894년", "1884년", "1904년", "1874년"], answer: 0, category: "역사" },
        { question: "조선시대 과거 시험의 최고 등급은?", options: ["장원", "갑과", "을과", "진사"], answer: 0, category: "역사" },
        { question: "프랑스 혁명이 일어난 해는?", options: ["1789년", "1776년", "1804년", "1815년"], answer: 0, category: "역사" },
        { question: "제2차 세계대전이 끝난 해는?", options: ["1945년", "1944년", "1946년", "1943년"], answer: 0, category: "역사" },
        { question: "미국 독립선언서가 발표된 해는?", options: ["1776년", "1783년", "1789년", "1765년"], answer: 0, category: "역사" },
        { question: "러시아 혁명이 일어난 해는?", options: ["1917년", "1918년", "1905년", "1921년"], answer: 0, category: "역사" },
        { question: "독일 통일이 이루어진 해는?", options: ["1990년", "1989년", "1991년", "1988년"], answer: 0, category: "역사" },
        { question: "콜럼버스가 아메리카에 도착한 해는?", options: ["1492년", "1498년", "1500년", "1488년"], answer: 0, category: "역사" },
        { question: "이집트 피라미드 건설시기는?", options: ["기원전 2600년경", "기원전 1000년경", "기원전 500년경", "기원전 3500년경"], answer: 0, category: "역사" },
        { question: "로마 제국이 멸망한 해는?", options: ["476년", "410년", "395년", "500년"], answer: 0, category: "역사" },

        // ===== 과학 (20문제) =====
        { question: "물의 화학식은?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0, category: "과학" },
        { question: "빛의 속도는 약 몇 km/s?", options: ["300,000", "150,000", "500,000", "1,000,000"], answer: 0, category: "과학" },
        { question: "DNA를 구성하는 염기가 아닌 것은?", options: ["우라실", "아데닌", "구아닌", "티민"], answer: 0, category: "과학" },
        { question: "지구에서 가장 가까운 항성은?", options: ["태양", "프록시마 센타우리", "시리우스", "베텔게우스"], answer: 0, category: "과학" },
        { question: "원자번호 79번 원소는?", options: ["금(Au)", "은(Ag)", "구리(Cu)", "철(Fe)"], answer: 0, category: "과학" },
        { question: "절대영도는 섭씨 몇 도?", options: ["-273.15°C", "-100°C", "-459.67°C", "0°C"], answer: 0, category: "과학" },
        { question: "태양계에서 가장 큰 행성은?", options: ["목성", "토성", "해왕성", "천왕성"], answer: 0, category: "과학" },
        { question: "인체에서 가장 큰 장기는?", options: ["피부", "간", "폐", "심장"], answer: 0, category: "과학" },
        { question: "뉴턴의 운동 제1법칙은?", options: ["관성의 법칙", "가속도의 법칙", "작용반작용 법칙", "만유인력 법칙"], answer: 0, category: "과학" },
        { question: "인간의 염색체 수는?", options: ["46개", "23개", "48개", "44개"], answer: 0, category: "과학" },
        { question: "공기 중 가장 많은 기체는?", options: ["질소", "산소", "이산화탄소", "아르곤"], answer: 0, category: "과학" },
        { question: "플랑크 상수의 단위는?", options: ["J·s", "J/s", "kg·m²", "N·m"], answer: 0, category: "과학" },
        { question: "지구의 나이는 약?", options: ["46억 년", "40억 년", "50억 년", "35억 년"], answer: 0, category: "과학" },
        { question: "소리가 전달되지 않는 곳은?", options: ["진공", "물속", "금속 안", "공기 중"], answer: 0, category: "과학" },
        { question: "세포의 에너지 생산을 담당하는 소기관은?", options: ["미토콘드리아", "리보솜", "골지체", "소포체"], answer: 0, category: "과학" },
        { question: "화씨 212도는 섭씨 몇 도?", options: ["100°C", "0°C", "212°C", "50°C"], answer: 0, category: "과학" },
        { question: "아인슈타인의 유명한 공식 E=mc²에서 c는?", options: ["빛의 속도", "전하량", "질량", "에너지"], answer: 0, category: "과학" },
        { question: "헬륨의 원자번호는?", options: ["2", "1", "4", "8"], answer: 0, category: "과학" },
        { question: "pH 7은 무엇을 의미하는가?", options: ["중성", "산성", "염기성", "알칼리성"], answer: 0, category: "과학" },
        { question: "광합성에서 생성되는 기체는?", options: ["산소", "이산화탄소", "질소", "수소"], answer: 0, category: "과학" },

        // ===== 지리 (15문제) =====
        { question: "세계에서 가장 긴 강은?", options: ["나일강", "아마존강", "양쯔강", "미시시피강"], answer: 0, category: "지리" },
        { question: "일본의 수도는?", options: ["도쿄", "오사카", "교토", "나고야"], answer: 0, category: "지리" },
        { question: "세계에서 가장 높은 산은?", options: ["에베레스트", "K2", "칸첸중가", "로체"], answer: 0, category: "지리" },
        { question: "대한민국의 면적은 약?", options: ["100,000km²", "50,000km²", "200,000km²", "150,000km²"], answer: 0, category: "지리" },
        { question: "가장 넓은 바다는?", options: ["태평양", "대서양", "인도양", "북극해"], answer: 0, category: "지리" },
        { question: "세계에서 가장 큰 사막은?", options: ["사하라 사막", "고비 사막", "아라비아 사막", "칼라하리 사막"], answer: 0, category: "지리" },
        { question: "세계에서 인구가 가장 많은 나라는?", options: ["중국", "인도", "미국", "인도네시아"], answer: 0, category: "지리" },
        { question: "호주의 수도는?", options: ["캔버라", "시드니", "멜버른", "브리즈번"], answer: 0, category: "지리" },
        { question: "세계에서 가장 작은 나라는?", options: ["바티칸", "모나코", "산마리노", "리히텐슈타인"], answer: 0, category: "지리" },
        { question: "아마존 열대우림이 위치한 대륙은?", options: ["남아메리카", "아프리카", "아시아", "오세아니아"], answer: 0, category: "지리" },
        { question: "지중해와 대서양을 연결하는 해협은?", options: ["지브롤터 해협", "말라카 해협", "대한해협", "도버 해협"], answer: 0, category: "지리" },
        { question: "한반도에서 가장 높은 산은?", options: ["백두산", "한라산", "지리산", "설악산"], answer: 0, category: "지리" },
        { question: "브라질의 수도는?", options: ["브라질리아", "상파울루", "리우데자네이루", "살바도르"], answer: 0, category: "지리" },
        { question: "세계에서 가장 깊은 호수는?", options: ["바이칼호", "탕가니카호", "카스피해", "빅토리아호"], answer: 0, category: "지리" },
        { question: "스위스의 수도는?", options: ["베른", "취리히", "제네바", "바젤"], answer: 0, category: "지리" },

        // ===== 문학 (15문제) =====
        { question: "춘향전의 남자 주인공은?", options: ["이몽룡", "춘향", "변학도", "방자"], answer: 0, category: "문학" },
        { question: "'무정'의 작가는?", options: ["이광수", "김동인", "현진건", "채만식"], answer: 0, category: "문학" },
        { question: "윤동주의 대표 시집은?", options: ["하늘과 바람과 별과 시", "님의 침묵", "진달래꽃", "청록집"], answer: 0, category: "문학" },
        { question: "'돈키호테'의 작가는?", options: ["세르반테스", "셰익스피어", "괴테", "톨스토이"], answer: 0, category: "문학" },
        { question: "'노인과 바다'의 작가는?", options: ["헤밍웨이", "피츠제럴드", "스타인벡", "포크너"], answer: 0, category: "문학" },
        { question: "노벨문학상을 수상한 한국인 작가는?", options: ["없음", "이광수", "김동인", "황순원"], answer: 0, category: "문학" },
        { question: "'햄릿'에서 '생이냐 죽이냐'를 말한 인물은?", options: ["햄릿", "오필리아", "클로디우스", "호레이쇼"], answer: 0, category: "문학" },
        { question: "'이상한 나라의 앨리스' 작가는?", options: ["루이스 캐럴", "찰스 디킨스", "마크 트웨인", "오스카 와일드"], answer: 0, category: "문학" },
        { question: "'죄와 벌'의 작가는?", options: ["도스토예프스키", "톨스토이", "체호프", "투르게네프"], answer: 0, category: "문학" },
        { question: "'어린 왕자'의 작가는?", options: ["생텍쥐페리", "빅토르 위고", "알베르 카뮈", "장 폴 사르트르"], answer: 0, category: "문학" },
        { question: "한국 최초의 한글 소설은?", options: ["홍길동전", "춘향전", "구운몽", "사씨남정기"], answer: 0, category: "문학" },
        { question: "'변신'의 주인공이 변한 동물은?", options: ["벌레", "쥐", "개미", "거미"], answer: 0, category: "문학" },
        { question: "'1984'의 작가는?", options: ["조지 오웰", "올더스 헉슬리", "레이 브래드버리", "아이작 아시모프"], answer: 0, category: "문학" },
        { question: "'레미제라블'의 주인공은?", options: ["장발장", "쟈베르", "코제트", "마리우스"], answer: 0, category: "문학" },
        { question: "'해리 포터' 시리즈의 작가는?", options: ["J.K. 롤링", "C.S. 루이스", "J.R.R. 톨킨", "로알드 달"], answer: 0, category: "문학" },

        // ===== 수학/논리 (15문제) =====
        { question: "원주율(π)의 처음 5자리는?", options: ["3.1415", "3.1416", "3.1417", "3.1414"], answer: 0, category: "수학" },
        { question: "1부터 100까지의 합은?", options: ["5050", "5000", "5100", "4950"], answer: 0, category: "수학" },
        { question: "피보나치 수열에서 8 다음 수는?", options: ["13", "12", "14", "15"], answer: 0, category: "수학" },
        { question: "2의 10승은?", options: ["1024", "1000", "2048", "512"], answer: 0, category: "수학" },
        { question: "정육면체의 면 수는?", options: ["6", "4", "8", "12"], answer: 0, category: "수학" },
        { question: "삼각형 내각의 합은?", options: ["180°", "360°", "90°", "270°"], answer: 0, category: "수학" },
        { question: "로그(log)10 1000은?", options: ["3", "2", "4", "10"], answer: 0, category: "수학" },
        { question: "허수 단위 i의 제곱은?", options: ["-1", "1", "0", "-i"], answer: 0, category: "수학" },
        { question: "1광년은 무엇의 단위인가?", options: ["거리", "시간", "속도", "질량"], answer: 0, category: "수학" },
        { question: "소수(prime number)가 아닌 것은?", options: ["9", "2", "3", "7"], answer: 0, category: "수학" },
        { question: "원의 넓이 공식은?", options: ["πr²", "2πr", "πr", "πd"], answer: 0, category: "수학" },
        { question: "직각삼각형에서 빗변과 직각변의 관계는?", options: ["피타고라스 정리", "삼각비", "사인법칙", "코사인법칙"], answer: 0, category: "수학" },
        { question: "팩토리얼 5!(5팩토리얼)은?", options: ["120", "24", "60", "720"], answer: 0, category: "수학" },
        { question: "무리수가 아닌 것은?", options: ["0.5", "√2", "π", "e"], answer: 0, category: "수학" },
        { question: "정팔면체의 꼭짓점 수는?", options: ["6", "8", "12", "4"], answer: 0, category: "수학" },

        // ===== 예술/문화 (15문제) =====
        { question: "'별이 빛나는 밤'을 그린 화가는?", options: ["반 고흐", "모네", "피카소", "다빈치"], answer: 0, category: "예술" },
        { question: "베토벤의 교향곡 9번의 별칭은?", options: ["합창", "영웅", "운명", "전원"], answer: 0, category: "예술" },
        { question: "세계 3대 영화제가 아닌 것은?", options: ["토론토", "칸", "베니스", "베를린"], answer: 0, category: "예술" },
        { question: "'모나리자'를 그린 화가는?", options: ["레오나르도 다빈치", "미켈란젤로", "라파엘로", "보티첼리"], answer: 0, category: "예술" },
        { question: "'백조의 호수' 작곡가는?", options: ["차이콥스키", "베토벤", "모차르트", "바흐"], answer: 0, category: "예술" },
        { question: "피카소가 창시한 미술 사조는?", options: ["입체주의", "인상주의", "초현실주의", "표현주의"], answer: 0, category: "예술" },
        { question: "오페라 '카르멘'의 작곡가는?", options: ["비제", "베르디", "푸치니", "바그너"], answer: 0, category: "예술" },
        { question: "다빈치의 '최후의 만찬'이 있는 도시는?", options: ["밀라노", "로마", "피렌체", "베네치아"], answer: 0, category: "예술" },
        { question: "세계에서 가장 유명한 박물관은?", options: ["루브르 박물관", "대영 박물관", "메트로폴리탄 박물관", "에르미타쥐 박물관"], answer: 0, category: "예술" },
        { question: "교향곡 '신세계로부터'의 작곡가는?", options: ["드보르작", "말러", "브루크너", "시벨리우스"], answer: 0, category: "예술" },
        { question: "팝아트의 대표 작가는?", options: ["앤디 워홀", "잭슨 폴록", "마크 로스코", "윌렘 드 쿠닝"], answer: 0, category: "예술" },
        { question: "'게르니카'를 그린 화가는?", options: ["피카소", "달리", "미로", "고야"], answer: 0, category: "예술" },
        { question: "오페라 '나비 부인'의 작곡가는?", options: ["푸치니", "베르디", "바그너", "로시니"], answer: 0, category: "예술" },
        { question: "한국의 전통 음악 장르가 아닌 것은?", options: ["재즈", "판소리", "가야금 산조", "시나위"], answer: 0, category: "예술" },
        { question: "영화 '기생충'의 감독은?", options: ["봉준호", "박찬욱", "김기덕", "이창동"], answer: 0, category: "예술" },

        // ===== IT/기술 (15문제) =====
        { question: "HTTP는 무엇의 약자?", options: ["Hypertext Transfer Protocol", "High Tech Transfer Protocol", "Hyper Terminal Transfer Protocol", "Home Text Transfer Protocol"], answer: 0, category: "IT" },
        { question: "최초의 컴퓨터 프로그래머는?", options: ["에이다 러브레이스", "앨런 튜링", "찰스 배비지", "빌 게이츠"], answer: 0, category: "IT" },
        { question: "이진수 1010은 십진수로?", options: ["10", "8", "12", "11"], answer: 0, category: "IT" },
        { question: "인터넷의 전신은?", options: ["ARPANET", "WWW", "Ethernet", "TCP/IP"], answer: 0, category: "IT" },
        { question: "애플의 창업자는?", options: ["스티브 잡스", "빌 게이츠", "마크 저커버그", "래리 페이지"], answer: 0, category: "IT" },
        { question: "CPU는 무엇의 약자?", options: ["Central Processing Unit", "Computer Power Unit", "Central Program Unit", "Core Processing Unit"], answer: 0, category: "IT" },
        { question: "1바이트는 몇 비트?", options: ["8", "4", "16", "32"], answer: 0, category: "IT" },
        { question: "Python을 만든 사람은?", options: ["귀도 반 로섬", "제임스 고슬링", "데니스 리치", "브렌던 아이크"], answer: 0, category: "IT" },
        { question: "HTML에서 H는 무엇의 약자?", options: ["Hypertext", "Home", "High", "Hyper"], answer: 0, category: "IT" },
        { question: "세계 최초의 검색 엔진은?", options: ["아키", "야후", "구글", "알타비스타"], answer: 0, category: "IT" },
        { question: "USB는 무엇의 약자?", options: ["Universal Serial Bus", "United System Bus", "User Storage Base", "Universal Storage Bus"], answer: 0, category: "IT" },
        { question: "AI의 풀네임은?", options: ["Artificial Intelligence", "Automated Intelligence", "Advanced Internet", "Auto Information"], answer: 0, category: "IT" },
        { question: "Linux 운영체제를 만든 사람은?", options: ["리누스 토르발스", "빌 게이츠", "스티브 잡스", "데니스 리치"], answer: 0, category: "IT" },
        { question: "JavaScript를 만든 사람은?", options: ["브렌던 아이크", "제임스 고슬링", "귀도 반 로섬", "데니스 리치"], answer: 0, category: "IT" },
        { question: "SQL은 무엇의 약자?", options: ["Structured Query Language", "Standard Query Language", "System Query Logic", "Simple Query Language"], answer: 0, category: "IT" },

        // ===== 스포츠 (15문제) =====
        { question: "축구 월드컵이 4년마다 열리기 시작한 해는?", options: ["1930년", "1950년", "1920년", "1940년"], answer: 0, category: "스포츠" },
        { question: "올림픽 오륜기의 색이 아닌 것은?", options: ["보라", "빨강", "노랑", "파랑"], answer: 0, category: "스포츠" },
        { question: "농구의 창시자는?", options: ["제임스 네이스미스", "월터 캠프", "윌리엄 모건", "에이브너 더블데이"], answer: 0, category: "스포츠" },
        { question: "테니스 4대 메이저 대회가 아닌 것은?", options: ["마이애미 오픈", "윔블던", "US 오픈", "프렌치 오픈"], answer: 0, category: "스포츠" },
        { question: "마라톤의 거리는?", options: ["42.195km", "40km", "45km", "50km"], answer: 0, category: "스포츠" },
        { question: "골프에서 파보다 1타 적은 것은?", options: ["버디", "이글", "보기", "알바트로스"], answer: 0, category: "스포츠" },
        { question: "축구에서 해트트릭은 몇 골?", options: ["3골", "2골", "4골", "5골"], answer: 0, category: "스포츠" },
        { question: "수영에서 가장 빠른 영법은?", options: ["자유형", "배영", "평영", "접영"], answer: 0, category: "스포츠" },
        { question: "야구에서 완전 경기는?", options: ["27명 연속 아웃", "노히트 노런", "완투승", "삼진 게임"], answer: 0, category: "스포츠" },
        { question: "UFC는 어떤 스포츠 단체?", options: ["종합격투기", "복싱", "레슬링", "유도"], answer: 0, category: "스포츠" },
        { question: "올림픽에서 메달을 가장 많이 딴 나라는?", options: ["미국", "러시아", "중국", "영국"], answer: 0, category: "스포츠" },
        { question: "e스포츠가 정식 종목으로 채택된 대회는?", options: ["아시안게임", "올림픽", "월드컵", "세계선수권"], answer: 0, category: "스포츠" },
        { question: "축구에서 레드카드를 받으면?", options: ["퇴장", "경고", "페널티킥", "프리킥"], answer: 0, category: "스포츠" },
        { question: "NBA 농구 코트의 3점 라인 거리는 약?", options: ["7.24m", "6.75m", "5.5m", "8m"], answer: 0, category: "스포츠" },
        { question: "배드민턴 셔틀콕의 깃털 개수는?", options: ["16개", "12개", "14개", "18개"], answer: 0, category: "스포츠" },
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
