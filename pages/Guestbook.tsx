
import React, { useState, useEffect } from 'react';
import { Lock, Trash2, MessageCircle, Pin } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../services/supabase';
import { checkIsBanned, getVisitorIpInfo } from '../services/api';

// 타입 정의
interface GuestbookEntry {
  id: string;
  nickname: string;
  avatar_id: string;
  content: string;
  password: string;
  is_secret: boolean;
  is_stamp: boolean;
  created_at: string;
  admin_reply?: {
    content: string;
    repliedAt: number;
  };
  is_pinned?: boolean;
}

// 아바타 목록
const AVATARS = [
  { id: 'cat', emoji: '🐱', label: '고양이' },
  { id: 'dog', emoji: '🐶', label: '강아지' },
  { id: 'ghost', emoji: '👻', label: '유령' },
  { id: 'slime', emoji: '🟢', label: '슬라임' },
  { id: 'robot', emoji: '🤖', label: '로봇' },
  { id: 'alien', emoji: '👾', label: '외계인' },
];

// 스탬프 목록
const STAMPS = [
  { id: 'lurking', emoji: '👀', label: '눈팅중' },
  { id: 'nice', emoji: '👍', label: '잘봤어요' },
  { id: 'check', emoji: '✅', label: '출석체크' },
  { id: 'cool', emoji: '✨', label: '멋져요' },
];

// 말풍선 색상
const BUBBLE_COLORS = [
  'bg-blue-100 dark:bg-blue-900/40',
  'bg-pink-100 dark:bg-pink-900/40',
  'bg-green-100 dark:bg-green-900/40',
  'bg-yellow-100 dark:bg-yellow-900/40',
  'bg-purple-100 dark:bg-purple-900/40',
];

