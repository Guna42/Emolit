import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api, { emotionAPI, JournalHistoryResponse, JournalStatsResponse, JournalEntry } from '../services/api';
import {
    Calendar as CalendarIcon, Brain, Sparkles, Clock,
    ChevronLeft, ChevronRight, FileDown, Loader2, ArrowRight,
    TrendingUp, Activity, Zap, Crown, Compass, Sparkle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDateToKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const JournalHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<JournalHistoryResponse | null>(null);
    const [stats, setStats] = useState<JournalStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());
    const [selDay, setSelDay] = useState(formatDateToKey(new Date()));
    const [isExporting, setIsExporting] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const [historyRes, statsRes] = await Promise.all([
                api.get(`/journal/history`),
                api.get('/journal/stats')
            ]);
            setHistory(historyRes.data);
            setStats(statsRes.data);
        } catch (err: any) {
            toast.error("Failed to sync history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const dataMap = useMemo(() => {
        const map: Record<string, any[]> = {};
        if (!history) return map;
        history.entries.forEach(item => {
            const entryDate = item.data?.created_at;
            if (!entryDate) return;
            const key = formatDateToKey(new Date(entryDate));
            if (!map[key]) map[key] = [];
            map[key].push(item);
        });
        return map;
    }, [history]);

    const statsMetrics = useMemo(() => {
        const dates = Object.keys(dataMap).sort().reverse();
        if (dates.length === 0) return { current: 0, highest: 0 };
        
        let current = 0;
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

        let highest = 0;
        let temp = 0;
        const sortedDates = Object.keys(dataMap).sort();
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) { temp = 1; }
            else {
                const prev = new Date(sortedDates[i-1]);
                const curr = new Date(sortedDates[i]);
                const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) { temp++; }
                else { temp = 1; }
            }
            highest = Math.max(highest, temp);
        }

        return { current, highest };
    }, [dataMap]);

    const handleExport = async () => {
        setIsExporting(true);
        const exportToast = toast.loading('Generating Report...');
        try {
            await emotionAPI.exportReport();
            toast.success('Report ready!', { id: exportToast });
        } catch (err) {
            toast.error("Export failed.", { id: exportToast });
        } finally {
            setIsExporting(false);
        }
    };

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const grid = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => formatDateToKey(new Date(year, month, i + 1)))
    ];

    const activeItems = dataMap[selDay] || [];
    const selectedDateObj = new Date(selDay);
    const dateDisplay = {
        weekday: selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        full: selectedDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Archives Loading</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-40 pt-10 font-body">
            <div className="max-w-[430px] mx-auto px-6 space-y-12 relative z-10">
                
                {/* HEADER */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-heading font-black uppercase tracking-[0.4em] text-secondary/40">Archive Protocol</span>
                    </div>
                    <h1 className="text-[3.2rem] font-heading font-black text-primary leading-[0.85] tracking-tighter italic">
                        Soul <br/>
                        <span className="text-accent underline decoration-4 decoration-accent/10 underline-offset-[12px]">Archives.</span>
                    </h1>
                </motion.div>

                {/* ARCHIVE EXPORT (ANIMATED CLEAN WHITE DESIGN) */}
                <motion.button 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => emotionAPI.exportReport()}
                    disabled={isExporting}
                    className="w-full bg-white border border-primary/10 p-6 rounded-[2.5rem] flex items-center justify-between group shadow-xl shadow-secondary/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-2xl text-accent relative overflow-hidden">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -inset-2 bg-gradient-to-tr from-transparent via-white/40 to-transparent blur-sm"></motion.div>
                            <Crown size={24} className="relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-heading font-black text-primary uppercase tracking-widest">Download Report</h4>
                            <p className="text-xs text-secondary/40 font-body">Get your monthly neural protocol</p>
                        </div>
                    </div>
                    {isExporting ? <Loader2 size={24} className="animate-spin text-accent" /> : (
                        <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <FileDown size={20} className="text-secondary/20 group-hover:text-accent transition-colors" />
                        </motion.div>
                    )}
                </motion.button>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2rem] p-6 border border-primary/5 shadow-xl shadow-secondary/5 space-y-4"
                    >
                        <TrendingUp className="w-5 h-5 text-accent" />
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-secondary/30">CURRENT</span>
                            <span className="text-3xl font-heading font-black text-primary">{statsMetrics.current} <span className="text-xs">Days</span></span>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-primary rounded-[2rem] p-6 text-white shadow-2xl shadow-primary/20 space-y-4"
                    >
                        <Zap className="w-5 h-5 text-accent fill-current" />
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-white/30">HIGHEST</span>
                            <span className="text-3xl font-heading font-black text-white">{statsMetrics.highest} <span className="text-xs">Days</span></span>
                        </div>
                    </motion.div>
                </div>

                {/* CALENDAR */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] p-8 border border-primary/5 shadow-xl shadow-secondary/5 space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-heading font-black text-primary italic">
                            {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate)}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-3 bg-light-bg rounded-xl text-primary hover:bg-primary hover:text-white transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-3 bg-light-bg rounded-xl text-primary hover:bg-primary hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-black text-primary/10 uppercase tracking-widest">{d}</div>
                        ))}
                        {grid.map((date, idx) => {
                            if (!date) return <div key={idx} className="aspect-square" />;
                            const dStr = date as string;
                            const isSel = selDay === dStr;
                            const hasAct = (dataMap[dStr] || []).length > 0;
                            const dayNum = new Date(dStr).getDate();
                            const isToday = dStr === formatDateToKey(new Date());

                            return (
                                <motion.button
                                    key={idx}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelDay(dStr)}
                                    className={`relative aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all ${isSel 
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110 z-10' 
                                        : isToday 
                                            ? 'bg-accent/10 text-accent border border-accent/20'
                                            : hasAct ? 'text-primary bg-light-bg' : 'text-primary/10 hover:text-primary'}`}
                                >
                                    {dayNum}
                                    {hasAct && !isSel && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent shadow-sm"></div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* DAY CONTENT */}
                <div className="space-y-8">
                    <motion.div 
                        key={selDay}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-2 space-y-1"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/30 italic">{dateDisplay.weekday}</p>
                        <h2 className="text-3xl font-heading font-black text-primary tracking-tighter">
                            {dateDisplay.full}
                        </h2>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {activeItems.length > 0 ? (
                            <motion.div 
                                key={`content-${selDay}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {activeItems.map((item, idx) => {
                                    const entry = item.data;
                                    if (item.type === 'saved_word') return null;
                                    if (item.type === 'learned_word') {
                                        const wordName = entry.word_details?.word || entry.word || "Unknown";
                                        return (
                                            <motion.div 
                                                key={`word-${idx}`}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => navigate(`/word/${wordName}`)}
                                                className="bg-[#2e8b6e] rounded-[2.5rem] p-10 text-white shadow-xl shadow-secondary/10 relative overflow-hidden group cursor-pointer"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="p-4 bg-white/10 rounded-2xl text-accent">
                                                        <Sparkle size={24} fill="currentColor" />
                                                    </div>
                                                    <ArrowRight size={24} className="text-white/40 group-hover:text-white transition-all group-hover:translate-x-2" />
                                                </div>
                                                <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Learned Today</span>
                                                <h3 className="text-5xl font-heading font-black tracking-tighter italic">{wordName}</h3>
                                            </motion.div>
                                        );
                                    }

                                    const journalEntry = entry as JournalEntry;
                                    return (
                                        <motion.div 
                                            key={`entry-${idx}`}
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-[2.5rem] p-10 border border-primary/5 shadow-xl shadow-secondary/5 space-y-8 relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                                        <Clock size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary/30">
                                                        {new Date(journalEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-2xl font-heading font-black text-primary leading-tight tracking-tight italic">
                                                "{journalEntry.entry_text?.slice(0, 150) || ''}{(journalEntry.entry_text?.length ?? 0) > 150 ? '...' : ''}"
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {journalEntry.detected_emotions?.map((e: any, eIdx: number) => (
                                                    <span key={eIdx} className="px-3 py-1.5 bg-light-bg text-primary text-[9px] font-black uppercase tracking-widest border border-primary/5 rounded-xl">
                                                        {e.word}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="pt-8 border-t border-primary/5 space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="p-2.5 bg-accent/5 rounded-xl text-accent h-fit">
                                                        <Brain size={18} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/30">Insight</p>
                                                        <p className="text-xs font-bold text-secondary italic leading-relaxed">"{journalEntry.pattern_insight}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="p-2.5 bg-primary/5 rounded-xl text-primary h-fit">
                                                        <Zap size={18} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/30">Growth</p>
                                                        <p className="text-xs font-bold text-secondary leading-snug">{journalEntry.regulation_suggestion}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="void"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 text-center space-y-6 bg-white/50 rounded-[3rem] border border-dashed border-primary/10"
                            >
                                <Compass className="w-12 h-12 text-primary/5 mx-auto" />
                                <div className="space-y-2">
                                    <p className="text-primary/20 font-black italic text-xl">History Void</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary/20">Empty footprint Detected</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* EXPORT ACTION */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-primary text-white p-8 rounded-[2.5rem] flex items-center justify-between group shadow-2xl shadow-primary/20 transition-all overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <FileDown size={28} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ANALYTICS</p>
                            <h4 className="text-lg font-heading font-black tracking-tight leading-none italic">Download PDF Report</h4>
                        </div>
                    </div>
                    {isExporting ? <Loader2 size={24} className="animate-spin text-accent" /> : <ArrowRight size={28} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-2" />}
                </motion.button>

            </div>
        </div>
    );
};

export default JournalHistoryPage;
