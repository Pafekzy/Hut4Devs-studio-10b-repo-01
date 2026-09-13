import React from 'react';
import { Fellow, Chamber } from '../types';
import { Shield, Users, ArrowLeftRight, Award, Footprints, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  fellows: Fellow[];
  chambers: Chamber[];
  currentFellowId: string;
  currentChamberId: string;
  activeTab: string;
  onSelectFellow: (id: string) => void;
  onSelectChamber: (id: string) => void;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  fellows,
  chambers,
  currentFellowId,
  currentChamberId,
  activeTab,
  onSelectFellow,
  onSelectChamber,
  onSelectTab,
}) => {
  const currentFellow = fellows.find((f) => f.id === currentFellowId) || fellows[0];
  const currentChamber = chambers.find((c) => c.id === currentChamberId) || chambers[0];

  const navItems = [
    { id: 'chamber', label: 'Accommodation & Chamber', icon: Users },
    { id: 'support', label: 'Peer Support Hub', icon: ArrowLeftRight },
    { id: 'vouching', label: 'Contextual Vouches', icon: Shield },
    { id: 'trails', label: 'Trails of Trust', icon: Footprints },
    { id: 'recognition', label: 'Recognition', icon: Award },
  ];

  return (
    <header id="h4d-header" className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40">
      {/* Top Banner: Colony Philosophy & Persona Switcher */}
      <div className="border-b border-stone-800/80 bg-stone-950/60 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-400">
            <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono text-[11px]">
              🛖 Colony Rule
            </span>
            <span>Turning everyday collaboration into trails of trust. Built by us, for us-all.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-400 hidden md:inline">Viewing as Fellow:</span>
            <div className="relative flex items-center bg-stone-800 hover:bg-stone-750 rounded-lg px-2.5 py-1 transition-colors border border-stone-700/60">
              <img
                src={currentFellow.avatar}
                alt={currentFellow.name}
                className="w-5 h-5 rounded-full object-cover mr-2"
              />
              <select
                id="fellow-persona-selector"
                value={currentFellowId}
                onChange={(e) => onSelectFellow(e.target.value)}
                className="bg-transparent text-xs text-stone-200 focus:outline-none cursor-pointer pr-1"
              >
                {fellows.map((f) => (
                  <option key={f.id} value={f.id} className="bg-stone-900 text-stone-200">
                    {f.name} ({f.role}) {f.hasOverdueObligation ? '• Has Overdue' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Chamber */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="Colony Hut">
                🛖
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-lg text-white">Hut4Devs</span>
                  <span className="bg-stone-800 text-stone-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-stone-700">
                    Colony v1.0
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-none">Build • Pay • Support • Thrive</p>
              </div>
            </div>

            <div className="h-6 w-px bg-stone-800 hidden sm:block" />

            {/* Chamber Selector */}
            <div className="hidden sm:flex items-center gap-2">
              <select
                id="chamber-selector"
                value={currentChamberId}
                onChange={(e) => onSelectChamber(e.target.value)}
                className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
              >
                {chambers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-stone-900 text-stone-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Fellow Pill */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-medium text-stone-200">{currentFellow.name}</p>
              <p className="text-[11px] text-stone-400">{currentFellow.role}</p>
            </div>
            <img
              src={currentFellow.avatar}
              alt={currentFellow.name}
              className="w-8 h-8 rounded-full border border-stone-700 object-cover"
            />
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-stone-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
