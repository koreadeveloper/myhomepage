import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import GameZone from './pages/GameZone';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

const navItems = [
  { to: '/#projects', label: '프로젝트' },
  { to: '/about', label: '소개' },
  { to: '/gamezone', label: '게임존' },
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Escape로 메뉴 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* 워드마크 */}
        <Link to="/" className="font-black text-xl tracking-tighter text-ink dark:text-white px-2 py-2">
          sia.kr
        </Link>

        {/* 데스크톱 글래스 내비 */}
        <nav className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="px-4 py-1.5 text-[13px] font-bold text-muted dark:text-slate-300 hover:text-ink dark:hover:text-white rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-muted dark:text-slate-300 hover:text-ink dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            className="md:hidden glass w-10 h-10 rounded-full flex items-center justify-center text-muted dark:text-slate-300"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 -z-10" onClick={() => setMenuOpen(false)} />
          <nav className="md:hidden glass rounded-3xl mt-3 mx-auto max-w-6xl p-2 flex flex-col" aria-label="모바일 메뉴">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-5 py-3.5 text-sm font-bold text-ink dark:text-white rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/gamezone" element={<GameZone />} />

        {/* 과거 주소 → 새 경로 안내 */}
        <Route path="/community" element={<Navigate to="/" replace />} />
        <Route path="/guestbook" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
