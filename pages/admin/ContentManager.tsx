import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Trash2, Eye, EyeOff, MessageSquare, BookOpen, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ExpandableText: React.FC<{ text: string; limit?: number }> = ({ text, limit = 100 }) => {
    const [expanded, setExpanded] = useState(false);

    if (text.length <= limit) return <span>{text}</span>;

    return (
        <div>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
                {expanded ? text : `${text.slice(0, limit)}...`}
            </p>
            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
            >
                {expanded ? (
                    <>
                        <ChevronUp size={14} /> 접기
                    </>
                ) : (
                    <>
                        <ChevronDown size={14} /> 더보기
                    </>
                )}
            </button>
        </div>
    );
};

const ContentManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'guestbook' | 'posts' | 'chat'>('guestbook');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();

        // Realtime subscription for Chat
        let channel: any;
        if (activeTab === 'chat') {
            channel = supabase
                .channel('admin_chat_monitor')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                    (payload) => {
                        setData((prev) => [payload.new, ...prev]);
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'DELETE', schema: 'public', table: 'chat_messages' },
                    (payload) => {
                        setData((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        let query;

        if (activeTab === 'guestbook') {
            query = supabase.from('guestbook').select('*').order('created_at', { ascending: false });
        } else if (activeTab === 'posts') {
            query = supabase.from('posts').select('*').order('created_at', { ascending: false });
        } else {
            query = supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(100);
        }

        const { data: result, error } = await query;
        if (error) console.error('Error fetching data:', error);
        else setData(result || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;

        const table = activeTab === 'guestbook' ? 'guestbook' : activeTab === 'posts' ? 'posts' : 'chat_messages';
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) {
            alert('삭제 실패: ' + error.message);
        } else {
            setData(data.filter(item => item.id !== id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">콘텐츠 관리</h2>
                    <p className="text-slate-500 dark:text-slate-400">게시글, 방명록, 채팅 로그를 관리합니다.</p>
                </div>
                <button onClick={fetchData} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    새로고침
                </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                {[
                    { id: 'guestbook', label: '방명록', icon: <BookOpen size={18} /> },
                    { id: 'posts', label: '자유게시판', icon: <MessageSquare size={18} /> },
                    { id: 'chat', label: '심야카페 (로그)', icon: <MessageCircle size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* 데이터 테이블 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">데이터를 불러오는 중...</div>
                ) : data.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">데이터가 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 w-40">작성자</th>
                                    <th className="p-4">내용</th>
                                    <th className="p-4 w-32">날짜</th>
                                    <th className="p-4 w-24 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {item.nickname || item.author_name || item.author || '익명'}
                                            </div>
                                            {(item.avatar_id || item.mood) && (
                                                <div className="text-xs text-slate-400">{item.avatar_id || item.mood}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="max-w-lg">
                                                {activeTab === 'posts' && <div className="font-bold mb-1">{item.title}</div>}
                                                {item.is_secret && (
                                                    <div className="text-indigo-500 font-bold text-xs mb-1 flex items-center gap-1">
                                                        <EyeOff size={12} /> 주인장만 보기 (비밀글)
                                                    </div>
                                                )}
                                                <ExpandableText text={item.content} />
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentManager;
