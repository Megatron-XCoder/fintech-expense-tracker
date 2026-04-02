import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, List, Tags, Settings, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Upload', path: '/upload', icon: FileUp },
  { name: 'Transactions', path: '/transactions', icon: List },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
          isActive
            ? 'bg-blue-500/15 text-blue-400 font-semibold'
            : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 font-medium'
        }`}
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-white/[0.06] flex-col h-screen sticky top-0 bg-[#0a0f1e]/80 backdrop-blur-xl">
        <div className="p-5 pb-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            FinTrack
          </h2>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-slate-700">© 2026 FinTrack v1.0</p>
        </div>
      </aside>

      {/* Mobile slide-out drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f1e] border-r border-white/[0.06] flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            FinTrack
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} onClick={onClose} />
          ))}
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/[0.06] lg:hidden safe-bottom">
        <div className="flex justify-around items-center py-1.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-blue-400' : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
