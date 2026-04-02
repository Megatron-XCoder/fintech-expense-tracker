import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Bell, Palette, LogOut, ChevronRight, Check } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const Section = ({ title, description, icon: Icon, iconColor, children }) => (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {description && <p className="text-[11px] text-slate-600">{description}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4">{children}</div>
    </div>
  );

  const SettingRow = ({ label, value, action }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        {value && <p className="text-sm font-medium text-white mt-0.5">{value}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile Information" description="Your personal details" icon={User} iconColor="bg-blue-500/15 text-blue-400">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.04]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <p className="text-base font-semibold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">First Name</label>
            <div className="bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl py-2.5 px-4">
              {user?.firstName}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Last Name</label>
            <div className="bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl py-2.5 px-4">
              {user?.lastName}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl py-2.5 px-4">
            <Mail className="w-4 h-4 text-slate-500" />
            {user?.email}
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" description="Protect your account" icon={Shield} iconColor="bg-emerald-500/15 text-emerald-400">
        <SettingRow
          label="Password"
          value="••••••••"
          action={
            <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1">
              Change
              <ChevronRight className="w-3 h-3" />
            </button>
          }
        />
        <SettingRow
          label="Two-Factor Authentication"
          value="Not enabled"
          action={
            <span className="text-xs text-slate-600 bg-white/[0.04] px-2.5 py-1 rounded-lg">Coming soon</span>
          }
        />
      </Section>

      {/* Preferences */}
      <Section title="Preferences" description="Customize your experience" icon={Palette} iconColor="bg-violet-500/15 text-violet-400">
        <SettingRow
          label="Email Notifications"
          value="Receive alerts for large transactions"
          action={
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          }
        />
        <SettingRow
          label="Currency"
          value="Indian Rupee (₹)"
          action={
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Check className="w-3 h-3" />
              Active
            </span>
          }
        />
        <SettingRow
          label="Date Format"
          value="DD/MM/YYYY"
          action={
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Check className="w-3 h-3" />
              Active
            </span>
          }
        />
      </Section>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-red-500/10">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Log out of your account</p>
            <p className="text-xs text-slate-600 mt-0.5">You can always log back in later</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
