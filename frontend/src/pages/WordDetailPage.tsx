import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { emotionAPI, WordDetail } from '../services/api';
import {
  CaretLeft, Lightning, BookOpen, Brain,
  Sparkle, CircleNotch, Bookmark, Heart,
  Quotes, ArrowRight, SmileyMeh
} from '@phosphor-icons/react';

/* ── per-emotion theming ───────────────────────── */
const THEMES: Record<string, { accent: string; glow: string; badge: string; badgeText: string }> = {
  Happy:     { accent: '#1a6b5a', glow: 'rgba(26,107,90,0.15)',   badge: '#f0fdf8', badgeText: '#1a6b5a' },
  Joy:       { accent: '#7c3aed', glow: 'rgba(124,58,237,0.15)', badge: '#f5f3ff', badgeText: '#7c3aed' },
  Surprised: { accent: '#d97706', glow: 'rgba(217,119,6,0.15)',  badge: '#fffbeb', badgeText: '#d97706' },
  Positive:  { accent: '#059669', glow: 'rgba(5,150,105,0.15)',  badge: '#ecfdf5', badgeText: '#059669' },
  Angry:     { accent: '#dc2626', glow: 'rgba(220,38,38,0.15)',  badge: '#fef2f2', badgeText: '#dc2626' },
  Sad:       { accent: '#2563eb', glow: 'rgba(37,99,235,0.15)',  badge: '#eff6ff', badgeText: '#2563eb' },
  Fearful:   { accent: '#d97706', glow: 'rgba(217,119,6,0.15)',  badge: '#fffbeb', badgeText: '#d97706' },
  Disgusted: { accent: '#65a30d', glow: 'rgba(101,163,13,0.15)', badge: '#f7fee7', badgeText: '#65a30d' },
  Bad:       { accent: '#475569', glow: 'rgba(71,85,105,0.15)',  badge: '#f8fafc', badgeText: '#475569' },
};
const DEFAULT_THEME = { accent: '#1a6b5a', glow: 'rgba(26,107,90,0.15)', badge: '#f0fdf8', badgeText: '#1a6b5a' };

const ease = [0.22, 1, 0.36, 1] as const;
const up = (d = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.65, ease } });

