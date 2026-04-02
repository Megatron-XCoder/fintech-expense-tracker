import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, TrendingUp, PieChart, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0f1e] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 z-10">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            FinTrack
          </h2>
        </div>

        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
            Smart expense<br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              tracking & insights
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Upload your bank statements, categorize transactions, and gain actionable financial insights — all in one place.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-sm">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Real-time Analytics</p>
                <p className="text-xs text-slate-500">Track spending patterns instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Category Breakdown</p>
                <p className="text-xs text-slate-500">Visual expense distribution</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Bank-grade Security</p>
                <p className="text-xs text-slate-500">Your data stays protected</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2026 FinTrack. Built for smart finance management.</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              FinTrack
            </h2>
            <p className="text-sm text-slate-500">Smart expense tracking</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/20">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
              <p className="text-slate-500 text-sm">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-400">Password</label>
                  <Link to="#" className="text-xs text-blue-400/80 hover:text-blue-400 transition-colors">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <p className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
