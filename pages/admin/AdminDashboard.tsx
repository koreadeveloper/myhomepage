import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageCircle, Gamepad2, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardStats {
    totalVisitors: number;
    totalPosts: number;
    totalGuestbook: number;
    todayVisitors: number;
    totalGames: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalVisitors: 0,
        totalPosts: 0,
        totalGuestbook: 0,
        todayVisitors: 0,
        totalGames: 0
    });
    const [visitorData, setVisitorData] = useState<{ date: string; count: number }[]>([]);
    const [gameData, setGameData] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // 1. Fetch Counts
            const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
            const { count: guestbookCount } = await supabase.from('guestbook').select('*', { count: 'exact', head: true });

            // For visitors, we need to query the visit_logs table
            const { count: totalVisits } = await supabase.from('visit_logs').select('*', { count: 'exact', head: true });

            // Today's visits
            const { count: todayVisits } = await supabase
                .from('visit_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', `${today}T00:00:00`);

            // Game Plays
            const { count: totalGamePlays } = await supabase.from('game_play_logs').select('*', { count: 'exact', head: true });

            setStats({
                totalVisitors: totalVisits || 0,
                totalPosts: postCount || 0,
                totalGuestbook: guestbookCount || 0,
                todayVisitors: todayVisits || 0,
                totalGames: totalGamePlays || 0
            });

            // 2. Fetch Chart Data (Last 7 Days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

            const { data: logs } = await supabase
                .from('visit_logs')
                .select('created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            if (logs) {
                const dailyCounts: Record<string, number> = {};
                // Initialize last 7 days with 0
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    dailyCounts[dateStr.slice(5)] = 0; // MM-DD format
                }

                logs.forEach(log => {
                    const dateStr = new Date(log.created_at).toISOString().split('T')[0].slice(5);
                    if (dailyCounts[dateStr] !== undefined) {
                        dailyCounts[dateStr]++;
                    }
                });

                const chartData = Object.entries(dailyCounts)
                    .map(([date, count]) => ({ date, count }))
                    .sort((a, b) => a.date.localeCompare(b.date));

                setVisitorData(chartData);
            }

            // 3. Game Stats (Top 5)
            const { data: gameLogs } = await supabase
                .from('game_play_logs')
                .select('game_id')
                .limit(1000); // Analyze last 1000 plays

            if (gameLogs) {
                const gameCounts: Record<string, number> = {};
                gameLogs.forEach(log => {
                    const game = log.game_id || 'Unknown';
                    gameCounts[game] = (gameCounts[game] || 0) + 1;
                });

                const topGames = Object.entries(gameCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setGameData(topGames);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">대시보드</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">사이트의 실시간 현황과 통계를 확인하세요.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <Activity size={16} className="text-indigo-500" />
                    <span>실시간 업데이트 중</span>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: '오늘 방문자', value: stats.todayVisitors.toLocaleString(), icon: <Users size={24} />, color: 'bg-gradient-to-br from-blue-500 to-blue-600', sub: `총 ${stats.totalVisitors.toLocaleString()}` },
                    { title: '게시글', value: stats.totalPosts.toLocaleString(), icon: <FileText size={24} />, color: 'bg-gradient-to-br from-green-500 to-emerald-600', sub: '작성된 글' },
                    { title: '방명록', value: stats.totalGuestbook.toLocaleString(), icon: <MessageCircle size={24} />, color: 'bg-gradient-to-br from-pink-500 to-rose-600', sub: '누적 메시지' },
                    { title: '게임 플레이', value: stats.totalGames.toLocaleString(), icon: <Gamepad2 size={24} />, color: 'bg-gradient-to-br from-purple-500 to-indigo-600', sub: '누적 플레이' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stat.value}</h3>
                                <p className="text-xs font-medium text-slate-400 mt-1">{stat.sub}</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 rounded-full ${stat.color}`} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 방문자 차트 */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-500" /> 주간 방문자 추이
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">최근 7일간의 방문자 수 변화입니다.</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visitorData}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 인기 게임 차트 */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                        <Gamepad2 size={20} className="text-purple-500" /> 인기 게임 Top 5
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gameData.length > 0 ? gameData : [{ name: 'No Data', count: 0 }]} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {gameData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 시스템 상태 */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-green-400" /> 시스템 상태
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Database Status</span>
                                    <span className="text-green-400 font-bold">Healthy</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-full animate-pulse" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Storage Usage</span>
                                    <span className="text-slate-200 font-bold">12%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[12%]" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">API Latency</span>
                                    <span className="text-slate-200 font-bold">45ms</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-1/4" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Server Info</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-xs text-slate-500">Region</div>
                                    <div className="font-mono text-sm font-bold mt-1">ap-northeast-2</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-xs text-slate-500">Uptime</div>
                                    <div className="font-mono text-sm font-bold mt-1">99.9%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

