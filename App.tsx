
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Community from './pages/Community';
import Guestbook from './pages/Guestbook';
import GameZone from './pages/GameZone';
import { Search, Bell } from 'lucide-react';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col bg-[#f9f9fb] dark:bg-slate-900 min-h-screen transition-colors">
        {/* sia.kr 전용 헤더 */}
        <header className="h-[72px] flex-shrink-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 flex items-center justify-between z-50 sticky top-0 lg:static transition-colors">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 clickup-gradient rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-purple-100 dark:shadow-purple-900/30 text-lg">S</div>
              <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">sia.kr</span>
            </Link>
            <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-1.5 border border-slate-100 dark:border-slate-600 w-64">
              <Search size={16} className="text-slate-400 mr-2" />
              <input type="text" placeholder="명령어 또는 기능 검색..." className="bg-transparent text-xs font-medium outline-none w-full text-slate-600 dark:text-slate-200 placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-6 mr-6">
              <Link to="/" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">전체보기</Link>
              <Link to="/community" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">커뮤니티</Link>
              <Link to="/guestbook" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">방명록</Link>
              <Link to="/gamezone" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Game Zone</Link>
            </nav>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Bell size={18} /></button>
              <img src="/admin_avatar.png" alt="관리자" className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-700" />
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/community" element={<Community />} />
            <Route path="/guestbook" element={<Guestbook />} />
            <Route path="/gamezone" element={<GameZone />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
