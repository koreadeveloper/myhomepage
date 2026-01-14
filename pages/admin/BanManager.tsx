import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { ShieldAlert, UserX, Trash2, Plus } from 'lucide-react';

interface BlockedUser {
    id: string;
    ip_address: string;
    nickname: string;
    reason: string;
    blocked_at: string;
}

const BanManager: React.FC = () => {
    const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);

    // Form inputs
    const [ip, setIp] = useState('');
    const [nickname, setNickname] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blocked_users')
            .select('*')
            .order('blocked_at', { ascending: false });

        if (error) console.error('Error:', error);
        else setBlockedList(data || []);
        setLoading(false);
    };

    const handleAddBan = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('blocked_users').insert([{
            ip_address: ip,
            nickname: nickname,
            reason: reason
        }]);

        if (error) {
            alert('차단 등록 실패: ' + error.message);
        } else {
            setIsAddMode(false);
            setIp(''); setNickname(''); setReason('');
            fetchData();
        }
    };

    const handleUnban = async (id: string) => {
        if (!confirm('정말 차단을 해제하시겠습니까?')) return;

        const { error } = await supabase.from('blocked_users').delete().eq('id', id);
        if (error) alert('차단 해제 실패: ' + error.message);
        else setBlockedList(blockedList.filter(user => user.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">악성 유저 차단 (Ban System)</h2>
                    <p className="text-slate-500 dark:text-slate-400">특정 IP 또는 닉네임의 접근을 제한합니다.</p>
                </div>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus size={18} /> 차단 추가
                </button>
            </div>

            {/* 차단 등록 폼 */}
            {isAddMode && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="text-red-500" /> 차단 대상 등록
                    </h3>
                    <form onSubmit={handleAddBan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="IP 주소 (예: 123.45.67.89)"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-red-500"
                        />
                        <input
                            type="text"
                            placeholder="닉네임 (선택 사항)"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-red-500"
                        />
                        <input
                            type="text"
                            placeholder="차단 사유 (예: 도배, 욕설)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-red-500"
                            required
                        />
                        <button type="submit" className="bg-slate-800 text-white font-bold rounded-lg hover:bg-black transition-colors">
                            등록하기
                        </button>
                    </form>
                </div>
            )}

            {/* 차단 목록 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {blockedList.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-4 text-slate-400">
                        <UserX size={48} className="text-slate-300 dark:text-slate-600" />
                        <p>현재 차단된 사용자가 없습니다. (클린하네요! 😊)</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="p-4 w-40">IP 주소</th>
                                <th className="p-4 w-40">닉네임</th>
                                <th className="p-4">사유</th>
                                <th className="p-4 w-40">차단 일시</th>
                                <th className="p-4 w-24 text-center">해제</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {blockedList.map((user) => (
                                <tr key={user.id} className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{user.ip_address || '-'}</td>
                                    <td className="p-4 font-bold">{user.nickname || '-'}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{user.reason}</td>
                                    <td className="p-4 text-slate-400 text-xs">{new Date(user.blocked_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleUnban(user.id)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                            title="차단 해제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BanManager;
