
import React, { useState, useEffect } from 'react';
import MidnightCafe from './MidnightCafe';
import Sidebar from '../components/Sidebar';
import FreeBoard from '../components/FreeBoard';

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cafe' | 'board'>('cafe');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      <main className="flex-grow overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
        {/* Mobile menu trigger */}
        {!isMobileSidebarOpen && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden absolute top-4 left-4 z-40 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-100 dark:border-slate-700"
          >
            <span className="material-icons-round text-slate-600 dark:text-slate-300">menu</span>
          </button>
        )}

        <div className="h-full overflow-y-auto w-full">
          <div className="max-w-5xl mx-auto py-8 px-4 pb-24">
            {/* 헤더 */}
            <div className="text-center mb-8 pt-8 lg:pt-0">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                🏘️ 커뮤니티
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                소통과 공감의 광장
              </p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex justify-center mb-8">
              <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex shadow-sm">
                <button
                  onClick={() => setActiveTab('cafe')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'cafe'
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  {isDarkMode ? '🌙 심야 카페 (Live)' : '💬 실시간 채팅 (Live)'}
                </button>
                <button
                  onClick={() => setActiveTab('board')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'board'
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  📋 자유게시판
                </button>
              </div>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="h-full">
              {activeTab === 'cafe' ? (
                <MidnightCafe isDarkMode={isDarkMode} />
              ) : (
                <FreeBoard isDarkMode={isDarkMode} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
