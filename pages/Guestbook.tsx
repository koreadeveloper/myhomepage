import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { PenLine, RefreshCw } from 'lucide-react';

type Entry = { id: string; nickname: string; message: string; created_at: string };

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

const Guestbook: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from('guestbook')
      .select('id, nickname, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || sending) return;
    const nick = nickname.trim().slice(0, 20);
    const msg = message.trim().slice(0, 200);
    if (!nick || !msg) { setError('닉네임과 내용을 입력해주세요'); return; }
    setSending(true); setError('');
    const { error: err } = await supabase.from('guestbook').insert([{ nickname: nick, message: msg }]);
    setSending(false);
    if (err) { setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.'); return; }
    setMessage('');
    void load();
  };

  return (
    <div className="min-h-screen px-5 md:px-10 pt-32 md:pt-40 pb-20 max-w-2xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Guestbook</p>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">방명록</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">지나간 자리에 한 줄 남겨주세요.</p>
      </div>

      <form onSubmit={submit} className="rounded-3xl bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 p-5 mb-8">
        <div className="flex gap-2 mb-3">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="w-32 shrink-0 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="한 줄 메시지… (최대 200자)"
            maxLength={200}
            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex items-center justify-between">
          {error ? <span className="text-xs font-bold text-red-500">{error}</span> : <span />}
          <button
            type="submit"
            disabled={sending || !supabase}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 transition-colors"
          >
            <PenLine size={13} /> {sending ? '남기는 중…' : '남기기'}
          </button>
        </div>
        {!supabase && <p className="text-xs text-slate-400 mt-2">방명록 저장소가 연결되지 않았어요.</p>}
      </form>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{entries.length}개의 메시지</h2>
        <button onClick={() => void load()} aria-label="새로고침" className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-400 animate-pulse py-12">불러오는 중…</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((en) => (
            <li key={en.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm font-black text-slate-800 dark:text-white">{en.nickname}</span>
                <span className="text-[11px] font-bold text-slate-400 shrink-0">{timeAgo(en.created_at)}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">{en.message}</p>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="text-center text-sm text-slate-400 py-12">아직 메시지가 없어요. 첫 번째로 남겨보세요!</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Guestbook;
