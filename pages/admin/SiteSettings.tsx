import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Save, RefreshCw, Smartphone, Monitor } from 'lucide-react';

const SiteSettings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile Settings
    const [profile, setProfile] = useState({
        nickname: 'Kyu',
        status_message: '안녕하세요! 개발자 Kyu입니다.',
        avatar_url: '/profile.png'
    });

    // Banner Settings
    const [banner, setBanner] = useState({
        text: 'Welcome to My Homepage',
        subtext: '자유롭게 소통하고 게임도 즐기세요!',
        bg_color: 'from-indigo-500 to-purple-500' // tailwind gradient classes
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('site_settings').select('*');
        if (data) {
            const profileData = data.find(item => item.key === 'profile');
            const bannerData = data.find(item => item.key === 'banner');
            if (profileData) setProfile(profileData.value);
            if (bannerData) setBanner(bannerData.value);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const updates = [
            { key: 'profile', value: profile },
            { key: 'banner', value: banner }
        ];

        const { error } = await supabase.from('site_settings').upsert(updates);
        if (error) alert('저장 실패: ' + error.message);
        else alert('설정이 저장되었습니다!');
        setSaving(false);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">사이트 설정 (Site Config)</h2>
                    <p className="text-slate-500 dark:text-slate-400">코드 수정 없이 사이트의 주요 정보를 변경합니다.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? '저장 중...' : '변경사항 저장'}
                </button>
            </div>

            {/* 메인 배너 설정 */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Monitor size={20} className="text-indigo-500" /> 메인 배너 설정
                </h3>

                {/* 배너 미리보기 */}
                <div className={`mb-6 p-8 rounded-2xl bg-gradient-to-r ${banner.bg_color} text-white text-center shadow-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black mb-2">{banner.text}</h1>
                        <p className="text-lg opacity-90">{banner.subtext}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">메인 타이틀</label>
                        <input
                            type="text"
                            value={banner.text}
                            onChange={(e) => setBanner({ ...banner, text: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">서브 텍스트 (공지)</label>
                        <input
                            type="text"
                            value={banner.subtext}
                            onChange={(e) => setBanner({ ...banner, subtext: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-500 mb-2">배경 그라데이션 (Tailwind Class)</label>
                        <select
                            value={banner.bg_color}
                            onChange={(e) => setBanner({ ...banner, bg_color: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="from-indigo-500 to-purple-500">Indigo to Purple</option>
                            <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                            <option value="from-rose-500 to-orange-500">Rose to Orange</option>
                            <option value="from-emerald-500 to-teal-500">Emerald to Teal</option>
                            <option value="from-slate-700 to-slate-900">Dark Slate</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 프로필 설정 */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Smartphone size={20} className="text-pink-500" /> 운영자 프로필 설정
                </h3>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* 아바타 미리보기 */}
                    <div className="flex-shrink-0 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-white shadow-lg mx-auto mb-3">
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">Preview</span>
                    </div>

                    <div className="flex-grow grid grid-cols-1 gap-6 w-full">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">닉네임</label>
                            <input
                                type="text"
                                value={profile.nickname}
                                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">상태 메시지</label>
                            <input
                                type="text"
                                value={profile.status_message}
                                onChange={(e) => setProfile({ ...profile, status_message: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">아바타 URL</label>
                            <input
                                type="text"
                                value={profile.avatar_url}
                                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
                                placeholder="/images/my-avatar.png"
                            />
                            <p className="text-xs text-slate-400 mt-1">* Supabase Storage URL 또는 외부 이미지 링크</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SiteSettings;
