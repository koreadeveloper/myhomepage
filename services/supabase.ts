
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경변수가 없어도 앱은 렌더되어야 한다 — 클라이언트는 설정된 경우에만 생성
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Missing Supabase environment variables — game score logging disabled');
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
