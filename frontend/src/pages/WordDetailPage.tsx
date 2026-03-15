import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { emotionAPI, WordDetail } from '../services/api';
import { 
  CaretLeft, 
  Lightning, 
  BookOpen, 
  Brain, 
  Sparkle, 
  Waveform, 
  CircleNotch,
  Bookmark,
  Quotes
} from '@phosphor-icons/react';

const THEME_HUES: Record<string, string> = {
  'Happy': 'text-[#3aaf87]',
  'Joy': 'text-[#8b5cf6]', // Premium Purple from the image
  'Surprised': 'text-[#8b5cf6]',
  'Positive': 'text-[#8b5cf6]',
  'Angry': 'text-[#ef4444]',
  'Sad': 'text-[#3b82f6]',
  'Fearful': 'text-[#f59e0b]',
  'Disgusted': 'text-[#10b981]',
  'Bad': 'text-[#64748b]',
};

const WordDetailPage: React.FC = () => {
  const { wordName } = useParams<{ wordName: string }>();
  const navigate = useNavigate();
  const [word, setWord] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchWord = async () => {
      if (!wordName) return;
      try {
        const wordData = await emotionAPI.getWordDetails(wordName);
        setWord(wordData);
        // Check if already saved
        try {
          const { saved_words } = await emotionAPI.getSavedWords();
          setSaved(saved_words.some((w: any) => w.word === wordData.word));
        } catch { /* not authenticated or no saved words yet */ }
        
        try {
          // Track this discovery in MongoDB timeline
          await emotionAPI.trackWordLearned(wordData);
        } catch { /* silently track error */ }

      } catch (err) {
        setError('Word not found');
      } finally {
        setLoading(false);
      }
    };
    fetchWord();
  }, [wordName]);

  const handleSave = async () => {
    if (!word || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await emotionAPI.unsaveWord(word.word);
        setSaved(false);
        setSaveMsg('Removed');
      } else {
        await emotionAPI.saveWord(word);
        setSaved(true);
        setSaveMsg('Saved!');
      }
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      setSaveMsg('Error');
      setTimeout(() => setSaveMsg(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <CircleNotch className="w-10 h-10 text-primary animate-spin" weight="bold" />
      </motion.div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Extracting Nuance</p>
    </div>
  );

  if (error || !word) return (
    <div className="min-h-screen bg-[#FBFDFD] flex flex-col items-center justify-center text-center px-10 space-y-6">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
        <Sparkle className="w-8 h-8 opacity-20" weight="duotone" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-heading font-black text-primary tracking-tighter">Echo Not Found</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/30">Linguistic frequency missing</p>
      </div>
      <button 
        onClick={() => navigate(-1)} 
        className="px-8 py-4 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 transition-transform active:scale-95"
      >
        Go Back
      </button>
    </div>
  );

  const themeColor = THEME_HUES[word.core] || 'text-primary';

  return (
    <div className="min-h-screen bg-[#FBFDFD] pb-40 pt-10 font-body">
      <div className="max-w-[430px] mx-auto px-6 space-y-10 relative z-10">
        
        {/* NAV & HEADER */}
        <div className="space-y-8">
          {/* Back button + Bookmark button */}
          <div className="flex items-center justify-between">
            <motion.button 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => navigate(-1)} 
              className="p-3 bg-white rounded-full shadow-sm border border-primary/5 text-primary active:scale-95 transition-transform"
            >
              <CaretLeft size={20} weight="bold" />
            </motion.button>

            {/* BOOKMARK / SAVE BUTTON */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              {saveMsg && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[8px] font-black uppercase tracking-widest text-accent"
                >
                  {saveMsg}
                </motion.span>
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                animate={saved ? { scale: [1, 1.25, 1] } : {}}
                onClick={handleSave}
                disabled={saving}
                className={`p-3 rounded-full border shadow-sm transition-all duration-300 ${
                  saved
                    ? 'bg-accent border-accent/20 text-white shadow-accent/20'
                    : 'bg-white border-primary/5 text-primary/40 hover:text-accent hover:border-accent/20'
                }`}
              >
                <Bookmark size={18} weight={saved ? 'fill' : 'regular'} />
              </motion.button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
               <div className="flex items-center gap-3">
                   <span className="px-4 py-1.5 bg-white border border-primary/5 rounded-xl shadow-sm text-[10px] font-black text-primary/40 uppercase tracking-widest">
                       {word.category}
                   </span>
                   <div className="flex items-center gap-4 px-4 py-2 bg-white border border-primary/5 rounded-xl shadow-sm">
                        <Waveform size={14} weight="bold" className="text-secondary/20" />
                        <div className="flex items-center gap-1.5 h-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <motion.div 
                                    key={i} 
                                    initial={{ height: 0 }}
                                    animate={{ height: i <= word.metadata.intensity ? '100%' : '20%' }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className={`w-1.5 rounded-full ${i <= word.metadata.intensity ? 'bg-accent' : 'bg-primary/5'}`}
                                />
                            ))}
                        </div>
                   </div>
               </div>
               <h1 className={`text-7xl font-heading font-black italic tracking-tighter leading-none transition-all duration-700 ${themeColor}`}>
                 {word.word}.
               </h1>
          </motion.div>
        </div>

        {/* DEFINITION CARD */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-xl shadow-secondary/5 space-y-6 relative overflow-hidden"
        >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="flex items-center gap-3 text-secondary/30">
                 <BookOpen size={16} weight="duotone" />
                 <span className="text-[9px] font-black uppercase tracking-[0.35em]">Soul Essence</span>
             </div>
             <p className="text-[1.35rem] font-heading font-black text-primary/80 leading-[1.4] tracking-tight relative z-10 italic">
               {word.metadata.definition}
             </p>
        </motion.div>

        {/* EXAMPLE CARD */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group"
        >
            <Sparkle className="absolute right-6 top-6 w-20 h-20 text-white/5 rotate-12" weight="duotone" />
            <div className="relative z-10 space-y-5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/35">Living Context</span>
                <p className="text-[1.2rem] font-heading font-black italic text-white leading-[1.5] tracking-tight">
                  &ldquo;{word.metadata.example}&rdquo;
                </p>
            </div>
        </motion.div>

        {/* REFLECTION & GROWTH GRID */}
        <div className="grid grid-cols-1 gap-6">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[2rem] p-8 border border-primary/5 shadow-xl shadow-secondary/5 space-y-4"
            >
                <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-widest">
                    <Brain size={18} weight="duotone" /> Deep Insight
                </div>
                <p className="text-lg font-heading font-black text-primary italic leading-tight">
                    {word.metadata.reflection_prompt}
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-accent/5 border border-accent/20 rounded-[2rem] p-8 space-y-4"
            >
                <div className="flex items-center gap-3 text-accent font-black text-[10px] uppercase tracking-widest">
                    <Sparkle size={18} weight="duotone" /> Growth Step
                </div>
                <p className="text-lg font-heading font-black text-primary leading-tight">
                    {word.metadata.growth_tip}
                </p>
            </motion.div>
        </div>

        {/* BODY SIGNALS */}
        {word.metadata.body_signal && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-[2rem] p-8 border border-primary/5 shadow-xl shadow-secondary/5 space-y-4"
          >
              <div className="flex items-center gap-3 text-rose-400 font-black text-[10px] uppercase tracking-widest">
                  <Lightning size={18} weight="duotone" /> Body Feeling
              </div>
              <p className="text-lg font-body font-bold text-secondary/60 leading-relaxed italic">
                {word.metadata.body_signal}
              </p>
          </motion.div>
        )}

        {/* SYNONYMS */}
        {word.metadata.synonyms?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-6 pt-4"
          >
            <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-primary/5"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/20">Related Resonance</h4>
                <div className="h-[1px] flex-1 bg-primary/5"></div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {word.metadata.synonyms.map((syn, i) => (
                <motion.span 
                    key={i} 
                    whileHover={{ scale: 1.1 }}
                    className="px-5 py-2.5 rounded-xl bg-white border border-primary/5 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm"
                >
                  {syn}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default WordDetailPage;
