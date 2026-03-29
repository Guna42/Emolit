import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { House, Compass, PenNib, CalendarBlank, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', Icon: House },
  { id: 'search', label: 'Explore', path: '/search', Icon: Compass },
  { id: 'journal', label: 'Journal', path: '/journal', Icon: PenNib },
  { id: 'calendar', label: 'History', path: '/calendar', Icon: CalendarBlank },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-6 pt-4 px-6 flex justify-center">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="pointer-events-auto relative px-2.5 py-2.5 flex items-center gap-1 rounded-[2.2rem] overflow-hidden"
        style={{
          background: 'rgba(10,31,26,0.92)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px -12px rgba(10,31,26,0.8), 0 0 0 1.5px rgba(255,255,255,0.02) inset'
        }}
      >
        {/* Glow effect ambient base */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(58,175,135,0.12) 0%, transparent 60%)' }} />

        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const { Icon } = item;

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex items-center justify-center transition-all duration-300 z-10"
              style={{ width: 56, height: 56 }}
              aria-label={item.label}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill-bg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.06)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                whileTap={{ scale: 0.85 }}
                animate={{ y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="relative z-10 flex flex-col items-center justify-center"
              >
                <Icon
                  size={isActive ? 25 : 22}
                  weight={isActive ? 'fill' : 'duotone'}
                  style={{
                    color: isActive ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.3s ease'
                  }}
                />
                
                {/* Active dot indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -bottom-3.5 w-[5px] h-[5px] rounded-full"
                      style={{ background: '#4ade80', boxShadow: '0 0 8px 1px rgba(74,222,128,0.6)' }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Divider separator */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', marginLeft: 6, marginRight: 6 }} />

        {/* Logout button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: -8 }}
          onClick={() => { logout(); navigate('/login'); }}
          className="relative flex items-center justify-center z-10 group"
          style={{ width: 56, height: 56, borderRadius: 99 }}
          aria-label="Logout"
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300"
            style={{ background: 'rgba(244,63,94,0.1)' }} />
          <SignOut
            size={22}
            weight="duotone"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            className="group-hover:text-rose-400 transition-colors duration-300"
          />
        </motion.button>
      </motion.div>
    </nav>
  );
};

export default Navbar;
