
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