const Guestbook: React.FC = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('cat');
  const [isSecret, setIsSecret] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showAnimation, setShowAnimation] = useState<string | null>(null);

  // Sidebar & Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Theme init
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) document.documentElement.classList.add('dark');

    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching guestbook:', error);
    else setEntries(data || []);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !content || !password) return;
    if (content.length > 100) return;

    if (content.length > 100) return;

    // Ban Check
    const visitor = await getVisitorIpInfo();
    const banStatus = await checkIsBanned(visitor.ip, nickname);
    if (banStatus.banned) {
      alert(`차단된 사용자입니다.\n사유: ${banStatus.reason}`);
      return;
    }

    const newEntry = {
      nickname,
      avatar_id: selectedAvatar,
      content,
      password,
      is_secret: isSecret,
      is_stamp: false,
    };

    const { data, error } = await supabase.from('guestbook').insert([newEntry]).select();

    if (error) {
      alert('작성 실패: ' + error.message);
    } else if (data) {
      const inserted = data[0] as GuestbookEntry;
      setShowAnimation(inserted.id);
      setTimeout(() => setShowAnimation(null), 500);
      setEntries([inserted, ...entries]);
      setContent('');
      setIsSecret(false);
    }
  };

  const handleStamp = async (stamp: typeof STAMPS[0]) => {
    if (!nickname || !password) {
      alert('닉네임과 비밀번호를 먼저 입력해주세요!');
      return;
    }

    // Ban Check
    const visitor = await getVisitorIpInfo();
    const banStatus = await checkIsBanned(visitor.ip, nickname);
    if (banStatus.banned) {
      alert(`차단된 사용자입니다.\n사유: ${banStatus.reason}`);
      return;
    }

    const newEntry = {
      nickname,
      avatar_id: selectedAvatar,
      content: `${stamp.emoji} ${stamp.label}`,
      password,
      is_secret: false,
      is_stamp: true,
    };

    const { data, error } = await supabase.from('guestbook').insert([newEntry]).select();

    if (error) {
      alert('작성 실패: ' + error.message);
    } else if (data) {
      const inserted = data[0] as GuestbookEntry;
      setShowAnimation(inserted.id);
      setTimeout(() => setShowAnimation(null), 500);
      setEntries([inserted, ...entries]);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // 클라이언트단 비밀번호 확인 (간이)
    // 실제로는 RLS나 서버 함수로 처리하는 것이 안전하지만, 편의상 DB에서 비밀번호 조회 후 비교
    const { data } = await supabase
      .from('guestbook')
      .select('password')
      .eq('id', deleteId)
      .single();

    if (data && data.password === deletePassword) {
      const { error } = await supabase.from('guestbook').delete().eq('id', deleteId);
      if (error) {
        alert('삭제 실패: ' + error.message);
      } else {
        setEntries(entries.filter(e => e.id !== deleteId));
        setDeleteId(null);
        setDeletePassword('');
        alert('삭제되었습니다.');
      }
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0; // 이미 최신순 fetch 됨
  });

  const getAvatar = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
  const getBubbleColor = (index: number) => BUBBLE_COLORS[index % BUBBLE_COLORS.length];

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
          <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pt-8 pt-16">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">
                👾 픽셀 방명록
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                디지털 낙서장에 흔적을 남겨주세요!
              </p>
            </div>

            {/* 작성 영역 */}
            <div className="bg-white dark:bg-slate-800 p-6 mb-8 rounded-2xl shadow-sm border-4 border-slate-900 dark:border-slate-600"
              style={{ boxShadow: '4px 4px 0 #1e293b' }}>

              {/* 아바타 선택 */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">오늘의 기분은?</p>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${selectedAvatar === avatar.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 scale-110'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'
                        }`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-500 outline-none text-sm dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-28 p-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-500 outline-none text-sm dark:text-white"
                  />
                </div>

                <div className="relative">
                  <textarea
                    placeholder="따뜻한 한마디를 남겨주세요... (100자)"
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 100))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-500 outline-none h-24 resize-none text-sm dark:text-white"
                  />
                  <span className="absolute bottom-2 right-2 text-[10px] text-slate-400">{content.length}/100</span>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSecret}
                      onChange={(e) => setIsSecret(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      <Lock size={12} className="inline mr-1" />주인장만 보기
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-black dark:hover:bg-indigo-700 transition-all"
                    style={{ boxShadow: '2px 2px 0 #6366f1' }}
                  >
                    작성하기 ✍️
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 mb-2">빠른 스탬프</p>
                <div className="flex gap-2 flex-wrap">
                  {STAMPS.map(stamp => (
                    <button
                      key={stamp.id}
                      onClick={() => handleStamp(stamp)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs font-medium transition-all"
                    >
                      {stamp.emoji} {stamp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 방명록 목록 */}
            <div className="space-y-4">
              {sortedEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`relative p-4 rounded-xl border-2 border-slate-900 dark:border-slate-600 ${getBubbleColor(index)} transition-all ${showAnimation === entry.id ? 'animate-bounce' : ''
                    }`}
                  style={{ boxShadow: '3px 3px 0 #1e293b' }}
                >
                  {entry.is_pinned && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full">
                      <Pin size={12} />
                    </div>
                  )}

                  {entry.is_secret && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
                      <Lock size={14} /> 비밀글입니다 🔒
                    </div>
                  )}

                  {!entry.is_secret && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getAvatar(entry.avatar_id).emoji}</span>
                          <span className="font-black text-slate-900 dark:text-white text-sm">{entry.nickname}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <button
                          onClick={() => setDeleteId(entry.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className={`text-slate-700 dark:text-slate-200 ${entry.is_stamp ? 'text-lg font-bold' : 'text-sm'}`}>
                        {entry.content}
                      </p>

                      {entry.admin_reply && (
                        <div className="mt-3 pl-4 border-l-2 border-indigo-400">
                          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                            <MessageCircle size={12} /> 주인장
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{entry.admin_reply.content}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {entries.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👾</div>
                  <p className="text-slate-400 font-bold">아직 방명록이 비어있어요!</p>
                  <p className="text-slate-300 text-sm">첫 번째 방문자가 되어주세요~</p>
                </div>
              )}
            </div>

            {/* 삭제 모달 */}
            {deleteId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full border-4 border-slate-900 dark:border-slate-600"
                  style={{ boxShadow: '4px 4px 0 #1e293b' }}>
                  <h3 className="font-black text-lg mb-4 dark:text-white">🗑️ 삭제하기</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">작성 시 입력한 비밀번호를 입력해주세요.</p>
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg mb-4 outline-none dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDeleteId(null); setDeletePassword(''); }}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold text-sm"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Guestbook;
