import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { emotionAPI, WordDetail } from '../services/api';
// ── Phosphor Icons (duotone / bold / fill for premium look) ─────────────────
import {
  MagnifyingGlass, X, Sparkle, Lightning, CaretRight,
  ArrowRight, Clock, TrendUp, GlobeHemisphereWest,
  Star, SmileyWink, BookOpen, Eye,
  Sun, CloudRain, Fire, Ghost, HandPalm, ShieldCheck, Binoculars,
  Infinity as InfinityIcon, Command, Palette, Waves, Pulse, Heart
} from '@phosphor-icons/react';

// ── Keyword matcher: maps any DB core name → our visual CORES config key ─────
const CORE_KEYWORDS: Record<string, string[]> = {
  Joy:          ['joy', 'happy', 'happiness', 'elat', 'ecsta', 'delig', 'cheer'],
  Sadness:      ['sad', 'grief', 'sorrow', 'depress', 'melancholy', 'misery'],
  Anger:        ['anger', 'angry', 'rage', 'frust', 'irate', 'fury', 'bitter'],
  Fear:         ['fear', 'anxious', 'anxiet', 'dread', 'panic', 'terror', 'fright', 'worried'],
  Disgust:      ['disgust', 'repuls', 'contempt', 'loath', 'avers'],
  Surprise:     ['surprise', 'amaze', 'astonish', 'shock', 'startle', 'wonder'],
  Love:         ['love', 'affection', 'adore', 'passion', 'romance', 'tender'],
  Trust:        ['trust', 'secure', 'confide', 'calm', 'serenity', 'peace', 'content'],
  Anticipation: ['anticipat', 'eager', 'excite', 'hope', 'expect', 'curio'],
};

const matchCoreToConfig = (dbCore: string): string => {
  const lc = dbCore.toLowerCase();
  for (const [key, keywords] of Object.entries(CORE_KEYWORDS)) {
    if (keywords.some(kw => lc.includes(kw))) return key;
  }
  return 'Trust';
};

// ── Visual CORES config ───────────────────────────────────────────────────────
const CORES: Record<string, {
  emoji: string; color: string; bg: string; glow: string;
  gradient: string; icon: React.ReactNode;
}> = {
  Joy:          { emoji: '✨', color: '#f59e0b', bg: '#fffbeb', glow: '245,158,11',  gradient: 'from-[#f59e0b] to-[#fbbf24]',   icon: <Sun size={26} weight="duotone" /> },
  Sadness:      { emoji: '🌊', color: '#3b82f6', bg: '#eff6ff', glow: '59,130,246',  gradient: 'from-[#3b82f6] to-[#60a5fa]',   icon: <CloudRain size={26} weight="duotone" /> },
  Anger:        { emoji: '🔥', color: '#ef4444', bg: '#fef2f2', glow: '239,68,68',   gradient: 'from-[#ef4444] to-[#f87171]',   icon: <Fire size={26} weight="duotone" /> },
  Fear:         { emoji: '🫧', color: '#8b5cf6', bg: '#f5f3ff', glow: '139,92,246',  gradient: 'from-[#8b5cf6] to-[#a78bfa]',   icon: <Ghost size={26} weight="duotone" /> },
  Disgust:      { emoji: '🌿', color: '#10b981', bg: '#ecfdf5', glow: '16,185,129',  gradient: 'from-[#10b981] to-[#34d399]',   icon: <HandPalm size={26} weight="duotone" /> },
  Surprise:     { emoji: '⚡', color: '#6366f1', bg: '#eef2ff', glow: '99,102,241',  gradient: 'from-[#6366f1] to-[#818cf8]',   icon: <Lightning size={26} weight="duotone" /> },
  Love:         { emoji: '🌸', color: '#ec4899', bg: '#fdf2f8', glow: '236,72,153',  gradient: 'from-[#ec4899] to-[#f472b6]',   icon: <Heart size={26} weight="duotone" /> },
  Trust:        { emoji: '🌱', color: '#1a6b5a', bg: '#f0fdf4', glow: '26,107,90',   gradient: 'from-[#1a6b5a] to-[#059669]',   icon: <ShieldCheck size={26} weight="duotone" /> },
  Anticipation: { emoji: '🚀', color: '#f97316', bg: '#fff7ed', glow: '249,115,22',  gradient: 'from-[#f97316] to-[#fb923c]',   icon: <Binoculars size={26} weight="duotone" /> },
};

