import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Heart, Brain, Microphone, Stop, CaretLeft, 
  PaperPlaneTilt, Sparkle, Wind, Ghost, ShieldCheck, 
  Binoculars, Tree, Waves, Flower, Flame, Lightning,
  ArrowRight, Pulse, Compass
} from '@phosphor-icons/react';
import { emotionAPI, JournalResponse } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// 🎨 WHATSAPP STYLE (APPLE) PREMIUM EMOJI PALETTE
const MOODS = [
  {
    label: 'Radiant',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Smiling%20Eyes.png',
    color: '#854d0e',
    bg: '#FFFAF0',
    accent: '#e9a23b',
    icon: <Sun size={24} weight="duotone" />
  },
  {
    label: 'Peaceful',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Relieved%20Face.png',
    color: '#065f46',
    bg: '#F2F8F5',
    accent: '#10b981',
    icon: <Tree size={24} weight="duotone" />
  },
  {
    label: 'Centered',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Neutral%20Face.png',
    color: '#334155',
    bg: '#F8FAFC',
    accent: '#64748b',
    icon: <ShieldCheck size={24} weight="duotone" />
  },
  {
    label: 'Melancholy',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Frowning%20Face.png',
    color: '#3730a3',
    bg: '#F5F7FF',
    accent: '#6366f1',
    icon: <Waves size={24} weight="duotone" />
  },
  {
    label: 'Intense',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Loudly%20Crying%20Face.png',
    color: '#9f1239',
    bg: '#FFF5F6',
    accent: '#f43f5e',
    icon: <Flame size={24} weight="duotone" />
  },
];