/* ══════════════════════════════════════════════════ */
const WordDetailPage: React.FC = () => {
  const { wordName } = useParams<{ wordName: string }>();
  const navigate     = useNavigate();
  const [word,    setWord]    = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pulse,   setPulse]   = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!wordName) return;
      try {
        const data = await emotionAPI.getWordDetails(wordName);
        setWord(data);
        try {
          const { saved_words } = await emotionAPI.getSavedWords();
          setSaved(saved_words.some((w: any) => w.word === data.word));
        } catch { /* ignore */ }
        try { await emotionAPI.trackWordLearned(data); } catch { /* ignore */ }
      } catch { setError('Word not found'); }
      finally   { setLoading(false); }
    };
    fetch();
  }, [wordName]);

  const handleSave = async () => {
    if (!word || saving) return;
    setSaving(true);
    try {
      if (saved) { await emotionAPI.unsaveWord(word.word); setSaved(false); setSaveMsg('Removed'); }
      else       { await emotionAPI.saveWord(word);        setSaved(true);  setSaveMsg('Saved!'); }
      setTimeout(() => setSaveMsg(''), 1800);
    } catch { setSaveMsg('Error'); setTimeout(() => setSaveMsg(''), 1800); }
    finally  { setSaving(false); }
  };

  /* Loading */
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
        className="w-9 h-9 rounded-full border-[2.5px] border-[#1a6b5a] border-t-transparent" />
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: '0.6em', color: 'rgba(26,107,90,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>
        Extracting nuance
      </p>
    </div>
  );

  /* Error */
  if (error || !word) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#fff1f2' }}>
        <SmileyMeh size={36} weight="duotone" style={{ color: '#e11d48' }} />
      </div>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, fontStyle: 'italic', color: '#0a1f1a' }}>
          Echo not found.
        </h2>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: '0.4em', color: 'rgba(10,31,26,0.3)', textTransform: 'uppercase', marginTop: 8 }}>
          Linguistic frequency missing
        </p>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)}
        style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#1a6b5a', color: '#fff', padding: '14px 32px', borderRadius: 99, fontWeight: 700, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Go Back
      </motion.button>
    </div>
  );

  const theme = THEMES[word.core] ?? DEFAULT_THEME;

  return (
    <div className="min-h-screen bg-white w-screen overflow-x-hidden pb-36"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── Ambient top glow (matches emotion color) ── */}
      <motion.div
        animate={{ opacity: pulse ? 0.12 : 0.07 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="pointer-events-none fixed top-0 left-0 right-0 h-[420px] z-0"
        style={{ background: `radial-gradient(ellipse at 60% 0%, ${theme.accent} 0%, transparent 65%)` }}
      />

      <div className="relative z-10 max-w-[430px] mx-auto px-5">

        {/* ╔══════════════════════════════╗
            ║  NAV BAR                     ║
            ╚══════════════════════════════╝ */}
        <motion.div {...up(0)} className="flex items-center justify-between pt-10 pb-6">
          <motion.button
            whileHover={{ x: -3 }} whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
            style={{ background: 'rgba(10,31,26,0.05)', border: '1.5px solid rgba(10,31,26,0.07)', borderRadius: 50, padding: '10px 16px' }}>
            <CaretLeft size={16} weight="bold" style={{ color: '#0a1f1a' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(10,31,26,0.5)', letterSpacing: '0.1em' }}>Back</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saveMsg && (
                <motion.span key="msg" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: theme.accent }}>
                  {saveMsg}
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.88 }}
              animate={saved ? { scale: [1, 1.3, 1] } : {}}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center"
              style={{
                width: 44, height: 44, borderRadius: 50,
                background: saved ? theme.accent : 'rgba(10,31,26,0.05)',
                border: saved ? 'none' : '1.5px solid rgba(10,31,26,0.07)',
              }}>
              <Bookmark size={18} weight={saved ? 'fill' : 'regular'}
                style={{ color: saved ? '#fff' : 'rgba(10,31,26,0.4)' }} />
            </motion.button>
          </div>
        </motion.div>

        {/* ╔══════════════════════════════════════╗
            ║  HERO — Category pill + BIG word     ║
            ╚══════════════════════════════════════╝ */}
        <motion.div {...up(0.06)} className="pb-8">
          {/* Category + intensity row */}
          <div className="flex items-center gap-2 mb-5">
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase',
              background: theme.badge, color: theme.accent, border: `1px solid ${theme.accent}20`,
              padding: '6px 14px', borderRadius: 99 }}>
              {word.core}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(10,31,26,0.3)', letterSpacing: '0.1em' }}>
              · {word.category}
            </span>
            {/* Intensity dots inline */}
            <div className="flex items-center gap-1 ml-auto">
              {[1,2,3,4,5].map(l => (
                <motion.div key={l}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + l * 0.07, type: 'spring', stiffness: 500, damping: 20 }}
                  style={{ width: l <= word.metadata.intensity ? 14 : 7, height: 7, borderRadius: 99,
                    background: l <= word.metadata.intensity ? theme.accent : 'rgba(10,31,26,0.08)',
                    opacity: l <= word.metadata.intensity ? (0.3 + l * 0.15) : 1 }} />
              ))}
            </div>
          </div>

          {/* BIG WORD */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(3.8rem, 16vw, 5.5rem)',
            fontWeight: 900, fontStyle: 'italic',
            color: '#0a1f1a',
            lineHeight: 0.88,
            letterSpacing: '-0.04em',
            wordBreak: 'break-word',
          }}>
            {word.word}
            <motion.span animate={{ color: pulse ? theme.accent : 'rgba(10,31,26,0.15)' }}
              transition={{ duration: 1.8 }}>.</motion.span>
          </h1>
        </motion.div>

        {/* ╔══════════════════════════════════════╗
            ║  DEFINITION — DARK PREMIUM CARD      ║
            ╚══════════════════════════════════════╝ */}
        <motion.div {...up(0.14)} className="mb-4 relative">
          <div className="rounded-[2.2rem] overflow-hidden relative"
            style={{
              background: 'linear-gradient(148deg, #0f2d1f 0%, #0a1c15 100%)',
              boxShadow: `0 24px 70px -12px rgba(10,40,25,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}>
            {/* Accent glow line */}
            <motion.div animate={{ opacity: pulse ? 1 : 0.5 }} transition={{ duration: 2 }}
              style={{ height: 2.5, background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />
            {/* Internal glow */}
            <div className="absolute top-0 right-0 w-52 h-52 rounded-full -mr-20 -mt-20 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${theme.glow.replace('0.15', '0.25')} 0%, transparent 65%)` }} />

            <div className="px-7 pt-6 pb-7 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={13} weight="duotone" style={{ color: `${theme.accent}99` }} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: `${theme.accent}60` }}>
                  Soul Essence
                </span>
              </div>
              <Quotes size={28} weight="fill" style={{ color: 'rgba(255,255,255,0.06)', marginBottom: 8, display: 'block' }} />
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.2rem', fontWeight: 700, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, letterSpacing: '-0.01em',
              }}>
                {word.metadata.definition}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ╔══════════════════════════════════════╗
            ║  EXAMPLE — colored card              ║
            ╚══════════════════════════════════════╝ */}
        <motion.div {...up(0.2)} className="mb-4">
          <div className="rounded-[1.8rem] px-7 py-6 relative overflow-hidden"
            style={{ background: theme.badge, border: `1.5px solid ${theme.accent}18` }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${theme.accent}18, transparent 70%)` }} />
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={13} weight="fill" style={{ color: theme.accent }} />
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: `${theme.accent}80` }}>
                Living Context
              </span>
            </div>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.05rem', fontWeight: 700, fontStyle: 'italic',
              color: theme.accent, lineHeight: 1.6,
            }}>
              &ldquo;{word.metadata.example}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* ╔══════════════════════════════════════╗
            ║  BENTO: INSIGHT + GROWTH SIDE BY SIDE║
            ╚══════════════════════════════════════╝ */}
        <motion.div {...up(0.27)} className="grid grid-cols-1 gap-3 mb-4">
          {/* Deep Insight */}
          <div className="rounded-[1.8rem] px-6 py-5"
            style={{ background: '#fff', border: '1.5px solid rgba(10,31,26,0.07)', boxShadow: '0 8px 28px -6px rgba(10,31,26,0.07)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div style={{ width: 32, height: 32, borderRadius: '0.7rem', background: 'rgba(10,31,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={16} weight="duotone" style={{ color: '#0a1f1a' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(10,31,26,0.35)' }}>Deep Insight</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, fontStyle: 'italic', color: '#0a1f1a', lineHeight: 1.5 }}>
              {word.metadata.reflection_prompt}
            </p>
          </div>

          {/* Growth Step */}
          <div className="rounded-[1.8rem] px-6 py-5"
            style={{ background: theme.badge, border: `1.5px solid ${theme.accent}18` }}>
            <div className="flex items-center gap-2 mb-3">
              <div style={{ width: 32, height: 32, borderRadius: '0.7rem', background: `${theme.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightning size={16} weight="duotone" style={{ color: theme.accent }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: `${theme.accent}80` }}>Growth Step</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: theme.accent, lineHeight: 1.5 }}>
              {word.metadata.growth_tip}
            </p>
          </div>
        </motion.div>

        {/* ╔══════════════════════════════════════╗
            ║  BODY SIGNAL                         ║
            ╚══════════════════════════════════════╝ */}
        {word.metadata.body_signal && (
          <motion.div {...up(0.33)} className="mb-4">
            <div className="rounded-[1.8rem] px-6 py-5 flex items-start gap-4"
              style={{ background: '#fff', border: '1.5px solid rgba(225,29,72,0.1)', boxShadow: '0 6px 20px -6px rgba(225,29,72,0.08)' }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '0.8rem', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} weight="fill" style={{ color: '#e11d48' }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(225,29,72,0.5)', marginBottom: 6 }}>Body Feeling</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.98rem', fontWeight: 700, fontStyle: 'italic', color: '#0a1f1a', lineHeight: 1.5 }}>
                  {word.metadata.body_signal}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ╔══════════════════════════════════════╗
            ║  SYNONYMS                            ║
            ╚══════════════════════════════════════╝ */}
        {word.metadata.synonyms?.length > 0 && (
          <motion.div {...up(0.39)} className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: 'rgba(10,31,26,0.07)' }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(10,31,26,0.25)' }}>
                Related Resonance
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(10,31,26,0.07)' }} />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {word.metadata.synonyms.map((syn, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 400, damping: 22 }}
                  whileHover={{ scale: 1.08, background: theme.badge }}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                    background: '#fff', color: '#0a1f1a',
                    border: '1.5px solid rgba(10,31,26,0.08)',
                    padding: '8px 16px', borderRadius: 99,
                    cursor: 'default', display: 'inline-block',
                    boxShadow: '0 2px 8px -2px rgba(10,31,26,0.06)',
                    transition: 'background 0.2s',
                  }}>
                  {syn}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ╔══════════════════════════════════════╗
            ║  JOURNAL CTA                         ║
            ╚══════════════════════════════════════╝ */}
        <motion.div {...up(0.45)}>
          <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/journal')}
            className="w-full flex items-center justify-between rounded-[1.8rem] px-7 py-5"
            style={{
              background: `linear-gradient(145deg, ${theme.accent} 0%, ${theme.accent}cc 100%)`,
              boxShadow: `0 16px 48px -10px ${theme.accent}55`,
            }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>
                Reflect on this
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>
                Journal about {word.word}
              </p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '0.9rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={20} weight="bold" style={{ color: '#fff' }} />
            </div>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};

export default WordDetailPage;
