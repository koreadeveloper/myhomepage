import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Globe2, MonitorSmartphone, Users } from 'lucide-react';
import { fetchVisits, VisitRow } from '../services/analytics';

// 국가 코드 → 국기 이모지
const flag = (code: string | null) =>
  code && /^[A-Z]{2}$/i.test(code)
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
    : '🌐';

const host = (ref: string | null) => {
  if (!ref || ref === '직접 접속') return '직접 접속';
  try { return new URL(ref).hostname.replace(/^www\./, ''); } catch { return '직접 접속'; }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

const Stats: React.FC = () => {
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits(2000).then((v) => { setVisits(v); setLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const sessions = new Set(visits.map((v) => v.session_id)).size;
    const today = new Date().toDateString();
    const todaySessions = new Set(
      visits.filter((v) => new Date(v.created_at).toDateString() === today).map((v) => v.session_id)
    ).size;

    // 최근 14일 일별 방문자(세션 기준)
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toDateString();
      const set = new Set(
        visits.filter((v) => new Date(v.created_at).toDateString() === dayStr).map((v) => v.session_id)
      );
      days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count: set.size });
    }
    const maxDay = Math.max(...days.map((d) => d.count), 1);

    const count = <T extends string>(get: (v: VisitRow) => T) =>
      [...visits.reduce((m, v) => {
        const k = get(v); if (k) m.set(k, (m.get(k) || 0) + 1); return m;
      }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

    return {
      sessions, todaySessions, pageviews: visits.length, days, maxDay,
      countries: count((v) => v.country || '알 수 없음'),
      referrers: count((v) => host(v.referrer)),
      devices: count((v) => v.device || '기타'),
      browsers: count((v) => v.browser || '기타'),
    };
  }, [visits]);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return visits.filter((v) => {
      if (seen.has(v.session_id)) return false;
      seen.add(v.session_id); return true;
    }).slice(0, 30);
  }, [visits]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24">
      <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">통계를 불러오는 중…</p>
    </div>;
  }

  return (
    <div className="min-h-screen px-5 md:px-10 pt-32 md:pt-40 pb-20 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Analytics</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">방문자 통계</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">사이트 방문자의 위치·기기·유입 경로를 실시간으로 확인합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Users, label: '오늘 방문자', value: stats.todaySessions },
          { icon: BarChart3, label: '오늘 페이지뷰', value: visits.filter((v) => new Date(v.created_at).toDateString() === new Date().toDateString()).length },
          { icon: Globe2, label: '누적 방문자', value: stats.sessions },
          { icon: MonitorSmartphone, label: '누적 페이지뷰', value: stats.pageviews },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-5 border border-white/50 dark:border-white/10">
            <Icon className="w-4 h-4 text-indigo-500 mb-3" />
            <div className="text-2xl font-black text-slate-900 dark:text-white">{value.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* 14일 차트 */}
      <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6 mb-10">
        <h2 className="font-black text-slate-900 dark:text-white mb-6">최근 14일 방문자</h2>
        <div className="flex items-end gap-1.5 h-40">
          {stats.days.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-400 dark:from-indigo-400 dark:to-violet-300 min-h-[4px] transition-all"
                style={{ height: `${(d.count / stats.maxDay) * 100}%` }}
              />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {/* 국가 */}
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6">
          <h2 className="font-black text-slate-900 dark:text-white mb-5">국가</h2>
          <ul className="space-y-3">
            {stats.countries.slice(0, 6).map(([country, n]) => (
              <li key={country} className="flex items-center gap-2.5 text-sm">
                <span className="text-lg leading-none">{flag(visits.find((v) => (v.country || '알 수 없음') === country)?.country_code || null)}</span>
                <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200 truncate">{country}</span>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 w-16 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(n / stats.pageviews) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-slate-500 w-6 text-right">{n}</span>
              </li>
            ))}
            {stats.countries.length === 0 && <p className="text-sm text-slate-400">데이터 없음</p>}
          </ul>
        </div>

        {/* 유입 경로 */}
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6">
          <h2 className="font-black text-slate-900 dark:text-white mb-5">유입 경로</h2>
          <ul className="space-y-3">
            {stats.referrers.slice(0, 6).map(([ref, n]) => (
              <li key={ref} className="flex items-center gap-2 text-sm">
                <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200 truncate">{ref}</span>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 w-16 overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(n / stats.pageviews) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-slate-500 w-6 text-right">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 기기 */}
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6">
          <h2 className="font-black text-slate-900 dark:text-white mb-5">기기 / 브라우저</h2>
          <ul className="space-y-3">
            {stats.devices.map(([dev, n]) => (
              <li key={dev} className="flex items-center gap-2 text-sm">
                <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200">{dev}</span>
                <span className="text-xs font-black text-indigo-500">{Math.round((n / stats.pageviews) * 100)}%</span>
              </li>
            ))}
          </ul>
          <div className="h-px bg-slate-100 dark:bg-white/10 my-4" />
          <ul className="space-y-2">
            {stats.browsers.slice(0, 4).map(([b, n]) => (
              <li key={b} className="flex items-center gap-2 text-xs">
                <span className="flex-1 font-semibold text-slate-500 dark:text-slate-400">{b}</span>
                <span className="font-black text-slate-500 dark:text-slate-400">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 최근 방문 */}
      <div className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6">
        <h2 className="font-black text-slate-900 dark:text-white mb-5">최근 방문</h2>
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {recent.map((v) => (
            <li key={v.id} className="py-3 flex items-center gap-3 text-sm">
              <span className="text-xl leading-none">{flag(v.country_code)}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {v.country || '알 수 없음'}{v.city ? ` · ${v.city}` : ''}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  {' '}— {v.device}{v.browser ? ` · ${v.browser}` : ''}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {v.path || '/'} · {host(v.referrer)}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 shrink-0">{timeAgo(v.created_at)}</span>
            </li>
          ))}
          {recent.length === 0 && <p className="text-sm text-slate-400 py-4">아직 수집된 방문 기록이 없습니다.</p>}
        </ul>
      </div>
    </div>
  );
};

export default Stats;
