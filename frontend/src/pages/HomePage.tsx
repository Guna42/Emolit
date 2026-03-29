import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { emotionAPI, JournalHistoryResponse } from '../services/api';
import { Sparkle, Lightning, PenNib, Compass, ArrowUpRight, Flame, CalendarCheck, Clock } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { JourneyOnboarding } from '../components/JourneyOnboarding';

/* ── animation ─────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
const reveal = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.65, ease },
});

/* ── helpers ─────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}
function getDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ══════════════════════════════════════════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tick, setTick] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTick(p => !p), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    updateTime();
    const t2 = setInterval(updateTime, 1000);
    return () => clearInterval(t2);
  }, []);

  const { data: dailyWord, isLoading: wl } = useQuery({
    queryKey: ['dailyWord'],
    queryFn: () => emotionAPI.getDailyWord(),
  });
  const { data: historyRes, isLoading: hl } = useQuery({
    queryKey: ['journalHistory'],
    queryFn: () => emotionAPI.getJournalHistory(),
  });

  const calcStreak = () => {
    if (!historyRes) return 0;
    const entries = (historyRes as JournalHistoryResponse).entries;
    if (!entries?.length) return 0;
    let s = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dates = Array.from(new Set(
      entries.map(e => { const d = new Date(e.data.created_at); d.setHours(0,0,0,0); return d.getTime(); })
    )).sort((a, b) => b - a);
    let chk = today;
    for (const ts of dates) {
      const d = new Date(ts);
      const diff = (chk.getTime() - d.getTime()) / 86400000;
      if (diff === 0 || diff === 1) { s++; chk = d; } else break;
    }
    return s;
  };

  const streak = calcStreak();

  const intensity  = (dailyWord as any)?.metadata?.intensity ?? 3;
  const name       = user?.full_name?.split(' ')[0] || 'Seeker';
  const word       = (dailyWord as any)?.word       || 'Resilience';
  const core       = (dailyWord as any)?.core       || 'Strength';
  const category   = (dailyWord as any)?.category   || 'Noun';
  const definition = (dailyWord as any)?.metadata?.definition
    || 'The capacity to recover quickly from difficulties and keep moving forward.';

  /* ── Loading ── */
  if (wl || hl) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-[#1a6b5a] border-t-transparent"
        />
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: '0.5em', color: 'rgba(26,107,90,0.35)', textTransform: 'uppercase', fontWeight: 700 }}>
          Awakening
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-screen overflow-x-hidden pb-36" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <JourneyOnboarding userName={name} />

      {/* ── Subtle ambient ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ scale: tick ? 1.08 : 1, opacity: tick ? 0.06 : 0.04 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #1a6b5a, transparent 65%)' }}
        />
        <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.05), transparent 65%)' }} />
      </div>

      <div className="relative z-10 max-w-[430px] mx-auto px-4 pt-10">

        {/* ╔═══════════════════════════════╗
            ║   TOP HEADER BAR              ║
            ╚═══════════════════════════════╝ */}
        <motion.div {...reveal(0)} className="flex items-start justify-between mb-7">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(10,31,26,0.35)', textTransform: 'uppercase', marginBottom: 4 }}>
              Good {getGreeting()} · {getDate()}
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.6rem, 11vw, 3.8rem)',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#0a1f1a',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}>
              {name}<motion.span
                animate={{ color: tick ? '#3aaf87' : '#1a6b5a' }}
                transition={{ duration: 1.5 }}
                style={{ display: 'inline' }}>.</motion.span>
            </h1>
          </div>

          {/* Streak badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 380, damping: 22 }}
            className="flex flex-col items-center gap-1 mt-1"
          >
            <div className="relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center overflow-hidden"
              style={{
                background: streak > 0
                  ? 'linear-gradient(145deg, #ea580c 0%, #c2410c 100%)'
                  : '#fff3ec',
                boxShadow: streak > 0 ? '0 8px 24px -4px rgba(234,88,12,0.5)' : 'none',
                border: streak === 0 ? '1.5px solid rgba(234,88,12,0.15)' : 'none',
              }}>
              {streak > 0 && (
                <motion.div className="absolute inset-0" animate={{ opacity: [0.15, 0.3, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent)' }} />
              )}
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 900, color: streak > 0 ? '#fff' : '#ea580c', lineHeight: 1, position: 'relative', zIndex: 1 }}>{streak}</span>
              <Flame size={11} weight="fill" style={{ color: streak > 0 ? 'rgba(255,255,255,0.7)' : '#ea580c', position: 'relative', zIndex: 1 }} />
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(10,31,26,0.25)' }}>Streak</span>
          </motion.div>
        </motion.div>

        {/* ── Tagline quote ── */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.6, ease }}
          style={{
            fontSize: '0.8rem', fontStyle: 'italic', fontWeight: 500,
            color: 'rgba(10,31,26,0.3)', lineHeight: 1.65,
            marginBottom: '1.25rem',
          }}
        >
          Name it to tame it —{' '}
          <span style={{ color: '#1a6b5a', fontWeight: 700, fontStyle: 'normal' }}>
            every emotion you label, you master.
          </span>
        </motion.p>

        {/* ╔═══════════════════════════════╗
            ║   BENTO ROW 1: TIME/DATE      ║
            ╚═══════════════════════════════╝ */}
        <motion.div {...reveal(0.08)} className="mb-5 flex items-center justify-between rounded-[1.8rem] px-7 py-6 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #f8fdfb 0%, #edf9f5 100%)', border: '1.5px solid rgba(26,107,90,0.08)', boxShadow: '0 8px 24px -6px rgba(26,107,90,0.06)' }}>
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(58,175,135,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(26,107,90,0.45)', marginBottom: 4 }}>
              Current Time
            </p>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, fontStyle: 'italic', color: '#1a6b5a', lineHeight: 1 }}>
              {timeStr || '12:00 PM'}
            </div>
          </div>
          <div className="relative z-10" style={{ width: 44, height: 44, borderRadius: '1rem', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -4px rgba(26,107,90,0.1)' }}>
             <Clock size={20} weight="duotone" style={{ color: '#3aaf87' }} />
          </div>
        </motion.div>

        {/* ╔═══════════════════════════════════════╗
            ║   WORD OF THE DAY — HERO CARD         ║
            ╚═══════════════════════════════════════╝ */}
        <motion.div
          {...reveal(0.16)}
          onClick={() => navigate(`/word/${word}`)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.985 }}
          style={{ cursor: 'pointer' }}
          className="mb-4 group relative"
        >
          {/* Glow halo on hover */}
          <div className="absolute -inset-2 rounded-[2.4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(26,107,90,0.2) 0%, transparent 65%)' }} />

          <div className="relative rounded-[2.2rem] overflow-hidden"
            style={{
              background: 'linear-gradient(155deg, #0f2d1f 0%, #0a1f15 40%, #061209 100%)',
              boxShadow: '0 28px 80px -14px rgba(6,18,9,0.8), 0 2px 8px rgba(6,18,9,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Top glow bar */}
            <motion.div
              animate={{ opacity: tick ? 1 : 0.5 }}
              transition={{ duration: 2 }}
              style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #4ade80 35%, #34d399 65%, transparent 100%)' }}
            />

            {/* Internal glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 85% 5%, rgba(74,222,128,0.11) 0%, transparent 50%)' }} />

            <div className="px-7 pt-7 pb-6 space-y-4">

              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: tick ? 18 : 0 }} transition={{ duration: 1.2 }}>
                    <Sparkle size={12} weight="fill" style={{ color: '#4ade80' }} />
                  </motion.div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.55)' }}>Word of the Day</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
                  background: 'rgba(74,222,128,0.1)', color: '#86efac',
                  border: '1px solid rgba(74,222,128,0.2)',
                  padding: '5px 12px', borderRadius: 99,
                }}>
                  {core}
                </span>
              </div>

              {/* Word — REDUCED to 2.4rem max */}
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2.2rem, 9vw, 2.8rem)',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: '#ffffff',
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  wordBreak: 'break-word',
                }}>
                  {word}
                </h2>
                <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(74,222,128,0.4)', marginTop: 10 }}>
                  {category}
                </p>
              </div>

              {/* Definition */}
              <p style={{
                fontSize: '0.88rem', fontWeight: 500, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.42)', lineHeight: 1.7,
                borderLeft: '2px solid rgba(74,222,128,0.22)', paddingLeft: 14,
              }}>
                &ldquo;{definition}&rdquo;
              </p>

              {/* Intensity */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Lightning size={9} weight="bold" /> Emotional Intensity
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(74,222,128,0.5)', letterSpacing: '0.1em' }}>{intensity}/5</span>
                </div>
                <div className="flex gap-1.5 items-end h-6">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <motion.div key={lvl}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.7 + lvl * 0.07, ease: 'backOut', duration: 0.4 }}
                      style={{
                        flex: 1, borderRadius: 99, transformOrigin: 'bottom',
                        height: `${22 + lvl * 14}%`,
                        background: lvl <= intensity
                          ? `rgba(74,222,128, ${0.2 + lvl * 0.15})`
                          : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
                  Explore Word
                </span>
                <motion.div
                  whileHover={{ scale: 1.12, background: 'rgba(74,222,128,0.18)' }}
                  className="flex items-center justify-center rounded-[0.85rem] transition-all duration-300"
                  style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.07)', color: '#4ade80' }}>
                  <ArrowUpRight size={19} weight="bold" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ╔═══════════════════════════════════════╗
            ║   BENTO ROW 2: JOURNAL + EXPLORE      ║
            ╚═══════════════════════════════════════╝ */}
        <motion.div {...reveal(0.24)} className="grid grid-cols-[3fr_2fr] gap-3 mb-4">

          {/* Journal — large left cell */}
          <motion.button
            whileHover={{ y: -5, boxShadow: '0 24px 60px -10px rgba(26,107,90,0.55)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/journal')}
            className="relative rounded-[1.8rem] overflow-hidden flex flex-col justify-between text-left"
            style={{
              background: 'linear-gradient(148deg, #1a6b5a 0%, #0f4035 100%)',
              boxShadow: '0 14px 40px -8px rgba(26,107,90,0.4)',
              padding: '1.5rem',
              minHeight: '10rem',
            }}>
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)' }} />
            <div style={{
              width: 42, height: 42, borderRadius: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.13)', position: 'relative', zIndex: 1,
            }}>
              <PenNib size={21} weight="fill" className="text-white" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Daily Log</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', lineHeight: 1.05 }}>New<br />Journal</h3>
            </div>
          </motion.button>

          {/* Right column — 2 stacked */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="flex-1 rounded-[1.5rem] flex flex-col justify-between text-left"
              style={{ background: '#fff7ed', border: '1.5px solid rgba(234,88,12,0.12)', padding: '1rem 1.1rem', boxShadow: '0 6px 20px -5px rgba(234,88,12,0.12)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} weight="duotone" style={{ color: '#ea580c' }} />
              </div>
              <div>
                <p style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(234,88,12,0.5)', marginBottom: 2 }}>Explore</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 900, fontStyle: 'italic', color: '#c2410c', lineHeight: 1.1 }}>Mood<br />Map</h3>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/calendar')}
              className="flex-1 rounded-[1.5rem] flex flex-col justify-between text-left"
              style={{ background: '#f5f3ff', border: '1.5px solid rgba(124,58,237,0.1)', padding: '1rem 1.1rem', boxShadow: '0 6px 20px -5px rgba(124,58,237,0.1)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={18} weight="duotone" style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <p style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(124,58,237,0.5)', marginBottom: 2 }}>History</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 900, fontStyle: 'italic', color: '#6d28d9', lineHeight: 1.1 }}>My<br />Journal</h3>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ╔═══════════════════════════════════════╗
            ║   WISDOM STRIP                        ║
            ╚═══════════════════════════════════════╝ */}
        <motion.div
          {...reveal(0.32)}
          className="rounded-[1.6rem] px-5 py-4 flex items-center gap-3 mb-4"
          style={{
            background: 'linear-gradient(120deg, rgba(26,107,90,0.05) 0%, rgba(58,175,135,0.08) 100%)',
            border: '1px solid rgba(26,107,90,0.09)',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(26,107,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkle size={17} weight="duotone" style={{ color: '#1a6b5a' }} />
          </div>
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(26,107,90,0.35)', marginBottom: 3 }}>Daily Wisdom</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 700, fontStyle: 'italic', color: 'rgba(10,31,26,0.65)', lineHeight: 1.45 }}>
              "Your emotions are the{' '}
              <span style={{ background: 'linear-gradient(135deg,#1a6b5a,#3aaf87)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>palette</span>
              {' '}of your daily evolution."
            </p>
          </div>
        </motion.div>

        {/* ╔═══════════════════════════════════════╗
            ║   ANIMATED NUDGE                      ║
            ╚═══════════════════════════════════════╝ */}
        <AnimatePresence>
          <motion.div {...reveal(0.4)} className="text-center py-2">
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(10,31,26,0.22)', lineHeight: 1.6 }}>
              {streak > 0
                ? `🔥 ${streak}-day streak · keep the rhythm going`
                : 'Begin your emotional journey today'}
              <motion.span
                whileHover={{ letterSpacing: '0.05em' }}
                onClick={() => navigate('/journal')}
                style={{ marginLeft: 6, fontWeight: 700, color: '#1a6b5a', cursor: 'pointer', display: 'inline-block' }}>
                Write now →
              </motion.span>
            </p>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default HomePage;