const FEATURED = ['Overwhelmed', 'Peaceful', 'Betrayed', 'Hopeful', 'Euphoric', 'Anxious', 'Grateful', 'Melancholy'];

// ── Ambient blob ─────────────────────────────────────────────────────────────
const FloatingOrb: React.FC<{ color: string; size: number; x: string; y: string; delay: number }> = ({ color, size, x, y, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: `radial-gradient(circle, ${color}14 0%, transparent 70%)` }}
    animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.75, 0.35] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Core Emotion Card ─────────────────────────────────────────────────────────
const CoreCard: React.FC<{
  name: string;
  conf: typeof CORES[string];
  isSelected: boolean;
  onClick: () => void;
  index: number;
}> = ({ name, conf, isSelected, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 28, scale: 0.75 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.04 + index * 0.055, duration: 0.5, ease: 'backOut' }}
    whileHover={{ y: -5, scale: 1.06 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="relative flex flex-col items-center gap-2 focus:outline-none"
  >
    <motion.div
      animate={isSelected ? {
        boxShadow: [
          `0 0 0px rgba(${conf.glow},0)`,
          `0 0 28px rgba(${conf.glow},0.55)`,
          `0 0 0px rgba(${conf.glow},0)`
        ],
        scale: [1, 1.06, 1],
      } : {}}
      transition={{ duration: 2.2, repeat: Infinity }}
      className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center relative overflow-hidden transition-all duration-300"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${conf.color}, ${conf.color}cc)`
          : conf.bg,
        boxShadow: isSelected
          ? `0 10px 28px rgba(${conf.glow},0.35), inset 0 1px 0 rgba(255,255,255,0.2)`
          : '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      {/* Inner shimmer when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <span
        className="relative z-10 transition-all duration-300"
        style={{ color: isSelected ? 'white' : conf.color, filter: isSelected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : 'none' }}
      >
        {conf.icon}
      </span>
    </motion.div>

    <motion.span
      animate={{ color: isSelected ? conf.color : '#94a3b8' }}
      transition={{ duration: 0.2 }}
      className="text-[7px] font-black uppercase tracking-[0.2em] text-center leading-tight"
      style={{ maxWidth: 58 }}
    >
      {name.length > 9 ? name.slice(0, 8) + '.' : name}
    </motion.span>

    {isSelected && (
      <motion.div
        layoutId="selected-dot"
        className="w-1 h-1 rounded-full"
        style={{ backgroundColor: conf.color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      />
    )}
  </motion.button>
);

// ── Word Result Card (3D tilt) ─────────────────────────────────────────────────
const WordCard: React.FC<{ word: WordDetail; conf: typeof CORES[string]; index: number }> = ({ word, conf, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-80, 80], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: 'easeOut' }}
      style={{ perspective: 900 }}
    >
      <RouterLink to={`/word/${word.word}`}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', borderColor: `${conf.color}18` } as any}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          className="relative bg-white rounded-[1.8rem] p-6 border overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-400"
        >
          {/* Color-glow on hover */}
          <motion.div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle, rgba(${conf.glow},0.2), transparent)` }}
          />

          <div className="relative z-10 flex items-start gap-4">
            {/* Left accent bar */}
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0 mt-1"
              style={{ background: `linear-gradient(to bottom, ${conf.color}80, ${conf.color}10)` }}
            />

            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[7px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-md"
                  style={{ color: conf.color, backgroundColor: conf.bg }}
                >
                  {word.category}
                </span>
                <span className="text-[6.5px] font-black uppercase tracking-widest text-secondary/20">{word.core}</span>
              </div>

              {/* Word name */}
              <h3
                className="text-[1.85rem] font-heading font-black tracking-[-0.03em] leading-none italic"
                style={{ color: '#1e293b' }}
              >
                {word.word}
              </h3>

              {/* Intensity mini bar */}
              {(word as any).metadata?.intensity && (
                <div className="flex items-center gap-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((lv) => (
                    <div
                      key={lv}
                      className="flex-1 h-[3px] rounded-full transition-all"
                      style={{
                        backgroundColor: lv <= (word as any).metadata.intensity
                          ? `rgba(${conf.glow}, ${0.25 + lv * 0.15})`
                          : `rgba(${conf.glow}, 0.07)`,
                      }}
                    />
                  ))}
                  <span className="text-[7px] font-black ml-1 tabular-nums" style={{ color: conf.color }}>
                    {(word as any).metadata.intensity}/5
                  </span>
                </div>
              )}
            </div>

            {/* Arrow */}
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: conf.bg }}
            >
              <CaretRight size={18} weight="bold" style={{ color: conf.color }} />
            </motion.div>
          </div>
        </motion.div>
      </RouterLink>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
const SearchPage: React.FC = () => {
  const [mode, setMode] = useState<'search' | 'vibes'>('vibes');
  const [query, setQuery] = useState('');
  const [allWords, setAllWords] = useState<WordDetail[]>([]);
  const [dbCores, setDbCores] = useState<string[]>([]);
  const [selectedCore, setSelectedCore] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [wordsData, coresData] = await Promise.all([
          emotionAPI.getWords(),
          emotionAPI.getCores(),
        ]);
        setAllWords(wordsData as WordDetail[]);
        setDbCores(coresData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allWords
      .filter(w => 
        w.word.toLowerCase().includes(q) ||
        w.category?.toLowerCase().includes(q) ||
        w.core?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aExact = a.word.toLowerCase().startsWith(q);
        const bExact = b.word.toLowerCase().startsWith(q);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.word.localeCompare(b.word);
      })
      .slice(0, 30);
  }, [query, allWords]);

  const vibeResults = useMemo(() => {
    if (!selectedCore) return [];
    return allWords
      .filter(w => w.core === selectedCore)
      .sort((a, b) => a.word.localeCompare(b.word))
      .slice(0, 30);
  }, [selectedCore, allWords]);

  const results = mode === 'search' ? searchResults : vibeResults;
  const isBrowsing = mode === 'search' ? !query : !selectedCore;

  const activeMappedKey = selectedCore ? matchCoreToConfig(selectedCore) : null;
  const activeConf = activeMappedKey ? CORES[activeMappedKey] : null;

  const recentSearches: string[] = JSON.parse(localStorage.getItem('recent_searches') || '[]').slice(0, 4);
  const saveSearch = (term: string) => {
    const prev: string[] = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    localStorage.setItem('recent_searches', JSON.stringify([term, ...prev.filter(t => t !== term)].slice(0, 5)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFDFD] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          className="w-9 h-9 rounded-full border-2 border-[#1a6b5a] border-t-transparent"
        />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#1a6b5a]/30">Feeling the flow</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDFD] pb-36 font-body relative overflow-hidden">

      {/* ── Ambient orbs ── */}
      <FloatingOrb color="#8b5cf6" size={320} x="58%" y="-8%" delay={0} />
      <FloatingOrb color="#1a6b5a" size={220} x="-12%" y="28%" delay={1.5} />
      <FloatingOrb color="#ec4899" size={180} x="72%" y="58%" delay={3} />

      <div className="max-w-[430px] mx-auto px-5 pt-11 space-y-7 relative z-10">

        {/* ═══════════════════════════════════
            1. HEADER
        ═══════════════════════════════════ */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[8px] font-black uppercase tracking-[0.45em] text-secondary/25 mb-1 flex items-center gap-1.5">
            <Command size={10} weight="bold" /> Discovery Center
          </p>
          <h1 className="text-[2.35rem] font-heading font-black text-primary tracking-[-0.04em] leading-none italic">
            Find your{' '}
            <AnimatePresence mode="wait">
              {activeConf ? (
                <motion.span
                  key={selectedCore}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  style={{ color: activeConf.color, textDecorationColor: `${activeConf.color}30` } as any}
                  className="underline decoration-4 underline-offset-4 inline-block"
                >
                  {selectedCore}.
                </motion.span>
              ) : (
                <motion.span
                  key="vibe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#1a6b5a] underline decoration-4 underline-offset-4 decoration-[#1a6b5a]/20"
                >
                  Vibe.
                </motion.span>
              )}
            </AnimatePresence>
          </h1>
        </motion.div>

        {/* ── MODE TOGGLE (Premium Discovery Blue) ── */}
        <div className="relative bg-secondary/5 p-1.5 rounded-[1.8rem] flex items-center border border-primary/5">
          <motion.div
            className="absolute inset-y-1.5 rounded-[1.5rem] bg-[#3b82f6] shadow-xl shadow-blue-500/30 pointer-events-none"
            initial={false}
            animate={{ 
              left: mode === 'search' ? '6px' : '50%',
              right: mode === 'search' ? '50%' : '6px'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => setMode('search')}
            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${mode === 'search' ? 'text-white' : 'text-secondary/40'}`}
          >
            Smart Search
          </button>
          <button
            onClick={() => setMode('vibes')}
            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${mode === 'vibes' ? 'text-white' : 'text-secondary/40'}`}
          >
            Mood Spectrum
          </button>
        </div>

        {/* ═══════════════════════════════════
            2. HERO SEARCH BAR
        ═══════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {mode === 'search' && (
            <motion.div
              key="search-box"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-0.5 rounded-[2rem] pointer-events-none"
                animate={{
                  boxShadow: focused
                    ? '0 0 0 3px rgba(26,107,90,0.15), 0 12px 50px rgba(26,107,90,0.12)'
                    : '0 0 0 0px transparent, 0 4px 20px rgba(0,0,0,0.04)',
                }}
                transition={{ duration: 0.35 }}
              />

              <div
                className="relative flex items-center bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-500"
                style={{
                  border: focused ? '1.5px solid rgba(26,107,90,0.3)' : '1.5px solid rgba(0,0,0,0.06)',
                  boxShadow: focused ? '0 20px 60px rgba(26,107,90,0.12)' : '0 10px 30px rgba(0,0,0,0.04)',
                }}
              >
                <div className="pl-6 pr-3 py-5 flex-shrink-0">
                  <motion.div
                    animate={{
                      color: query ? '#1a6b5a' : focused ? '#1a6b5a' : '#cbd5e1',
                      scale: focused ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <MagnifyingGlass size={22} weight={query ? 'bold' : 'regular'} />
                  </motion.div>
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="How are you feeling?"
                  className="flex-1 bg-transparent border-none py-5 text-[1.1rem] font-body font-semibold text-primary placeholder:text-primary/20 focus:ring-0 focus:outline-none"
                />

                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setQuery(''); searchInputRef.current?.focus(); }}
                      className="pr-5"
                    >
                      <div className="w-7 h-7 bg-secondary/8 rounded-full flex items-center justify-center hover:bg-secondary/15 transition-colors">
                        <X size={14} weight="bold" className="text-secondary/50" />
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {focused && !query && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-[1.6rem] border border-primary/[0.07] shadow-xl p-4 z-50 space-y-2"
                  >
                    {recentSearches.length > 0 ? (
                      <>
                        <p className="text-[7.5px] font-black uppercase tracking-[0.4em] text-secondary/30 px-2 flex items-center gap-1.5">
                          <Clock size={9} weight="bold" /> Recent
                        </p>
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onMouseDown={() => { setQuery(term); saveSearch(term); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-light-bg transition-colors text-left group"
                          >
                            <Clock size={14} weight="duotone" className="text-secondary/25 flex-shrink-0" />
                            <span className="text-[13px] font-heading font-black text-primary italic group-hover:text-[#1a6b5a] transition-colors">{term}</span>
                            <ArrowRight size={13} weight="bold" className="ml-auto text-secondary/15 group-hover:text-[#1a6b5a] transition-colors" />
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <SmileyWink size={16} weight="duotone" className="text-secondary/25" />
                        <p className="text-[11px] font-body text-secondary/35 italic">Type to discover…</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═══════════════════════════════════
              3. EMOTION CORE GRID
          ═══════════════════════════════════ */}
          {mode === 'vibes' && (
            <motion.div
              key="vibes-grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-[8px] font-black uppercase tracking-[0.35em] text-secondary/25 flex items-center gap-1.5">
                  <Sparkle size={10} weight="duotone" className="text-accent" /> Emotion Cores
                </p>
                {selectedCore && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCore('')}
                    className="text-[7.5px] font-black uppercase tracking-widest text-secondary/30 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <X size={9} weight="bold" /> Clear
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-x-1.5 gap-y-4">
                {/* Reset Option */}
                <CoreCard 
                  name="All" 
                  conf={{ 
                    icon: <InfinityIcon weight="bold" size={26} />, 
                    color: '#64748b', 
                    bg: '#f8fafc', 
                    glow: '100,116,139',
                    emoji: '🌍',
                    gradient: ''
                  }}
                  isSelected={!selectedCore}
                  onClick={() => setSelectedCore('')}
                  index={-1}
                />
                {dbCores.map((dbCoreName, idx) => {
                  const mappedKey = matchCoreToConfig(dbCoreName);
                  const conf = CORES[mappedKey];
                  return (
                    <CoreCard
                      key={dbCoreName}
                      name={dbCoreName}
                      conf={conf}
                      isSelected={selectedCore === dbCoreName}
                      onClick={() => {
                        setSelectedCore(prev => prev === dbCoreName ? '' : dbCoreName);
                      }}
                      index={idx}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════
            4. BROWSE or RESULTS
        ═══════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {isBrowsing ? (

            /* ── Browse state ── */
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >

              {/* Invite hero card (Reverted to Green blobs) */}
              <motion.div
                whileHover={{ y: -5, scale: 1.008 }}
                className="relative bg-primary rounded-[2.2rem] p-8 text-white overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(26,107,90,0.22)' }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-[2.2rem] pointer-events-none">
                  <motion.div
                    className="absolute -top-12 -right-12 w-52 h-52 bg-white/[0.08] rounded-full"
                    animate={{ scale: [1, 1.18, 1], rotate: [0, 25, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/[0.05] rounded-full"
                    animate={{ scale: [1, 1.22, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <GlobeHemisphereWest size={13} weight="duotone" className="text-white/40" />
                    <p className="text-[7.5px] font-black uppercase tracking-[0.45em] text-white/40">The Spectrum Awaits</p>
                  </div>
                  <h3 className="text-[1.6rem] font-heading font-black italic tracking-tight leading-snug">
                    Every feeling has a name.<br />Find yours today.
                  </h3>
                  <p className="text-[11px] font-body text-white/55 leading-relaxed">
                    Tap a core above, search any emotion, or pick a word that resonates right now.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Star size={11} weight="duotone" className="text-white/30" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                      {allWords.length} emotions in the library
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          ) : (

            /* ── Results state ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 pb-8"
            >
              <motion.div
                className="flex items-center justify-between px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 }}
              >
                <div>
                  <h2 className="text-[1.25rem] font-heading font-black text-primary italic tracking-tight">
                    {results.length} {results.length === 1 ? 'word' : 'words'} found
                  </h2>
                  {selectedCore && activeConf && (
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 mt-0.5" style={{ color: activeConf.color }}>
                      <span>{activeConf.emoji}</span> {selectedCore}
                    </p>
                  )}
                </div>
                {results.length > 0 && (
                  <span className="text-[7.5px] font-black text-secondary/20 uppercase tracking-widest flex items-center gap-1">
                    <Eye size={9} weight="duotone" /> Tap to explore
                  </span>
                )}
              </motion.div>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((word, idx) => {
                    const mappedKey = matchCoreToConfig(word.core);
                    const conf = CORES[mappedKey];
                    return <WordCard key={word.word} word={word} conf={conf} index={idx} />;
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 text-center space-y-5"
                >
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-6xl mx-auto"
                  >
                    🔍
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-[1.05rem] font-heading font-black text-primary italic">No resonance found</p>
                    <p className="text-[8.5px] font-black uppercase tracking-widest text-secondary/25">Try a different feeling</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setQuery(''); setSelectedCore(''); }}
                    className="text-[8px] font-black uppercase tracking-widest text-[#1a6b5a] border border-[#1a6b5a]/20 rounded-full px-7 py-2.5 hover:bg-[#1a6b5a] hover:text-white transition-all duration-300"
                  >
                    Reset & Explore
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
