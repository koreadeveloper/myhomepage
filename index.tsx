
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 테마 초기화: 저장된 선택 우선, 없으면 시스템 설정 (first-paint 반영)
const savedTheme = localStorage.getItem('theme');
const initialDark = savedTheme !== null
  ? savedTheme === 'dark'
  : window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', initialDark);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA: 프로덕션에서만 서비스 워커 등록 (개발 환경 캐시 꼬임 방지)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* 무시 */ });
  });
}
