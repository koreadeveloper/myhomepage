
import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Moon, CloudRain, Flame, Send, User, MessageCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

// 타입 정의
interface Message {
    id: string;
    content: string;
    mood: string;
    author: string;
    created_at: string;
}

interface MidnightCafeProps {
    isDarkMode: boolean;
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
    '우주를 유영하는 먼지', '책 읽는 여우', '피아노 치는 곰',
];

const MidnightCafe: React.FC<MidnightCafeProps> = ({ isDarkMode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('coffee');
    const [nickname, setNickname] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 초기 닉네임 설정
    useEffect(() => {
        const savedName = localStorage.getItem('midnight_nickname');
        if (savedName) {
            setNickname(savedName);
        } else {
            const newName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
            setNickname(newName);
            localStorage.setItem('midnight_nickname', newName);
        }
    }, []);

    // 메시지 로드 및 구독
    useEffect(() => {
        // 초기 로드 (최근 50개)
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true }) // 채팅처럼 과거->최신 순
                .limit(50);

            if (error) console.error('Error fetching messages:', error);
            else if (data) setMessages(data);
        };

        fetchMessages();

        // 실시간 구독
        const channel = supabase
            .channel('public:chat_messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 스크롤 자동 이동 (채팅 영역만 스크롤)
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages]);

    // 메시지 전송
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const newMessage = {
            content: content.slice(0, 200),
            mood: selectedMood,
            author: nickname,
        };

        // 입력창 비우기
        setContent('');

        const { error } = await supabase.from('chat_messages').insert([newMessage]);

        if (error) {
            console.error('Error sending message:', error);
            alert('메시지 전송에 실패했습니다.');
        }
    };

    const getMoodEmoji = (id: string) => MOOD_ICONS.find(m => m.id === id)?.emoji || '☕️';

    // 테마별 스타일 정의
    const theme = isDarkMode ? {
        container: 'bg-[#121212] border-gray-800',
        header: 'bg-gradient-to-r from-slate-900 to-slate-800 border-gray-800',
        headerTitle: 'text-[#E0E0E0] font-serif',
        headerDesc: 'text-gray-400',
        userBadge: 'bg-black/30 border-gray-700 text-gray-300',
        chatArea: 'bg-[#1a1a1a] scrollbar-thumb-gray-700',
        myMessage: 'bg-[#FFB347] text-[#121212]',
        otherMessage: 'bg-[#2A2A2A] text-[#E0E0E0] border-gray-700',
        inputArea: 'bg-[#1e1e1e] border-gray-800',
        input: 'bg-[#2A2A2A] text-white border-gray-700 focus:border-[#FFB347]',
        sendButton: 'bg-[#FFB347] text-[#121212] hover:bg-[#ffcf87]',
        moodButtonActive: 'bg-[#333] border-[#FFB347] shadow-[0_0_10px_rgba(255,179,71,0.3)]',
        moodButtonInactive: 'bg-transparent border-gray-700 hover:bg-gray-800',
    } : {
        container: 'bg-white border-slate-200 shadow-xl',
        header: 'bg-white border-slate-100',
        headerTitle: 'text-slate-800 font-sans',
        headerDesc: 'text-slate-500',
        userBadge: 'bg-slate-100 border-slate-200 text-slate-600',
        chatArea: 'bg-slate-50 scrollbar-thumb-slate-300',
        myMessage: 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20',
        otherMessage: 'bg-white text-slate-700 border-slate-100 shadow-sm',
        inputArea: 'bg-white border-slate-100',
        input: 'bg-slate-50 text-slate-800 border-slate-200 focus:border-indigo-500',
        sendButton: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20',
        moodButtonActive: 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm',
        moodButtonInactive: 'bg-white border-slate-200 hover:bg-slate-50',
    };

    return (
        <div className={`flex flex-col h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] max-w-4xl mx-auto rounded-3xl overflow-hidden border transition-all duration-300 ${theme.container}`}>
            {/* 헤더 */}
            <div className={`p-6 border-b flex justify-between items-center shrink-0 ${theme.header}`}>
                <div>
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme.headerTitle}`}>
                        <span>{isDarkMode ? '🌙' : '💬'}</span>
                        {isDarkMode ? '심야 카페' : '실시간 채팅방'}
                    </h2>
                    <p className={`text-sm mt-1 ${theme.headerDesc}`}>
                        {isDarkMode ? '실시간으로 나누는 새벽 감성 대화' : '자유롭게 이야기를 나눠보세요'}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${theme.userBadge}`}>
                    <User size={14} className={isDarkMode ? "text-[#FFB347]" : "text-indigo-500"} />
                    <span className="text-sm font-medium">{nickname}</span>
                    <button
                        onClick={() => {
                            const newName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                            setNickname(newName);
                            localStorage.setItem('midnight_nickname', newName);
                        }}
                        className={`ml-2 text-xs hover:underline ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-indigo-500'}`}
                    >
                        변경
                    </button>
                </div>
            </div>

            {/* 채팅 영역 */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent ${theme.chatArea}`}>
                {messages.map((msg, index) => {
                    const isMyMessage = msg.author === nickname;
                    const showAuthor = index === 0 || messages[index - 1].author !== msg.author;

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            {showAuthor && !isMyMessage && (
                                <span className={`text-xs ml-2 mb-1 ${isDarkMode ? 'text-gray-500' : 'text-slate-400 font-medium'}`}>{msg.author}</span>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 relative group transition-all duration-200 ${isMyMessage
                                    ? `${theme.myMessage} rounded-tr-none`
                                    : `${theme.otherMessage} rounded-tl-none border`
                                    }`}
                            >
                                {!isMyMessage && (
                                    <div className={`absolute -left-2 -top-2 text-xl rounded-full p-1 border shadow-sm ${isDarkMode ? 'bg-[#121212] border-gray-700' : 'bg-white border-slate-100'}`}>
                                        {getMoodEmoji(msg.mood)}
                                    </div>
                                )}
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'font-serif' : 'font-sans'}`}>{msg.content}</p>
                                <span className={`text-[10px] mt-1 block opacity-60 text-right ${isMyMessage && !isDarkMode ? 'text-white' : ''}`}>
                                    {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className={`p-4 border-t shrink-0 ${theme.inputArea}`}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* 감정 선택 */}
                    <div className="flex gap-2">
                        {MOOD_ICONS.map(mood => (
                            <button
                                key={mood.id}
                                type="button"
                                onClick={() => setSelectedMood(mood.id)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all border ${selectedMood === mood.id ? theme.moodButtonActive : theme.moodButtonInactive
                                    }`}
                                title={mood.label}
                            >
                                {mood.emoji}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={isDarkMode ? "따뜻한 대화를 나눠보세요..." : "메시지를 입력하세요..."}
                            className={`flex-1 border rounded-xl px-4 py-3 focus:outline-none transition-colors ${theme.input}`}
                        />
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className={`rounded-xl px-5 flex items-center justify-center disabled:opacity-50 transition-all font-bold ${theme.sendButton}`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MidnightCafe;
