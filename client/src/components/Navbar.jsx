import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex justify-between items-center border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand */}
        <h2 className="lg:hidden text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          FinTrack
        </h2>

        {/* User info - desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-slate-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-lg transition-colors">
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;
