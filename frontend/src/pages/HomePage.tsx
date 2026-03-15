import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { emotionAPI, JournalHistoryResponse, JournalEntry } from '../services/api';
import { 
  Sparkle, 
  Brain, 
  Clock, 
  ArrowRight, 
  Lightning, 
  Bookmark, 
  Compass, 
  Plus, 
  CaretRight, 
  Flame,
  ChatCircleText
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';

const todayPrompt = "Turn your internal whispers into a legacy of emotional mastery and self-discovery.";

// ── Stagger helper ─────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { y: 22, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.65, ease: 'easeOut' as const },
});

// ── Animated streak ring ───────────────────────────────────────────────
const StreakRing: React.FC<{ streak: number }> = ({ streak }) => {
  const max = Math.max(streak, 7);
  const pct = Math.min(streak / max, 1);
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e8f5f0" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r={r} fill="none"
          stroke="#3aaf87" strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[1rem] font-black text-primary leading-none tracking-tighter">{streak}</span>
        <span className="text-[6px] font-black uppercase tracking-wider text-secondary/30">days</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: dailyWord, isLoading: wordLoading } = useQuery({
    queryKey: ['dailyWord'],
    queryFn: () => emotionAPI.getDailyWord(),
  });
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['journalHistory'],
    queryFn: () => emotionAPI.getJournalHistory(),
  });

  const calculateStreak = () => {
    if (!historyRes) return 0;
    const entries = (historyRes as JournalHistoryResponse).entries;
    if (!entries?.length) return 0;
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dates = Array.from(new Set(
      entries.map(e => { const d = new Date(e.data.created_at); d.setHours(0,0,0,0); return d.getTime(); })
    )).sort((a, b) => b - a);
    let check = today;
    for (const ts of dates) {
      const d = new Date(ts);
      const diff = (check.getTime() - d.getTime()) / 86400000;
      if (diff === 0 || diff === 1) { streak++; check = d; } else break;
    }
    return streak;
  };

  const streak = calculateStreak();
  const intensity = (dailyWord as any)?.metadata?.intensity ?? 3;
  const entries = (historyRes as JournalHistoryResponse)?.entries ?? [];

  if (wordLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-[#FBFDFD] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent"
        />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/25">Loading your day</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDFD] pb-36 pt-10 px-5 relative overflow-x-hidden font-body">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-72 h-72 bg-accent/[0.05] rounded-full blur-[120px] -mr-36 -mt-16" />
      <div className="pointer-events-none fixed bottom-40 left-0 w-56 h-56 bg-primary/[0.04] rounded-full blur-[100px] -ml-28" />

      <div className="max-w-[430px] mx-auto space-y-7 relative z-10">

        {/* ═══════════════════════════════════
            1. HEADER  with streak ring
        ═══════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="flex justify-between items-center pt-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-secondary/25 mb-1">Good day</p>
            <h1 className="text-[2.5rem] font-heading font-black text-primary tracking-[-0.04em] leading-none italic">
              {user?.full_name?.split(' ')[0] || 'Seeker'}.
            </h1>
          </div>
          <div className="flex flex-col items-center gap-1">
            <StreakRing streak={streak} />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-secondary/25 flex items-center gap-1">
              <Flame size={10} weight="fill" className="text-accent" /> Streak
            </span>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════
            2. MOTIVATIONAL QUOTE (PURE TYPOGRAPHY)
        ═══════════════════════════════════ */}
        <motion.div {...fadeUp(0.1)} className="py-6">
          <h2 className="text-[1.9rem] font-heading font-black text-primary italic leading-[1.1] tracking-tight max-w-[95%]">
            Master your internal world, <br/>
            <span className="text-secondary/40">and the external one belongs to you.</span>
          </h2>
        </motion.div>

        {/* ═══════════════════════════════════
            3. WORD OF THE DAY  + INTENSITY FLOW
        ═══════════════════════════════════ */}
        <motion.div
          {...fadeUp(0.18)}
          onClick={() => dailyWord && navigate(`/word/${(dailyWord as any).word}`)}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-1.5 bg-gradient-to-br from-primary/8 to-accent/8 rounded-[2.8rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative bg-white rounded-[2.6rem] border border-primary/[0.07] shadow-xl shadow-secondary/[0.05] overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-accent/[0.06] rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

            <div className="p-9 space-y-5">
              {/* Label + core tag */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.4em] text-accent">
                  <Sparkle size={11} weight="duotone" /> Word of the Day
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-secondary/30 bg-light-bg/70 px-3 py-1.5 rounded-lg border border-primary/[0.05]">
                  {(dailyWord as any)?.core || 'Emotion'}
                </span>
              </div>

              {/* Word + category */}
              <div>
                <h2 className="text-[3.5rem] font-heading font-black text-primary tracking-[-0.05em] leading-none italic break-words">
                  {(dailyWord as any)?.word || 'Serenity'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/20 mt-1.5">
                  {(dailyWord as any)?.category || 'Adjective'}
                </p>
              </div>

              {/* Definition */}
              <p className="text-[0.97rem] font-heading font-black text-primary/55 leading-snug tracking-tight italic border-l-[3px] border-accent/20 pl-4">
                "{(dailyWord as any)?.metadata?.definition || 'A profound state of inner stillness and acceptance.'}"
              </p>

              {/* ── INTENSITY FLOW BARS ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-secondary/25 flex items-center gap-1.5">
                    <Lightning size={10} weight="bold" /> Intensity Flow
                  </span>
                  <span className="text-[7px] font-black tracking-widest text-accent/70">{intensity} / 5</span>
                </div>
                <div className="flex items-end gap-1.5 h-8">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                      key={level}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.5 + level * 0.07, duration: 0.45, ease: 'backOut' as const }}
                      style={{
                        transformOrigin: 'bottom',
                        height: `${18 + level * 15}%`,
                      }}
                      className={`flex-1 rounded-full ${
                        level <= intensity
                          ? level <= 2 ? 'bg-accent/35' : level <= 4 ? 'bg-accent/65' : 'bg-accent'
                          : 'bg-primary/[0.05]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-primary/[0.05]">
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary/40">
                  Discover More
                  <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <CaretRight size={18} weight="bold" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════
            4. ACTION BUTTONS
        ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            {...fadeUp(0.26)}
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/journal')}
            className="relative bg-primary rounded-[2.2rem] px-6 py-8 text-white shadow-2xl shadow-primary/20 flex flex-col items-start gap-6 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/[0.04] pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.06] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative z-10 group-hover:rotate-12 transition-transform duration-300">
              <Plus size={22} weight="bold" />
            </div>
            <div className="relative z-10">
              <p className="text-[7px] font-black uppercase tracking-[0.35em] text-white/35 mb-0.5">Daily Log</p>
              <h3 className="text-[1.25rem] font-heading font-black tracking-tight leading-tight italic">New<br/>Journal</h3>
            </div>
          </motion.button>

          <motion.button
            {...fadeUp(0.3)}
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/search')}
            className="relative bg-white border border-primary/[0.07] rounded-[2.2rem] px-6 py-8 shadow-lg shadow-secondary/[0.04] flex flex-col items-start gap-6 overflow-hidden group"
          >
            <div className="w-10 h-10 bg-light-bg rounded-xl flex items-center justify-center text-primary group-hover:-rotate-12 transition-transform duration-300">
              <Compass size={22} weight="duotone" />
            </div>
            <div>
              <p className="text-[7px] font-black uppercase tracking-[0.35em] text-secondary/25 mb-0.5">Spectrum</p>
              <h3 className="text-[1.25rem] font-heading font-black text-primary tracking-tight leading-tight italic">Explore<br/>Moods</h3>
            </div>
          </motion.button>
        </div>



        {/* ═══════════════════════════════════
            6. CLOSING QUOTE
        ═══════════════════════════════════ */}
        <motion.div
          {...fadeUp(0.42)}
          className="relative bg-primary/[0.03] border border-primary/[0.05] rounded-[2.2rem] p-9 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/[0.07] rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
          <Bookmark className="w-4 h-4 text-accent/35 mx-auto mb-3" />
          <p className="text-[1rem] font-heading font-black text-primary italic leading-snug relative z-10">
            "Your emotions are the{' '}
            <span className="text-accent underline decoration-2 underline-offset-4 decoration-accent/20">palette</span>
            {' '}of your daily evolution."
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default HomePage;
