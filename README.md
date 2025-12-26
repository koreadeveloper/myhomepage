<div align="center">
  <img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  # 🏠 My Smart Homepage (sia.kr)

  <p>
    <strong>아름답고 강력한 나만의 웹 대시보드 & 커뮤니티</strong>
    <br />
    생산성 도구와 인사이트로 하루를 활기차게 시작하세요.
  </p>

  <p>
    <a href="#key-features">주요 기능</a> •
    <a href="#built-with">기술 스택</a> •
    <a href="#getting-started">시작하기</a> •
    <a href="#screenshots">스크린샷</a>
  </p>

  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

## 📋 프로젝트 소개

**My Smart Homepage**는 브라우저 시작 페이지를 대체할 수 있는 모던하고 반응형인 웹 애플리케이션입니다. 개인 생산성 도구, 실시간 정보 위젯, 그리고 커뮤니티 기능을 투명하고 세련된 Glassmorphism 디자인으로 통합했습니다.

현재 **Serverless/Local Mode**로 작동하며, 브라우저의 `localStorage`를 활용하여 복잡한 백엔드 설정 없이 즉시 개인용으로 사용할 수 있습니다.

---

## ✨ 주요 기능

### 🖥️ 스마트 대시보드 (홈)
- **실시간 정보**: 🕒 디지털 시계, 🌤️ 날씨 (서울/부산), 💰 암호화폐 시세 (BTC/ETH).
- **생산성 도구**: 
  - ✅ **할 일 목록(Todo)**: 간편한 일정 관리.
  - 🍅 **포모도로 타이머**: 집중력을 높이는 타이머.
  - 📝 **퀵 메모**: 떠오르는 아이디어를 즉시 기록.
- **유틸리티**: 
  - 🧮 **계산기**: 웹에서 바로 쓰는 간편 계산기.
  - 🔡 **글자수 세기**: 공백 포함/제외 글자수 확인.
  - 🛡️ **비밀번호 생성기**: 강력한 보안 비밀번호 생성.
  - 💻 **시스템 정보**: 내 IP 주소 및 기기 정보 확인.
  - 🔧 **JSON 포맷터**: JSON 데이터 정렬 및 압축.

### 💬 커뮤니티 & 소셜
- **커뮤니티 게시판**: 자유롭게 글을 쓰고 공유하는 공간.
- **방명록**: 방문 흔적을 남기고 소통하는 공간.
- *참고: 현재 모든 데이터는 개인 정보 보호와 속도를 위해 브라우저에 로컬 저장됩니다.*

### 🎨 최신 UI/UX 디자인
- **글래스모피즘 (Glassmorphism)**: 반투명한 카드와 블러 효과를 적용한 고급스러운 디자인.
- **반응형 레이아웃**: 데스크탑, 태블릿, 모바일 등 모든 기기에서 완벽하게 작동.
- **인터랙티브 요소**: 부드러운 호버 효과와 전환 애니메이션.

---

## 🛠️ 기술 스택 (Built With)

*   **Core**: React, TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM

---

## 🚀 시작하기 (Getting Started)

로컬 환경에서 프로젝트를 실행하려면 다음 단계를 따르세요.

### 필수 사항

*   Node.js (v18 이상 권장)
*   npm

### 설치 및 실행

1.  **저장소 클론(Clone)**
    ```sh
    git clone https://github.com/koreadeveloper/myhomepage.git
    cd myhomepage
    ```

2.  **패키지 설치**
    ```sh
    npm install
    # 또는
    yarn install
    ```

3.  **개발 서버 실행**
    ```sh
    npm run dev
    ```

4.  **브라우저 확인**
    `http://localhost:5173` 주소로 접속하여 나만의 홈페이지를 확인하세요!

---

## 📂 프로젝트 구조

```bash
myhomepage/
├── src/
│   ├── components/     # 재사용 가능한 UI 컴포넌트 (모달 등)
│   ├── pages/          # 메인 페이지 (홈, 커뮤니티, 방명록)
│   ├── services/       # API 및 로직 처리 (날씨, 암호화폐 등)
│   ├── types.ts        # TypeScript 타입 정의
│   ├── App.tsx         # 메인 앱 레이아웃 및 라우팅
│   └── main.tsx        # 진입점 (Entry point)
├── public/             # 정적 리소스 (이미지 등)
└── ...설정 파일들
```

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

<div align="center">
  <br />
  <p>Made with ❤️ by <strong>koreadeveloper</strong></p>
</div>
