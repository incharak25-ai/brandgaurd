import React from 'react';
import { ShieldCheck, LayoutDashboard, FileText, CheckSquare, BookOpen, BookmarkCheck, SpellCheck, History, Database, Plus } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewDoc: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewDoc,
  onSeedData,
  isSeeding,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reviews', label: 'Approval Queue', icon: CheckSquare },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'claims', label: 'Claims Register', icon: BookmarkCheck },
    { id: 'terminology', label: 'Terminology Rules', icon: SpellCheck },
    { id: 'audit', label: 'Audit History', icon: History },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                BrandGuard
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
                  MVP
                </span>
              </span>
              <p className="text-xs text-slate-400">Evidence-Backed Brand Compliance</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              title="Reset and populate realistic demo data"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-sky-400' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Reset Demo Data'}</span>
            </button>

            <button
              onClick={onOpenNewDoc}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
