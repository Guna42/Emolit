import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, ArrowRight, Brain, PenNib, Compass } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export const JourneyOnboarding: React.FC<{ userName: string }> = ({ userName }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // We use a specific storage key so it runs exactly once per device/browser for a new user
    const hasSeen = localStorage.getItem('emolit_mesmerizing_onboard');
    if (!hasSeen) {
      setVisible(true);
      setTimeout(() => setStep(1), 600); // Slight delay before first step
    }
  }, []);

  const complete = () => {
    localStorage.setItem('emolit_mesmerizing_onboard', 'true');
    setVisible(false);
  };

  const navToJournal = () => {
    complete();
    navigate('/journal');
  };

  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 sm:p-10 pointer-events-auto"
      style={{
         background: 'rgba(10,31,26,0.92)',
         backdropFilter: 'blur(30px)',
         WebkitBackdropFilter: 'blur(30px)',
         fontFamily: "'Space Grotesk', sans-serif"
      }}
    >
        {/* Mesmerizing breathing background orb */}
        <motion.div 
           animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
           transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
           className="absolute w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, #3aaf87 0%, #1a6b5a 40%, transparent 70%)', filter: 'blur(50px)' }}
        />
        
        <div className="relative z-10 w-full max-w-sm flex flex-col justify-center min-h-[400px]">
           <AnimatePresence mode="wait">
              
              {/* STEP 1: Psychological Welcome */}
              {step === 1 && (
                 <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="text-center">
                    <Brain size={54} weight="duotone" className="mx-auto text-[#4ade80] mb-8 opacity-90 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: '1.2rem' }}>
                       Welcome,<br/>{userName}.
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontWeight: 500 }}>
                       Your mind is a vast, complex landscape.<br/>It is time you had a map.
                    </p>
                    <motion.button 
                       whileHover={{ scale: 1.05, background: '#fff' }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setStep(2)} 
                       className="mt-14 px-10 py-4 rounded-full font-bold text-[11px] tracking-[0.3em] text-[#0a1f1a] uppercase bg-[#4ade80] transition-colors duration-300 shadow-[0_10px_40px_-10px_rgba(74,222,128,0.5)]"
                    >
                       Acknowledge
                    </motion.button>
                 </motion.div>
              )}

              {/* STEP 2: The Guide (Where is what) */}
              {step === 2 && (
                 <motion.div key="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="space-y-8 w-full">
                    <div className="space-y-4">
                       <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#4ade80', textAlign: 'center', marginBottom: '2.5rem' }}>
                          Your Emotional Compass
                       </h3>
                       
                       <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                         className="p-5 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center gap-4 shadow-xl">
                           <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                               <Sparkle size={24} weight="fill" className="text-emerald-400" />
                           </div>
                           <div>
                               <p className="font-bold text-white text-[1.15rem] mb-1 font-heading italic">Word of the Day</p>
                               <p className="text-[0.85rem] text-white/50 leading-relaxed font-medium">Equip yourself with precise language to name exactly how you feel.</p>
                           </div>
                       </motion.div>

                       <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
                         className="p-5 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center gap-4 shadow-xl">
                           <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                               <Compass size={24} weight="duotone" className="text-orange-400" />
                           </div>
                           <div>
                               <p className="font-bold text-white text-[1.15rem] mb-1 font-heading italic">Mood Map Explorer</p>
                               <p className="text-[0.85rem] text-white/50 leading-relaxed font-medium">Navigate the emotional spectrum to uncover the hidden patterns within.</p>
                           </div>
                       </motion.div>
                    </div>
                    
                    <div className="flex justify-center mt-10">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep(3)} 
                        className="px-10 py-4 rounded-full font-bold text-[11px] tracking-[0.3em] text-[#0a1f1a] uppercase bg-white/90 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] transition-all"
                      >
                         Continue
                      </motion.button>
                    </div>
                 </motion.div>
              )}

              {/* STEP 3: The Psychological Hook & Call to Action */}
              {step === 3 && (
                 <motion.div key="3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="text-center flex flex-col items-center">
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.2rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', lineHeight: 1.05, marginBottom: '1.2rem' }}>
                       What are you feeling right now?
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '3.5rem', fontWeight: 500 }}>
                       Do not let the feeling fade.<br/>Capture it before it escapes.
                    </p>

                    {/* Glowing hypnotic CTA button */}
                    <div className="w-full relative">
                        <motion.div 
                           animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                           transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                           className="absolute inset-0 bg-[#4ade80] rounded-full blur-xl"
                        />
                        <motion.button
                           onClick={navToJournal}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.97 }}
                           className="relative w-full py-5 rounded-full text-[#0a1f1a] bg-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.4)] text-[12px] font-black tracking-[0.25em] uppercase flex items-center justify-center gap-3 overflow-hidden"
                        >
                           {/* Button shine effect */}
                           <motion.div 
                              animate={{ x: ['-200%', '200%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                           />
                           Write First Journal <PenNib size={18} weight="fill" />
                        </motion.button>
                    </div>
                    
                    <button onClick={complete} className="mt-10 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-white/70 transition-colors">
                       I'll explore first
                    </button>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
    </motion.div>
  );
};
