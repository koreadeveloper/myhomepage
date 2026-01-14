
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, toggleDarkMode, isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Button - Only visible when sidebar is closed and on mobile */}
            {!isMobileSidebarOpen && (
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="material-icons-round text-slate-600 dark:text-slate-300">menu</span>
                </button>
            )}

            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col p-6 space-y-6 overflow-y-auto z-50 fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center justify-between lg:hidden mb-2">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">메뉴</span>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">테마 설정</span>
                    <button onClick={toggleDarkMode} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-yellow-500 shadow-sm hover:bg-yellow-50'}`}>
                        <span className="material-icons-round text-sm">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><span className="material-icons-round">person</span></div>
                    <div><div className="font-bold text-sm">게스트</div><div className="text-[10px] opacity-80">환영합니다!</div></div>
                </div>

                {/* Navigation */}
                <div className="flex-1">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">M E N U</h4>
                    <nav className="space-y-2">
                        <Link to="/" className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                            <span className="material-icons-round text-xl">home</span> 홈
                        </Link>
                        <Link to="/gamezone" className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/gamezone') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                            <span className="material-icons-round text-xl">sports_esports</span> 게임존
                        </Link>
                        <Link to="/community" className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/community') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                            <span className="material-icons-round text-xl">forum</span> 커뮤니티
                        </Link>
                        <Link to="/guestbook" className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/guestbook') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                            <span className="material-icons-round text-xl">history_edu</span> 방명록
                        </Link>
                    </nav>
                </div>

                {/* Footer Info */}
                <div className="text-xs text-slate-400 dark:text-slate-600 text-center mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                    &copy; 2026 My Homepage<br />All rights reserved.
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
