import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WordDetailPage from './pages/WordDetailPage';
import SearchPage from './pages/SearchPage';
import JournalPage from './pages/JournalPage';
import JournalHistoryPage from './pages/JournalHistoryPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function AppContent() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-light-bg">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <HomePage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route path="/explore" element={<Navigate to="/search" replace />} />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <CalendarPage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/word/:wordName"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <WordDetailPage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <SearchPage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <JournalPage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/journal/history"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="relative z-10">
                    <JournalHistoryPage />
                  </main>
                </>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
