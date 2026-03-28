import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, 
  Terminal, 
  Activity, 
  Clock, 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  LogIn, 
  User, 
  LogOut 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [status, setStatus] = useState({ is_running: false, logs: [], last_run: null });
  const [user, setUser] = useState({ authenticated: false, email: "" });

  // --- Header/Auth Management ---
  useEffect(() => {
    // 1. Check if we just redirected from Google (look for session_id in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionFromUrl = urlParams.get('session_id');

    if (sessionFromUrl) {
      localStorage.setItem('session_id', sessionFromUrl);
      // Clean the URL (remove session_id from address bar)
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Initial Auth Check and Polling
    const fetchData = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        setUser({ authenticated: false, email: "" });
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${sessionId}` } };
        const [statusRes, authRes] = await Promise.all([
          axios.get(`${API_BASE}/status`, config),
          axios.get(`${API_BASE}/auth/status`, config)
        ]);
        setStatus(statusRes.data);
        setUser(authRes.data);
      } catch (e) {
        console.error("Auth check failed");
        if (e.response?.status === 401) localStorage.removeItem('session_id');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const handleLogin = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/login`);
      if (res.data.url) window.location.href = res.data.url;
    } catch (e) {
      alert("Login failed to initialize");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Confirm logout?")) {
      const sessionId = localStorage.getItem('session_id');
      try {
        await axios.post(`${API_BASE}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${sessionId}` }
        });
      } finally {
        localStorage.removeItem('session_id');
        setUser({ authenticated: false, email: "" });
        window.location.reload();
      }
    }
  };

  const startPipeline = async () => {
    const sessionId = localStorage.getItem('session_id');
    try { 
      await axios.post(`${API_BASE}/start`, {}, {
        headers: { Authorization: `Bearer ${sessionId}` }
      }); 
    } catch (e) { 
      alert(e.response?.data?.detail || "Execution failed"); 
    }
  };

  // --- UI Render --- (Same as before, just using your standard theme)
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Terminal className="text-blue-500" size={32} /> Payslip Automation
            </h1>
            <p className="text-slate-400 mt-1">Multi-User Production Pipeline</p>
          </div>
          
          <div className="flex items-center gap-4">
            {!user.authenticated ? (
              <button onClick={handleLogin} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 shadow-lg">
                <LogIn size={20} /> Login with Google
              </button>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
                    <User size={14} className="text-green-500" /> <span className="text-slate-200">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm transition-all">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
                <button onClick={startPipeline} disabled={status.is_running} className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-xl ${status.is_running ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
                  {status.is_running ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20}/>} {status.is_running ? "Running..." : "Start Automation"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase">Status</span>
            <p className="text-xl font-semibold">{status.is_running ? "Processing..." : user.authenticated ? "Ready" : "Idle"}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <span className="text-xs font-bold text-purple-400 uppercase">Last Run</span>
            <p className="text-xl font-semibold">{status.last_run ? new Date(status.last_run).toLocaleTimeString() : "Never"}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <span className="text-xs font-bold text-green-400 uppercase">Session</span>
            <p className="text-xl font-semibold">{user.authenticated ? "Authorized" : "Unauthorized"}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 text-xs font-mono font-bold text-slate-500 uppercase">Live Logs</div>
          <div className="h-[450px] overflow-y-auto p-6 font-mono text-sm space-y-3 custom-scrollbar">
            {!user.authenticated ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 italic"><p>Please log in to authorize your session.</p></div>
            ) : status.logs.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 italic"><p>Waiting for trigger...</p></div>
            ) : (
              status.logs.map((log, i) => (
                <div key={i} className="flex gap-4 border-b border-slate-800/30 pb-2">
                  <span className="text-slate-700 w-8">{(i + 1).toString().padStart(3, '0')}</span>
                  <p className={`leading-relaxed ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-slate-300'}`}>{log}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;