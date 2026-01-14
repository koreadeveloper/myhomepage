import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rateLimit, setRateLimit] = useState(false); // Rate limiting state
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/admin/dashboard', { replace: true });
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rateLimit) return; // Prevent brute force script

        setLoading(true);
        setErrorMsg(null);

        // Basic validation
        if (!email.includes('@') || password.length < 6) {
            setErrorMsg('올바른 이메일과 비밀번호를 입력해주세요.');
            setLoading(false);
            return;
        }

        try {
            // 1. 로그인
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            if (!user) throw new Error('Auth failed'); // Generic internal error

            // 2. 관리자 권한 확인
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('role')
                .eq('id', user.id)
                .single();

            if (adminError || !adminData) {
                await supabase.auth.signOut();
                throw new Error('Unauthorized'); // Generic internal error
            }

            // 3. 대시보드로 이동
            navigate('/admin/dashboard');

        } catch (err: any) {
            console.error('Login attempt failed'); // Don't log specific error to console in production if possible, or keep internal
            // SECURITY: Use generic error message to prevent user enumeration
            setErrorMsg('이메일 또는 비밀번호가 잘못되었거나 접근 권한이 없습니다.');

            // Rate limiting: Lock button for 3 seconds
            setRateLimit(true);
            setTimeout(() => setRateLimit(false), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">MyHomepage Admin</h1>
                    <p className="text-slate-400 text-sm">기밀 구역입니다. 관계자 외 출입 금지 🚫</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs font-bold mb-2 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center animate-shake">
                            {errorMsg}
                            {rateLimit && <div className="text-xs mt-1 text-red-400">잠시 후 다시 시도해주세요.</div>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || rateLimit}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {loading ? '인증 중...' : rateLimit ? '잠시 대기...' : '시스템 접속 🚀'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                        ← 메인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
