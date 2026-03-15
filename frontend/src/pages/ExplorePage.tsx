import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { emotionAPI, WordSummary } from '../services/api';
import { Search, Filter, Sparkles, Activity } from 'lucide-react';

// ==========================================
// 🎨 REFINED THEME SYSTEM 
// ==========================================
const THEME: Record<string, { accent: string, text: string, bg: string, shadow: string, dot: string }> = {
  'Joy': { accent: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', shadow: 'shadow-amber-100', dot: 'bg-amber-400' },
  'Sadness': { accent: 'bg-indigo-400', text: 'text-indigo-700', bg: 'bg-indigo-50', shadow: 'shadow-indigo-100', dot: 'bg-indigo-400' },
  'Anger': { accent: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', shadow: 'shadow-rose-100', dot: 'bg-rose-500' },
  'Fear': { accent: 'bg-violet-400', text: 'text-violet-700', bg: 'bg-violet-50', shadow: 'shadow-violet-100', dot: 'bg-violet-400' },
  'Disgust': { accent: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', shadow: 'shadow-emerald-100', dot: 'bg-emerald-500' },
  'Surprise': { accent: 'bg-cyan-400', text: 'text-cyan-700', bg: 'bg-cyan-50', shadow: 'shadow-cyan-100', dot: 'bg-cyan-400' },
  'Love': { accent: 'bg-pink-400', text: 'text-pink-700', bg: 'bg-pink-50', shadow: 'shadow-pink-100', dot: 'bg-pink-400' },
  'Trust': { accent: 'bg-teal-400', text: 'text-teal-700', bg: 'bg-teal-50', shadow: 'shadow-teal-100', dot: 'bg-teal-400' },
  'Anticipation': { accent: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', shadow: 'shadow-orange-100', dot: 'bg-orange-400' },
};

const DEFAULT_THEME = { accent: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50', shadow: 'shadow-slate-100', dot: 'bg-slate-400' };

const ExplorePage: React.FC = () => {
  const [cores, setCores] = useState<string[]>([]);
  const [selectedCore, setSelectedCore] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [words, setWords] = useState<WordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    const fetchCores = async () => {
      try {
        const data = await emotionAPI.getCores();
        setCores(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCores();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingWords(true);
      try {
        if (selectedCore) {
          const [cats, wordsData] = await Promise.all([
            emotionAPI.getCategories(selectedCore),
            emotionAPI.getWords(selectedCore)
          ]);
          setCategories(cats);
          setWords(wordsData);
          setSelectedCategory('');
        } else {
          setCategories([]);
          setWords([]);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingWords(false); }
    };
    if (selectedCore) fetchData();
    else { setCategories([]); setWords([]); }
  }, [selectedCore]);

  useEffect(() => {
    if (!selectedCore) return;
    const filter = async () => {
      setLoadingWords(true);
      try {
        const data = selectedCategory
          ? await emotionAPI.getWords(selectedCore, selectedCategory)
          : await emotionAPI.getWords(selectedCore);
        setWords(data);
      } catch (e) { console.error(e); }
      finally { setLoadingWords(false); }
    };
    filter();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-32">

      {/* HEADER & NAV */}
      <div className="pt-24 md:pt-32 pb-8 md:pb-12 px-4 md:px-6 text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-slate-200 bg-white shadow-sm mb-6 animate-fade-in-up">
          <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-500 fill-current" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-500">Curated Library</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Explore The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Spectrum</span>
        </h1>

        {/* FLOATING PILL NAV (MOBILE SCROLLABLE) */}
        <div className="w-full overflow-x-auto no-scrollbar pb-4 md:pb-0 px-2 flex justify-start md:justify-center mb-10 md:mb-12">
          <div className="inline-flex gap-2 p-1.5 md:p-2 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 min-w-min">
            <button
              onClick={() => setSelectedCore('')}
              className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${!selectedCore
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              All
            </button>

            {cores.map(core => {
              const theme = THEME[core] || DEFAULT_THEME;
              const isSelected = selectedCore === core;
              return (
                <button
                  key={core}
                  onClick={() => setSelectedCore(core)}
                  className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${isSelected
                    ? `${theme.bg} ${theme.text} shadow-sm ring-1 ring-inset ring-black/5`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></div>}
                  {core}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-CATEGORY FILTER */}
        <div className={`transition-all duration-500 overflow-hidden ${selectedCore ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-wrap justify-center gap-2 px-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border ${!selectedCategory
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
            >
              All Types
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border ${selectedCategory === cat
                  ? `${THEME[selectedCore]?.bg} ${THEME[selectedCore]?.text} border-transparent font-extrabold`
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>
        ) : !selectedCore ? (
          <div className="text-center py-10 md:py-20 opacity-40">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-400">Select a core emotion above</h3>
          </div>
        ) : loadingWords ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-64 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
            {words.map((word, idx) => {
              return (
                <Link
                  to={`/word/${word.word}`}
                  key={idx}
                  className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-[250px] md:h-[300px] relative overflow-hidden group"
                >
                  <div>
                    <span className="inline-block px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-slate-50 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-6 md:mb-8 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                      {word.category}
                    </span>

                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight line-clamp-2">
                      {word.word}
                    </h3>
                  </div>

                  <div className="pt-6 mt-auto">
                    <div className="flex items-center gap-2 mb-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-slate-300' : 'bg-slate-100'}`}></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{word.core} Family</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ExplorePage;
