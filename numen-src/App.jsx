// 🔵 PABLO - UI Architect
// App.jsx - Main routing and layout structure
// UPDATED WITH WEBSOCKETS ✅

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
// Layout components
import TopBar from './components/layout/TopBar';
import SideNav from './components/layout/SideNav';
// Page components
import Landing from './components/pages/Landing';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import SignUp from './components/pages/Signup';
import Profile from './components/pages/Profile';
import MyStudio from './components/pages/MyStudio';
import About from './components/pages/About';
import Friends from './components/pages/Friends';
import Learn from './components/pages/Learn';
import NotFound from './components/pages/NotFound';
// Protected Route
import ProtectedRoute from './components/ui/ProtectedRoute';
// Contexts
import { SideNavProvider } from './contexts';
// Global styles now imported via main.scss in main.jsx

function AppContent() {
  const location = useLocation();

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  // Logic: Should we show nav bars?
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  return (
    <div className="App">
      {/* TopBar shows UNLESS on landing or auth pages */}
      {!isLandingPage && !isAuthPage && <TopBar />}

      {/* Background decoration */}
      <div className="blob-left"></div>
      <div className="blob-right"></div>

      {/* Main Content - Router decides which page to show */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Landing/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          {/* Protected Routes - require authentication */}
          <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/profile/:username" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/mystudio" element={<ProtectedRoute><MyStudio/></ProtectedRoute>}/>
          <Route path="/mystudio/:username" element={<ProtectedRoute><MyStudio/></ProtectedRoute>}/>
          <Route path="/friends" element={<ProtectedRoute><Friends/></ProtectedRoute>}/>
          <Route path="/learn" element={<ProtectedRoute><Learn/></ProtectedRoute>}/>
          
          {/* Public route - accessible without authentication */}
          <Route path="/about" element={<About/>}/>
          
          {/* 404 Catch-all - must be last */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>

      {/* SideNav shows UNLESS on landing or auth pages */}
      {!isAuthPage && !isLandingPage && <SideNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SideNavProvider>
        <AppContent />
      </SideNavProvider>
    </BrowserRouter>
  );
}

export default App;