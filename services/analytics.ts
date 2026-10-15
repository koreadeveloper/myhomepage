import { supabase } from './supabase';

// --- 방문자 분석 (site_visits) ---
// 세션당 1회 국가/기기 정보를 조회하고, 라우트 이동마다 pageview를 기록합니다.

const SESSION_KEY = 'sia_sid';
const GEO_KEY = 'sia_geo';

const getSessionId = (): string => {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};

const parseDevice = (ua: string): string => {
  if (/tablet|ipad/i.test(ua)) return '태블릿';
  if (/mobi|android|iphone/i.test(ua)) return '모바일';
  return '데스크톱';
};

const parseBrowser = (ua: string): string => {
  if (/edg/i.test(ua)) return 'Edge';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/whale/i.test(ua)) return 'Whale';
  return '기타';
};

interface GeoInfo { country: string; country_code: string; city: string; }

let geoPromise: Promise<GeoInfo | null> | null = null;

// 국가는 세션당 한 번만 조회해 캐시 (무료 ipwho.is, 키 불필요)
const getGeo = (): Promise<GeoInfo | null> => {
  const cached = sessionStorage.getItem(GEO_KEY);
  if (cached) {
    try { return Promise.resolve(JSON.parse(cached)); } catch { /* fallthrough */ }
  }
  if (!geoPromise) {
    geoPromise = fetch('https://ipwho.is/')
      .then((r) => r.json())
      .then((d) => {
        if (!d || d.success === false) return null;
        const info: GeoInfo = {
          country: d.country || '알 수 없음',
          country_code: d.country_code || '',
          city: d.city || '',
        };
        sessionStorage.setItem(GEO_KEY, JSON.stringify(info));
        return info;
      })
      .catch(() => null);
  }
  return geoPromise;
};

// 라우트 변경 시 호출 — Supabase 미설정이거나 geo 조회 실패 시 조용히 무시
export const trackPageview = async (path: string): Promise<void> => {
  if (!supabase) return;
  const ua = navigator.userAgent;
  const geo = await getGeo();
  try {
    await supabase.from('site_visits').insert([{
      session_id: getSessionId(),
      path,
      referrer: document.referrer || '직접 접속',
      country: geo?.country || null,
      country_code: geo?.country_code || null,
      city: geo?.city || null,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
    }]);
  } catch { /* 통계 실패가 앱을 방해하면 안 됨 */ }
};

// --- 통계 조회 (Stats 페이지용) ---

export interface VisitRow {
  id: string;
  created_at: string;
  session_id: string;
  path: string | null;
  referrer: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
}

export const fetchVisits = async (limit = 1000): Promise<VisitRow[]> => {
  if (!supabase) return [];
  const { data } = await supabase
    .from('site_visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
};
