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
      console.error('[Emolit] Voice Sync Error:', error);
      const detail = error.response?.data?.detail || error.message || 'Check your mic settings';
      toast.error(`Mic Sync Error: ${detail}`, { id: loadingToast });
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
      console.error('[Emolit] Analysis Sync Error:', error);
      const detail = error.response?.data?.detail || error.message || 'Check your connection';
      toast.error(`Sync Error: ${detail}`, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const activeMood = MOODS[selectedMood];
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div 
      className="min-h-screen transition-colors duration-1000 text-dark-bg pb-40 pt-10 px-6 font-body w-screen relative overflow-x-hidden left-0"
      style={{ backgroundColor: activeMood.bg }}
    >
      <div className="mx-auto space-y-6 relative z-10">
        
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
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30">Sanctuary Experience</p>
                <p className="text-xs font-black text-primary italic opacity-60">{currentDate}</p>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
        >
            <h1 className="text-2xl font-heading font-black text-primary leading-none tracking-tighter">
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
            className={`bg-white rounded-[2rem] p-6 shadow-xl transition-all duration-1000 border border-primary/5`}
            style={{ 
              boxShadow: `0 30px 60px -15px rgba(${activeMood.accent.includes('amber') ? '251,191,36' : 
                               activeMood.accent.includes('emerald') ? '52,211,153' : 
                               activeMood.accent.includes('slate') ? '148,163,184' : 
                               activeMood.accent.includes('indigo') ? '129,140,248' : '251,113,133'}, 0.12)`
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">Current Mood</span>
            </div>
            <div className="flex justify-center items-center relative gap-2">
                {MOODS.map((m, idx) => {
                    const isActive = selectedMood === idx;
                    return (
                        <div key={idx} className="relative flex flex-col items-center">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => setSelectedMood(idx)}
                                className={`relative h-14 w-14 flex items-center justify-center transition-all duration-500 ${isActive ? 'z-20' : 'opacity-20 grayscale hover:opacity-100'}`}
                            >
                                <motion.img 
                                    animate={{ 
                                      y: isActive ? -15 : 0,
                                      scale: isActive ? 1.5 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    src={m.img} 
                                    alt={m.label} 
                                    className="w-12 h-12 relative z-10 block mx-auto" 
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
            className={`bg-white rounded-[2rem] transition-all duration-1000 border border-primary/5 flex flex-col min-h-[300px] relative overflow-hidden`}
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

            <div className="flex-1 p-6 pb-4 flex flex-col">
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Drop your thoughts here..."
                  className="flex-1 w-full bg-transparent border-none resize-none text-xl text-primary placeholder:text-secondary/10 focus:ring-0 leading-relaxed font-body font-bold focus:outline-none min-h-[150px]"
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
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] ml-2">Analyze Thought</span>
                                <PaperPlaneTilt size={20} weight="duotone" className="group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-500" />
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>

        {/* RESULTS - RULER BENTO PROTOCOL */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    id="analysis-dashboard" 
                    className="space-y-6 pb-16"
                >
                    <div className="pt-4" />

                    <div className="flex flex-col gap-6">
                        {/* BOX 1: THE RULER ANALYSIS */}
                        <motion.div 
                            whileHover={{ y: -4 }}
                            className="bg-primary rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
                        >
                            <Sparkle className="absolute right-[-10%] top-[-10%] w-40 h-40 text-white/5 rotate-12" />
                            <div className="space-y-6 relative z-10">
                                
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/50">Emotion</p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {result.detected_emotions?.map((e, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10 uppercase tracking-widest">
                                                {e.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Recognize</p>
                                    <p className="text-sm font-body font-bold leading-relaxed">{result.recognize}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Understand</p>
                                    <p className="text-sm font-body font-bold text-white/80 leading-relaxed">{result.understand}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Label</p>
                                    <p className="text-sm font-body font-bold text-white/80 leading-relaxed">{result.label}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Express</p>
                                    <p className="text-sm font-body font-bold text-white/80 italic leading-relaxed">"{result.express}"</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Regulate</p>
                                    <p className="text-sm font-body font-bold text-white/80 leading-relaxed">{result.regulate}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* BOX 2: WHAT CAN BE DONE */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="relative p-10 rounded-[2.5rem] overflow-hidden group shadow-xl border border-primary/5 bg-white"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Compass size={20} weight="duotone" className="text-primary/40" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">What can be done</span>
                                </div>

                                <p className="text-sm font-body font-bold text-secondary leading-relaxed whitespace-pre-line">
                                    {result.growth_action}
                                </p>
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
