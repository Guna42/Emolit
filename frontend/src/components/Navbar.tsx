import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, BookOpen, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'search', label: 'Explore', path: '/search', icon: Compass },
  { id: 'journal', label: 'Journal', path: '/journal', icon: BookOpen },
  { id: 'calendar', label: 'Chronicle', path: '/calendar', icon: Calendar },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-2 pointer-events-none">
      <div className="max-w-[430px] mx-auto pointer-events-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/90 backdrop-blur-3xl border border-primary/10 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(26,107,90,0.15)] flex items-center justify-around p-3 px-4"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative flex flex-col items-center justify-center w-14 h-14 transition-all duration-300 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-secondary/30 hover:text-secondary'
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-bg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-primary/5 rounded-2xl"
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className={`w-6 h-6 z-10 relative ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </motion.div>

                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 w-1 h-1 bg-primary rounded-full z-10"
                  />
                )}
              </Link>
            );
          })}
          
          <div className="h-6 w-[1px] bg-primary/5 mx-2"></div>

          <motion.button
            whileTap={{ rotate: -20, scale: 0.8 }}
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-rose-500/40 hover:text-rose-500 transition-all duration-300"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
