import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface SiteProfile {
    nickname: string;
    status_message: string;
    avatar_url: string;
}

export interface SiteBanner {
    text: string;
    subtext: string;
    bg_color: string;
}

const DEFAULT_PROFILE: SiteProfile = {
    nickname: '게스트',
    status_message: '환영합니다!',
    avatar_url: ''
};

const DEFAULT_BANNER: SiteBanner = {
    text: '당신의 스마트한 공간 , sia.kr',
    subtext: '자유롭게 소통하고 게임도 즐기세요!',
    bg_color: 'clickup-gradient' // css class or usage
};

export const useSiteSettings = () => {
    const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
    const [banner, setBanner] = useState<SiteBanner>(DEFAULT_BANNER);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();

        // Optional: Subscribe to changes for real-time updates
        const subscription = supabase
            .channel('site_settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
                const newData = payload.new as any;
                if (newData.key === 'profile') setProfile(newData.value);
                if (newData.key === 'banner') setBanner(newData.value);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (data) {
                const profileData = data.find(item => item.key === 'profile');
                const bannerData = data.find(item => item.key === 'banner');

                if (profileData && profileData.value) {
                    setProfile(profileData.value);
                } else {
                    // DB에 값이 없으면 기본값으로 초기화 시도 또는 기본값 유지
                    setProfile(DEFAULT_PROFILE);
                }

                if (bannerData && bannerData.value) {
                    setBanner(bannerData.value);
                }
            }
        } catch (error) {
            console.error('Failed to fetch site settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return { profile, banner, loading };
};
