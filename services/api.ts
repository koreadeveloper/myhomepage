
import { supabase } from './supabase';

// --- Game Stats & Scores ---

// Play Count Logging
export const logGamePlay = async (gameId: string, ip?: string) => {
  if (!supabase) return;
  try {
    await supabase.from('game_play_logs').insert([{ game_id: gameId, ip_address: ip }]);
  } catch (e) {
    console.error('Log game play error:', e);
  }
};

// Score Saving
export const saveGameScore = async (gameId: string, nickname: string, score: number) => {
  if (!supabase || !nickname || score < 0) return;
  try {
    // Check ban status
    const { data: banData } = await supabase.rpc('check_ban_status', { check_ip: '', check_nickname: nickname });
    if (banData && banData.banned) {
      console.warn('Blocked user attempted to save score');
      return;
    }

    await supabase.from('game_scores').insert([{ game_id: gameId, nickname, score }]);
  } catch (e) {
    console.error('Save score error:', e);
  }
};

// Fetch Top Scores
export const getTopScores = async (gameId: string, limit = 10) => {
  if (!supabase) return [];
  const { data } = await supabase
    .from('game_scores')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(limit);
  return data || [];
};