const JournalPage: React.FC = () => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<number>(2);
  const [result, setResult] = useState<JournalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleVoiceSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      toast('Listening...', { icon: '🎙️', style: { background: '#1a6b5a', color: '#fff', borderRadius: '1rem' }});
    } catch (err) {
      toast.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    setLoading(true);
    const loadingToast = toast.loading('Analyzing your voice...');
    try {
      const response = await emotionAPI.submitVoiceJournal(audioBlob);
      if ('error' in response) {
        toast.error('Analysis failed. Try typing.');
      } else {
        const res = response as JournalResponse & { transcript?: string };
        setResult(res);
        if (res.transcript) setEntry(res.transcript);
        toast.success('Emotions captured!', { id: loadingToast });
        setTimeout(() => {
          document.getElementById('analysis-dashboard')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } catch (error: any) {
      toast.error('System error. Please try again later.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setLoading(true);
    const loadingToast = toast.loading('Processing your thoughts...');
    try {
      const response = await emotionAPI.submitJournal(entry);
      if ('error' in response) {
        toast.error('Failed to analyze. Please try again.', { id: loadingToast });
      } else {
        setResult(response as JournalResponse);
        toast.success('Insight generated!', { id: loadingToast });
        setTimeout(() => {
          setEntry(''); // Clear entry on success for a "pro" feel
          document.getElementById('analysis-dashboard')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } catch (error: any) {
      toast.error('Connection error.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const activeMood = MOODS[selectedMood];
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div 
      className="min-h-screen transition-colors duration-1000 text-dark-bg pb-40 pt-10 px-6 font-body"
      style={{ backgroundColor: activeMood.bg }}
    >
      <div className="max-w-[430px] mx-auto space-y-10 relative z-10">
        
        {/* Dynamic Ambient Background Elements */}
        <motion.div 
            animate={{ 
                opacity: [0.05, 0.12, 0.05],
                scale: [1, 1.3, 1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"
            style={{ backgroundColor: activeMood.accent + '33' }}
        />
        
        {/* HEADER */}
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between"
        >
            <button onClick={() => navigate(-1)} className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 text-primary">
                <CaretLeft size={20} weight="bold" />
            </button>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30">Sanctuary Mode</p>
                <p className="text-xs font-black text-primary italic opacity-60">{currentDate}</p>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
        >
            <h1 className="text-4xl font-heading font-black text-primary leading-none tracking-tighter">
                What's on your <br/>
                <span className="italic" style={{ color: activeMood.accent }}>mind?</span>
            </h1>
            <p className="text-[11px] font-body font-medium text-secondary/40 leading-relaxed max-w-[280px]">
                Your sanctuary for self-clarity. Every thought you honor here builds the bridge to a more resilient you.
            </p>
        </motion.div>

        {/* MOOD PICKER (Dynamic themed glass) */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-[2.5rem] p-8 shadow-2xl transition-all duration-1000 border border-primary/5`}
            style={{ 
              boxShadow: `0 30px 60px -15px rgba(${activeMood.accent.includes('amber') ? '251,191,36' : 
                               activeMood.accent.includes('emerald') ? '52,211,153' : 
                               activeMood.accent.includes('slate') ? '148,163,184' : 
                               activeMood.accent.includes('indigo') ? '129,140,248' : '251,113,133'}, 0.12)`
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">Mood Signature</span>
                <motion.span 
                    key={activeMood.label}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="px-4 py-1.5 rounded-xl text-[10px] font-black text-white uppercase shadow-xl"
                    style={{ backgroundColor: activeMood.accent }}
                >
                    {activeMood.label}
                </motion.span>
            </div>
            <div className="flex justify-between items-center relative gap-2 px-2">
                {MOODS.map((m, idx) => {
                    const isActive = selectedMood === idx;
                    return (
                        <div key={idx} className="relative flex flex-col items-center">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => setSelectedMood(idx)}
                                className={`relative h-16 w-16 flex items-center justify-center transition-all duration-500 ${isActive ? 'z-10' : 'opacity-20 grayscale hover:opacity-100'}`}
                            >
                                <motion.img 
                                    animate={{ 
                                      y: isActive ? -12 : 0,
                                      scale: isActive ? 1.4 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    src={m.img} 
                                    alt={m.label} 
                                    className="w-11 h-11 relative z-10" 
                                />
                                {isActive && (
                                    <motion.div 
                                        layoutId="emoji-glow"
                                        className="absolute inset-0 bg-white/60 blur-2xl rounded-full scale-110" 
                                    />
                                )}
                            </motion.button>
                        </div>
                    );
                })}
            </div>
        </motion.div>

        {/* WRITING CONSOLE */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`bg-white rounded-[3rem] transition-all duration-1000 border border-primary/5 flex flex-col min-h-[380px] relative overflow-hidden`}
            style={{ 
              boxShadow: `0 40px 80px -20px rgba(0,0,0,0.08)`
            }}
        >
            <AnimatePresence>
                {isRecording && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-8 text-white p-10 backdrop-blur-md"
                        style={{ 
                          backgroundColor: activeMood.accent.includes('amber') ? '#d97706ee' : 
                                           activeMood.accent.includes('emerald') ? '#059669ee' : 
                                           activeMood.accent.includes('slate') ? '#475569ee' : 
                                           activeMood.accent.includes('indigo') ? '#4f46e5ee' : '#e11d48ee'
                        }}
                    >
                        <div className="flex gap-2 items-center h-20">
                            {[1,1,1,1,1,1,1,1].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [20, Math.random()*80 + 20, 20] }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                    className="w-1.5 bg-white/40 rounded-full"
                                />
                            ))}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xl font-heading font-black italic tracking-tight">Capturing Voice...</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Emolit Listener Active</p>
                        </div>
                        <button 
                            onClick={stopRecording}
                            className="bg-white text-primary px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-transform shadow-2xl shadow-black/20"
                        >
                            <Stop size={16} weight="fill" /> Finalize Voice
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 p-10 flex flex-col">
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Drop your thoughts here..."
                  className="flex-1 w-full bg-transparent border-none resize-none text-2xl text-primary placeholder:text-secondary/10 focus:ring-0 leading-relaxed font-body font-bold focus:outline-none min-h-[200px]"
                />

                <div className="mt-8 flex items-center gap-4">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={startRecording}
                      type="button"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
                      style={{ 
                          backgroundColor: activeMood.accent + '22',
                          color: activeMood.accent
                      }}
                    >
                        <Microphone size={24} weight="duotone" />
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading || !entry.trim()}
                      className="flex-1 text-white h-14 rounded-2xl shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all overflow-hidden relative group"
                      style={{ 
                          backgroundColor: activeMood.accent,
                          boxShadow: `0 20px 40px ${activeMood.accent}33`
                      }}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] ml-2">Analyze Pattern</span>
                                <PaperPlaneTilt size={20} weight="duotone" className="group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-500" />
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>

        {/* RESULTS - LIQUID PRESENTATION */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="analysis-dashboard" 
                    className="space-y-8 pb-10"
                >
                            <div className="flex items-center gap-4">
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/5"></div>
                                <h2 className="text-lg font-black text-primary italic px-4">Instant Insight</h2>
                                <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/5"></div>
                            </div>

                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
                            >
                                <Sparkle className="absolute right-6 top-6 w-20 h-20 text-white/5 rotate-12" />
                                <div className="flex items-center gap-3 mb-6">
                                    <Brain size={16} className="text-accent" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/40">Neural Mirror</span>
                                </div>
                                <p className="text-2xl font-heading font-black leading-tight italic relative z-10">
                                    "{result.pattern_insight}"
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 gap-6">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className={`rounded-[2.5rem] p-10 backdrop-blur-md border border-white/40 shadow-xl transition-all duration-1000 space-y-8`}
                                    style={{ 
                                        backgroundColor: activeMood.bg + 'BB'
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart size={20} className="text-rose-500/40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary/30">Detected Shifts</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.detected_emotions?.map((e, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-white/50 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest border border-primary/5">
                                                {e.word}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-lg font-body font-medium text-secondary/70 leading-relaxed border-l-4 border-accent/20 pl-6 italic">
                                        {result.emotional_observation}
                                    </p>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className={`border border-white/20 rounded-[2.5rem] p-10 space-y-4 backdrop-blur-sm transition-all duration-1000`}
                                    style={{ 
                                        backgroundColor: activeMood.bg + '77'
                                    }}
                                >
                                    <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-primary/60">
                                        <Pulse size={16} weight="bold" /> Regulation Protocol
                                    </div>
                                    <p className="text-lg font-heading font-black text-primary leading-tight">
                                        {result.regulation_suggestion}
                                    </p>
                                </motion.div>

                                 <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white border border-primary/5 rounded-[2.5rem] p-10 text-center space-y-4 transition-all duration-1000"
                                >
                                     <Sparkle className="w-5 h-5 text-accent mx-auto" weight="duotone" />
                                     <p className="text-xl font-heading font-black text-primary italic leading-tight">
                                        "{result.reflection_question}"
                                     </p>
                                </motion.div>

                                {/* SOUL COMPASS / CTA - High Contrast Signature Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="relative p-12 rounded-[3rem] overflow-hidden shadow-2xl group"
                                    style={{ 
                                      backgroundColor: activeMood.accent,
                                      boxShadow: `0 30px 60px -15px ${activeMood.accent}66`
                                    }}
                                >
                                    {/* Decorative Mesh */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
                                    
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                                <Compass size={24} weight="duotone" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 block">Inner Guidance</span>
                                                <h3 className="text-xl font-heading font-black text-white italic">Soul Compass</h3>
                                            </div>
                                        </div>

                                        <p className="text-xl font-heading font-black text-white leading-tight italic">
                                            "Acknowledge how far you've come today. Self-reflection is not just an act, it's a practice of self-love."
                                        </p>

                                        <div className="h-[1px] w-full bg-white/20" />

                                        <p className="text-[11px] font-body text-white/70 leading-relaxed font-bold">
                                            Your emotional patterns build over time. Checking in daily is how you turn these small insights into lasting mental clarity. See you tomorrow for your next step.
                                        </p>

                                        <button 
                                            onClick={() => navigate('/')}
                                            className="w-full py-4 bg-white text-primary rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                                        >
                                            Continue Journey <ArrowRight size={16} weight="bold" />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JournalPage;
