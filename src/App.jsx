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

// Use environment variable for production URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [status, setStatus] = useState({ is_running: false, logs: [], last_run: null });
  const [user, setUser] = useState({ authenticated: false, email: "" });

  // 1. Check Auth Status and Pipeline Status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, authRes] = await Promise.all([
          axios.get(`${API_BASE}/status`),
          axios.get(`${API_BASE}/auth/status`)
        ]);
        setStatus(statusRes.data);
        setUser(authRes.data);
      } catch (e) {
        console.error("Connection error");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/login`);
      window.location.href = res.data.url; // Redirect to Google
    } catch (e) {
      alert("Failed to initialize login");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await axios.post(`${API_BASE}/auth/logout`);
        setUser({ authenticated: false, email: "" });
      } catch (e) {
        alert("Logout failed");
      }
    }
  };

  const startPipeline = async () => {
    try { 
      await axios.post(`${API_BASE}/start`); 
    } catch (e) { 
      alert(e.response?.data?.detail || "Execution failed"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <Terminal className="text-blue-500" size={32} />
              Payslip Automation
            </h1>
            <p className="text-slate-400 mt-1">Production Pipeline • MainstreamTek HR</p>
          </div>
          
          <div className="flex items-center gap-4">
            {!user.authenticated ? (
              <button
                onClick={handleLogin}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all shadow-lg"
              >
                <LogIn size={20} /> Login with Google
              </button>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-4">
                  {/* Logged in as Info */}
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700">
                    <User size={14} className="text-green-500" /> 
                    <span className="hidden sm:inline text-xs text-slate-500 mr-1 uppercase font-bold tracking-tighter">Active:</span>
                    <span className="text-slate-200">{user.email}</span>
                  </div>
                  
                  {/* CLEAR LOGOUT BUTTON */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>

                <button
                  onClick={startPipeline}
                  disabled={status.is_running}
                  className={`px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-xl ${
                    status.is_running 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 text-white"
                  }`}
                >
                  {status.is_running ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20}/>}
                  {status.is_running ? "Running..." : "Start Automation"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
              <Activity size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
            </div>
            <p className="text-xl font-semibold">
              {status.is_running ? "Processing..." : user.authenticated ? "Ready" : "Idle"}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-purple-400 mb-2">
              <Clock size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Last Run</span>
            </div>
            <p className="text-xl font-semibold">{status.last_run ? new Date(status.last_run).toLocaleTimeString() : "Never"}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-green-400 mb-2">
              <Database size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Master Data</span>
            </div>
            <p className="text-xl font-semibold">{user.authenticated ? "Connected" : "Disconnected"}</p>
          </div>
        </div>

        {/* Log Window */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Live Execution Stream</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
          
          <div className="h-[450px] overflow-y-auto p-6 font-mono text-sm space-y-3 custom-scrollbar">
            {!user.authenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
                <LogIn size={40} className="mb-4 opacity-20" />
                <p>Please log in to view execution logs...</p>
              </div>
            ) : status.logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                <Terminal size={40} className="mb-4 opacity-20" />
                <p>Waiting for trigger...</p>
              </div>
            ) : (
              status.logs.map((log, i) => {
                const isError = log.includes('❌') || log.includes('🚨') || log.includes('Error');
                const isSuccess = log.includes('✅') || log.includes('🎉');
                return (
                  <div key={i} className="flex gap-4 border-b border-slate-800/30 pb-2">
                    <span className="text-slate-700 select-none w-8">{(i + 1).toString().padStart(3, '0')}</span>
                    <div className={`flex items-start gap-2 ${isError ? 'text-red-400' : isSuccess ? 'text-green-400' : 'text-slate-300'}`}>
                      {isError && <XCircle size={14} className="mt-1 flex-shrink-0" />}
                      {isSuccess && <CheckCircle size={14} className="mt-1 flex-shrink-0" />}
                      <p className="leading-relaxed">{log}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;