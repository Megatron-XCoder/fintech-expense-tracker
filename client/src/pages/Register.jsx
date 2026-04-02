import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, Check } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : formData.password.length > 0 ? 'weak' : null;

  return (
    <div className="min-h-screen flex bg-[#0a0f1e] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[30%] right-[40%] w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 z-10">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            FinTrack
          </h2>
        </div>

        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
            Take control of<br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              your finances
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed">
            Join thousands of users who trust FinTrack to manage their expenses and build better financial habits.
          </p>

          <div className="space-y-3 max-w-sm">
            {[
              'Upload bank statements in CSV or Excel format',
              'Auto-categorize transactions with smart rules',
              'Interactive dashboards with visual analytics',
              'Export reports in CSV format',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-400">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">© 2026 FinTrack. Built for smart finance management.</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              FinTrack
            </h2>
            <p className="text-sm text-slate-500">Smart expense tracking</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create an account</h1>
              <p className="text-slate-500 text-sm">Get started with your expense journey</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">First name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Last name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Email address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {/* Password strength indicator */}
                {passwordStrength && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      <div className={`h-1 rounded-full flex-1 transition-colors ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div className={`h-1 rounded-full flex-1 transition-colors ${passwordStrength === 'medium' ? 'bg-amber-500' : passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                      <div className={`h-1 rounded-full flex-1 transition-colors ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${passwordStrength === 'weak' ? 'text-red-400' : passwordStrength === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Confirm password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength="6"
                    className={`w-full bg-white/[0.04] border text-white rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        : 'border-white/[0.08] focus:border-blue-500/50 focus:ring-blue-500/20'
                    } focus:bg-white/[0.06]`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check className="absolute right-3.5 top-3 h-4 w-4 text-emerald-400" />
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
