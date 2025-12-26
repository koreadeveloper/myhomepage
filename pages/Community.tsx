
import React, { useState, useEffect } from 'react';
import { Coffee, Moon, CloudRain, Flame, Heart } from 'lucide-react';

// 타입 정의
interface Whisper {
  id: string;
  content: string;
  moodIcon: string;
  author: string;
  reactionCount: number;
  createdAt: number;
}

// 감정 아이콘
const MOOD_ICONS = [
  { id: 'coffee', emoji: '☕️', label: '커피', icon: Coffee },
  { id: 'moon', emoji: '🌙', label: '달', icon: Moon },
  { id: 'rain', emoji: '🌧️', label: '비', icon: CloudRain },
  { id: 'fire', emoji: '🔥', label: '모닥불', icon: Flame },
];

// 랜덤 닉네임
const RANDOM_NAMES = [
  '새벽의 고양이', '잠 못 드는 부엉이', '달빛 아래 나그네',
  '고요한 바다', '불면증 환자', '새벽 2시의 손님',
  '밤을 걷는 여행자', '별을 세는 사람', '꿈꾸는 유령',
  '차가운 커피', '흐릿한 기억', '조용한 방문자',
];

// 상대 시간 계산
const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

const Community: React.FC = () => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('coffee');
  const [showEntrance, setShowEntrance] = useState(true);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [newWhisperId, setNewWhisperId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('midnight_cafe_whispers');
    if (saved) setWhispers(JSON.parse(saved));

    // 입장 모달 표시 여부
    const entered = sessionStorage.getItem('midnight_cafe_entered');
    if (entered) setShowEntrance(false);
  }, []);

  const saveWhispers = (newWhispers: Whisper[]) => {
    setWhispers(newWhispers);
    localStorage.setItem('midnight_cafe_whispers', JSON.stringify(newWhispers));
  };

  // 랜덤 닉네임 생성
  const getRandomName = () => RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];

  // 속삭이기 작성
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newWhisper: Whisper = {
      id: Date.now().toString(),
      content: content.slice(0, 140),
      moodIcon: selectedMood,
      author: getRandomName(),
      reactionCount: 0,
      createdAt: Date.now(),
    };

    setNewWhisperId(newWhisper.id);
    setTimeout(() => setNewWhisperId(null), 1000);

    saveWhispers([newWhisper, ...whispers]);
    setContent('');
  };

  // 끄덕이기 리액션
  const handleReaction = (id: string) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 1500);

    saveWhispers(whispers.map(w =>
      w.id === id ? { ...w, reactionCount: w.reactionCount + 1 } : w
    ));
  };

  // 입장하기
  const handleEnter = () => {
    setShowEntrance(false);
    sessionStorage.setItem('midnight_cafe_entered', 'true');
  };

  const getMoodEmoji = (id: string) => MOOD_ICONS.find(m => m.id === id)?.emoji || '☕️';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212' }}>
      {/* 입장 모달 */}
      {showEntrance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🌙</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#E0E0E0', fontFamily: 'Georgia, serif' }}>
              심야 카페
            </h2>
            <p className="text-sm mb-8" style={{ color: '#A0A0A0' }}>
              새벽 2시, 잠 못 드는 이들이 모인 조용한 라운지
            </p>
            <button
              onClick={handleEnter}
              className="px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: '#FFB347',
                color: '#121212',
                boxShadow: '0 0 20px rgba(255, 179, 71, 0.4)'
              }}
            >
              입장하기
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12 pb-24">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#E0E0E0', fontFamily: 'Georgia, serif' }}>
            🌙 심야 카페
          </h1>
          <p className="text-sm" style={{ color: '#A0A0A0' }}>
            무슨 생각을 하고 계신가요?
          </p>
        </div>

        {/* 작성 영역 */}
        <div
          className="p-6 rounded-2xl mb-8"
          style={{
            backgroundColor: '#1E1E1E',
            border: '1px solid #333333',
            boxShadow: '0 0 30px rgba(255, 179, 71, 0.1)'
          }}
        >
          {/* 감정 선택 */}
          <div className="flex gap-2 mb-4">
            {MOOD_ICONS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`w-10 h-10 rounded-xl text-xl transition-all ${selectedMood === mood.id ? 'scale-110' : 'opacity-50 hover:opacity-80'
                  }`}
                style={{
                  backgroundColor: selectedMood === mood.id ? '#333' : 'transparent',
                  boxShadow: selectedMood === mood.id ? '0 0 10px rgba(255, 179, 71, 0.3)' : 'none'
                }}
              >
                {mood.emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 140))}
              placeholder="주문하시겠어요? (140자)"
              className="w-full p-4 rounded-xl resize-none outline-none text-sm"
              style={{
                backgroundColor: '#2A2A2A',
                color: '#E0E0E0',
                border: '1px solid #333',
                fontFamily: 'Georgia, serif',
                height: '100px'
              }}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs" style={{ color: '#A0A0A0' }}>
                {content.length}/140
              </span>
              <button
                type="submit"
                className="px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: '#FFB347',
                  color: '#121212',
                  boxShadow: '0 0 15px rgba(255, 179, 71, 0.3)'
                }}
              >
                속삭이기 ✨
              </button>
            </div>
          </form>
        </div>

        {/* 속삭임 목록 */}
        <div className="space-y-4">
          {whispers.map((whisper) => (
            <div
              key={whisper.id}
              className={`p-5 rounded-2xl transition-all duration-500 ${newWhisperId === whisper.id ? 'animate-fadeIn' : ''
                }`}
              style={{
                backgroundColor: '#1E1E1E',
                border: '1px solid #333333',
                opacity: newWhisperId === whisper.id ? 0 : 1,
                animation: newWhisperId === whisper.id ? 'fadeIn 0.5s ease forwards' : 'none'
              }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMoodEmoji(whisper.moodIcon)}</span>
                  <span className="text-sm font-medium" style={{ color: '#FFB347' }}>
                    {whisper.author}
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#A0A0A0' }}>
                  {getRelativeTime(whisper.createdAt)}
                </span>
              </div>

              {/* 내용 */}
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: '#E0E0E0', fontFamily: 'Georgia, serif' }}
              >
                {whisper.content}
              </p>

              {/* 리액션 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReaction(whisper.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#2A2A2A',
                    color: '#A0A0A0',
                    border: '1px solid #333'
                  }}
                >
                  <span className={`transition-all ${animatingId === whisper.id ? 'animate-bounce' : ''}`}>
                    ☕️
                  </span>
                  <span>끄덕이기</span>
                  {whisper.reactionCount > 0 && (
                    <span style={{ color: '#FFB347' }}>{whisper.reactionCount}</span>
                  )}
                </button>

                {/* 김모락 애니메이션 */}
                {animatingId === whisper.id && (
                  <div className="text-lg animate-pulse">☁️</div>
                )}
              </div>
            </div>
          ))}

          {whispers.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌙</div>
              <p style={{ color: '#A0A0A0' }}>아직 아무도 속삭이지 않았어요...</p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>첫 번째 손님이 되어주세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 페이드인 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Community;
