import React, { useState, useEffect } from 'react';
import StudentPortal from './components/StudentPortal';
import TeacherDashboard from './components/TeacherDashboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { API_BASE } from './config';

const API = API_BASE;

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage and fetch fresh data from database
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        if (userData && userData._id) {
          // Set cached data first
          setUser(userData);
          
          // Then try to refresh in background
          fetch(`${API}/users/profile/${userData._id}`)
            .then(r => r.json())
            .then((profileData) => {
              if (profileData && !profileData.message) {
                const updatedUser = { ...userData, ...profileData };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setUser(updatedUser);
              }
            })
            .catch(() => console.warn('[App] Background profile refresh failed'));
        }
      } catch (err) {
        console.error('[App] Failed to parse userInfo', err);
        localStorage.removeItem('userInfo');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 animate-pulse">🎓</div>
          <p className="text-white font-bold text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!user) {
    return <Login onLogin={(data) => {
      // Set user immediately to transition away from login screen
      setUser(data);
      
      // Fetch fresh profile data in background
      if (data._id) {
        fetch(`${API}/users/profile/${data._id}`)
          .then(r => r.json())
          .then((profileData) => {
            if (profileData && !profileData.message) {
              const updatedUser = { ...data, ...profileData };
              localStorage.setItem('userInfo', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
          })
          .catch(() => console.warn('[App] Background profile fetch failed'));
      }
    }} />;
  }

  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative">
      {/* Logout FAB */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-[100] p-2.5 bg-slate-800 border border-white/10 rounded-full shadow-lg text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-90"
        title="Logout"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </button>

      {/* Main View */}
      {isAdmin ? (
        <AdminPanel user={user} />
      ) : isStudent ? (
        <StudentPortal user={user} />
      ) : (
        <TeacherDashboard user={user} />
      )}
    </div>
  );
}

export default App;
