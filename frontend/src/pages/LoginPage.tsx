import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Loader2, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                toast.success('Welcome back!');
            } else {
                await register(email, password, fullName);
                toast.success('Account created!');
            }
        } catch (err: any) {
            let apiMessage = 'Verification failed. Please check your credentials.';
            if (err?.response?.data?.detail) {
                apiMessage = typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : 'System verification failed.';
            }
            toast.error(apiMessage);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Securing Session</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative font-body overflow-hidden">
            
            {/* AMBIENT GRADIENTS */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-[400px] z-10 space-y-12"
            >
                {/* LOGO */}
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex justify-center"
                >
                    <img src="/logo.png" alt="Emolit" className="h-16 w-auto object-contain" />
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={mode}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-10"
                    >
                        <div className="space-y-2 text-center">
                            <h1 className="text-4xl font-heading font-black text-primary tracking-tighter italic">
                                {mode === 'login' ? 'Welcome Back.' : 'Start Fresh.'}
                            </h1>
                            <p className="text-xs text-secondary/40 font-black uppercase tracking-widest">
                                {mode === 'login' ? 'Sync your neural journal' : 'Begin your emotional odyssey'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {mode === 'register' && (
                                    <div className="group">
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-light-bg/50 border border-primary/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-primary font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-secondary/10 text-lg"
                                                placeholder="Full Name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="group">
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-light-bg/50 border border-primary/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-primary font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-secondary/10 text-lg"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 w-5 h-5 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-light-bg/50 border border-primary/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-primary font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-secondary/10 text-lg"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white h-16 rounded-[1.5rem] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {loading ? (
                                    <Loader2 className="animate-spin w-6 h-6" />
                                ) : (
                                    <>
                                        <span className="font-heading font-black text-[10px] uppercase tracking-[0.4em] ml-2">{mode === 'login' ? 'Initialize Sync' : 'Register Identity'}</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="text-center">
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 hover:text-primary transition-colors flex items-center justify-center gap-3 mx-auto"
                            >
                                {mode === 'login' ? "New to Emolit?" : "Existing Citizen?"}
                                <span className="text-primary border-b border-primary/20 pb-0.5">
                                    {mode === 'login' ? 'Create Account' : 'Sign In Now'}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* FOOTER */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-12 text-center"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/10">Protected by Emolit Neural Shield // 2024</p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
