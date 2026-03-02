import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Sparkles, LayoutDashboard, Settings, BookTemplate, LogOut } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/templates', label: 'Templates', icon: BookTemplate },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-navy-800 border-r border-navy-700 flex flex-col shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-4 border-b border-navy-700">
          <Sparkles className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-lg">AI Pipes</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === l.to ? 'bg-brand-500/10 text-brand-400' : 'text-navy-400 hover:text-navy-100 hover:bg-navy-700/50'
              }`}>
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-navy-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-medium">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-navy-500 truncate">{user?.tier} plan</div>
            </div>
            <button onClick={logout} className="text-navy-500 hover:text-navy-300 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
