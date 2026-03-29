import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    CaretLeft, CaretRight, Sparkle, ArrowUpRight, Lightning, 
    Compass, ArrowRight, FileText, FileArrowDown,
    CircleNotch, TrendUp
} from '@phosphor-icons/react';
import { emotionAPI } from '../services/api';

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [viewDate, setViewDate] = useState(new Date());
    const [history, setHistory] = useState<any[]>([]);
    const [selDay, setSelDay] = useState(formatDate(new Date()));
    const [loading, setLoading] = useState(true);
    const [isAnalyzingWeekly, setIsAnalyzingWeekly] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await emotionAPI.getJournalHistory();
                setHistory(res.entries || []);
            } catch (e) {
                console.error("Archive Sync Fail:", e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const dataMap = useMemo(() => {
        const map: Record<string, any[]> = {};
        history.forEach(item => {
            if (!item.data?.created_at) return;
            const key = formatDate(new Date(item.data.created_at));
            if (!map[key]) map[key] = [];
            map[key].push(item);
        });
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());
        });
        return map;
    }, [history]);

    const streakData = useMemo(() => {
        const dates = Object.keys(dataMap).sort().reverse();
        if (dates.length === 0) return { current: 0, highest: 0 };
        
        let current = 0;
        let highest = 0;
        let temp = 0;
        
        // Calculate Current Streak
        let currDate = new Date();
        currDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < dates.length; i++) {
            const d = new Date(dates[i]);
            d.setHours(0, 0, 0, 0);
            const diff = (currDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 0 || diff === 1) {
                current++;
                currDate = d;
            } else if (diff > 1) break;
        }

        // Calculate Highest Streak
        const sortedDates = Object.keys(dataMap).sort();
        if (sortedDates.length > 0) {
            temp = 1;
            highest = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const d1 = new Date(sortedDates[i-1]);
                const d2 = new Date(sortedDates[i]);
                const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    temp++;
                } else {
                    temp = 1;
                }
                if (temp > highest) highest = temp;
            }
        }

        return { current, highest };
    }, [dataMap]);

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const grid = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => formatDate(new Date(year, month, i + 1)))
    ];

    const activeItems = useMemo(() => {
        return dataMap[selDay] || [];
    }, [dataMap, selDay]);

    const journalEntries = activeItems.filter(i => i.type === 'journal');
    const learnedWords = activeItems.filter(i => i.type === 'learned_word');

    const insight = useMemo(() => {
        const journals = history.filter(i => i.type === 'journal');
        return journals.length > 5
            ? "Your journey of self-discovery is gaining momentum."
            : "Every small step in reflection leads to deeper self-awareness.";
    }, [history]);

    const handleMonthlyExport = async () => {
        setIsAnalyzingWeekly(true);
        try {
            await emotionAPI.exportReport();
        } catch (e) {
            console.error("Monthly Export Fail:", e);
        } finally {
            setIsAnalyzingWeekly(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <CircleNotch className="w-12 h-12 text-primary animate-spin" weight="bold" />
                    <p className="text-[10px] font-heading font-black tracking-widest text-primary/40 uppercase">Syncing Timeline</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-dark-bg pb-32 pt-16 w-screen relative overflow-x-hidden left-0">
            <div className="px-6 mx-auto space-y-8">
                
                {/* PREMIUM HEADER SECTION */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-4 pt-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-heading font-black uppercase tracking-[0.4em] text-secondary/40">Personal Chronicle</span>
                    </div>
                    <h1 className="text-[3.2rem] font-heading font-black text-primary leading-[0.85] tracking-tighter italic">
                        Soul <br/>
                        <span className="text-accent underline decoration-4 decoration-accent/10 underline-offset-[12px]">Timeline.</span>
                    </h1>
                    <p className="text-sm font-body font-bold text-secondary/60 leading-tight border-l-2 border-accent/20 pl-4 py-1">
                        A beautiful history of your emotional evolution, <br/> 
                        one feeling at a time.
                    </p>
                </motion.div>

                {/* ARCHIVE EXPORT (GREEN PREMIUM ANALYTICS) */}
                <motion.button 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleMonthlyExport}
                    disabled={isAnalyzingWeekly}
                    className="w-full bg-[#3e685f] p-5 rounded-[2.5rem] flex items-center justify-between group shadow-xl shadow-[#3e685f]/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl text-white relative overflow-hidden">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-md"></motion.div>
                            <FileArrowDown size={28} weight="regular" className="relative z-10" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-heading font-black text-white/50 uppercase tracking-[0.3em] mb-1">Analytics</p>
                            <h4 className="text-[1.3rem] font-heading font-black text-white italic tracking-tight leading-none">Download PDF Report</h4>
                        </div>
                    </div>
                    {isAnalyzingWeekly ? (
                        <CircleNotch className="animate-spin text-white/40" weight="bold" />
                    ) : (
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ArrowRight size={24} className="text-white/40 group-hover:text-white transition-all" />
                        </motion.div>
                    )}
                </motion.button>

                {/* PREMIUM DUAL STREAK CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[3rem] p-8 shadow-xl shadow-black/5 flex flex-col justify-between h-[180px]"
                    >
                        <TrendUp className="text-accent" size={32} weight="bold" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-heading font-black text-secondary/40 uppercase tracking-[0.2em] block">Current Streak</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-heading font-black text-primary tracking-tighter">{streakData.current}</span>
                                <span className="text-lg font-heading font-black text-accent italic">Streaks</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#3e685f] rounded-[3rem] p-8 shadow-xl shadow-black/10 flex flex-col justify-between h-[180px]"
                    >
                        <Lightning className="text-white/40" size={32} weight="fill" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-heading font-black text-white/40 uppercase tracking-[0.2em] block">Highest Streak</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-heading font-black text-white tracking-tighter">{streakData.highest}</span>
                                <span className="text-lg font-heading font-black text-white italic">Streaks</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CALENDAR CARD */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-primary/5 shadow-xl shadow-secondary/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-heading font-black text-primary">
                            {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate)}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 bg-light-bg rounded-xl text-primary hover:bg-primary hover:text-white transition-all">
                                <CaretLeft size={18} weight="bold" />
                            </button>
                            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 bg-light-bg rounded-xl text-primary hover:bg-primary hover:text-white transition-all">
                                <CaretRight size={18} weight="bold" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-heading font-black text-primary/20 uppercase tracking-widest">{d}</div>
                        ))}
                        {grid.map((date, idx) => {
                            if (!date) return <div key={idx} className="aspect-square" />;
                            const dStr = date as string;
                            const isSel = selDay === dStr;
                            const hasAct = (dataMap[dStr] || []).length > 0;
                            const dayNum = new Date(dStr).getDate();
                            const isToday = dStr === formatDate(new Date());

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelDay(dStr)}
                                    className={`relative aspect-square rounded-xl flex items-center justify-center text-sm font-heading font-black transition-all ${isSel 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                        : isToday 
                                            ? 'bg-accent/10 text-accent border border-accent/20'
                                            : hasAct ? 'text-primary bg-white shadow-md border border-primary/10' : 'text-primary/70 bg-primary/5 hover:bg-primary/10'}`}
                                >
                                    {dayNum}
                                    {hasAct && !isSel && (
                                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent shadow-sm"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DAILY ACTIVITY */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-heading font-black uppercase tracking-[0.3em] text-secondary/40">
                             Activity Details
                        </h3>
                        <span className="text-xs font-heading font-bold text-primary">{new Date(selDay).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    {activeItems.length > 0 ? (
                        <div className="space-y-4">
                            {journalEntries.map((item, i) => (
                                <div key={i} className="bg-white rounded-3xl p-6 border border-primary/5 shadow-xl shadow-secondary/5 space-y-4 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                                <FileText size={16} weight="duotone" />
                                            </div>
                                            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-primary/40">Journal Entry</span>
                                        </div>
                                        <span className="text-[10px] font-heading font-bold text-primary/20">
                                            {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-primary font-body font-medium italic">"{item.data.entry_text}"</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.data.detected_emotions?.map((e: any, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-light-bg text-primary text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {e.word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                             {learnedWords.map((item, i) => {
                                const theWord = item.data.word_details?.word || item.data.word || "Unknown";
                                return (
                                <div key={`learned-${i}`} className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 opacity-40">
                                            <Sparkle size={14} weight="duotone" />
                                            <span className="text-[10px] font-heading font-black uppercase tracking-widest">Learned Today</span>
                                        </div>
                                        <h4 className="text-2xl font-heading font-black tracking-tight">{theWord}</h4>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/word/${theWord}`)}
                                        className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"
                                    >
                                        <ArrowUpRight size={20} weight="bold" />
                                    </button>
                                </div>
                                );
                             })}
                        </div>
                    ) : (
                        <div className="bg-white/50 rounded-3xl p-12 border border-dashed border-primary/10 text-center space-y-4">
                            <Compass className="w-10 h-10 text-primary/10 mx-auto" weight="duotone" />
                            <p className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-secondary/30">No activity discovered yet</p>
                        </div>
                    )}
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-2 text-accent">
                        <Lightning size={18} weight="fill" />
                        <span className="text-[10px] font-heading font-black uppercase tracking-widest">Strategic Insight</span>
                    </div>
                    <p className="text-primary font-heading font-bold italic leading-tight">
                        "{insight}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
