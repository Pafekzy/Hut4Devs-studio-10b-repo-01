import React, { useState, useRef, useEffect } from 'react';
import { Member } from '../domain/auth';
import { ActiveMode, getAvailableModesForMember, ScopedRoleAssignment, formatActionAttribution } from '../domain/membership';
import { ShieldCheck, User, Users, Home, Briefcase, ChevronDown, Check, HeartHandshake } from 'lucide-react';

export interface ModeSwitcherProps {
  member: Member;
  scopedRoles?: ScopedRoleAssignment[];
  currentMode: ActiveMode;
  onModeChange: (mode: ActiveMode) => void;
  isDark?: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  member,
  scopedRoles = [],
  currentMode,
  onModeChange,
  isDark: propIsDark,
}) => {
  const availableModes = getAvailableModesForMember(member, scopedRoles);

  // If only 1 mode is available (e.g. Normal Fellow or dedicated Financial Admin),
  // do not show an unnecessary switcher. The member operates directly in that capacity.
  if (availableModes.length <= 1) {
    return null;
  }

  // Resolve isDark either from prop or DOM class fallback
  const isDark =
    typeof propIsDark === 'boolean'
      ? propIsDark
      : typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Concise capacity labels for trigger & options
  const getShortModeLabel = (mode: ActiveMode): string => {
    switch (mode) {
      case 'FELLOW':
        return 'Fellow';
      case 'ROOM_CAPTAIN':
        return 'Room Captain';
      case 'COORDINATOR':
        return 'Coordinator';
      case 'CAPTAIN_COVERAGE':
        return 'Captain Coverage';
      case 'FINANCIAL_COVERAGE':
        return 'Financial Coverage';
      case 'FINANCIAL_ADMIN':
        return 'Financial Admin';
      case 'WELFARE_OFFICER':
        return 'Welfare Officer';
      default:
        return mode;
    }
  };

  const getModeDescription = (mode: ActiveMode): string => {
    switch (mode) {
      case 'FELLOW':
        return 'Personal accommodation & peer support';
      case 'ROOM_CAPTAIN':
        return 'Assigned living space & room occupancy';
      case 'COORDINATOR':
        return 'Cohort coordination & accommodation oversight';
      case 'CAPTAIN_COVERAGE':
        return 'Interim room captaincy coverage';
      case 'FINANCIAL_COVERAGE':
        return 'Interim financial admin coverage';
      case 'FINANCIAL_ADMIN':
        return 'Accommodation financial accountability';
      case 'WELFARE_OFFICER':
        return 'Resident wellbeing & restorative mediation';
      default:
        return '';
    }
  };

  const getModeIcon = (mode: ActiveMode) => {
    switch (mode) {
      case 'FELLOW':
        return <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case 'ROOM_CAPTAIN':
      case 'CAPTAIN_COVERAGE':
        return <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case 'COORDINATOR':
        return <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case 'FINANCIAL_COVERAGE':
      case 'FINANCIAL_ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case 'WELFARE_OFFICER':
        return <HeartHandshake className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  // Keyboard navigation for Trigger
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        const activeIdx = availableModes.indexOf(currentMode);
        const focusIdx = activeIdx >= 0 ? activeIdx : 0;
        menuItemsRef.current[focusIdx]?.focus();
      }, 0);
    }
  };

  // Keyboard navigation for Listbox Items
  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
    mode: ActiveMode
  ) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % availableModes.length;
      menuItemsRef.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + availableModes.length) % availableModes.length;
      menuItemsRef.current[prevIdx]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      menuItemsRef.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      menuItemsRef.current[availableModes.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectMode(mode);
    }
  };

  const handleSelectMode = (mode: ActiveMode) => {
    onModeChange(mode);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Hidden Native Select for Backward Compatibility & Direct Select Queries */}
      <select
        id="mode-switcher-select"
        aria-hidden="true"
        tabIndex={-1}
        value={currentMode}
        onChange={(e) => onModeChange(e.target.value as ActiveMode)}
        className="sr-only"
      >
        {availableModes.map((mode) => (
          <option key={mode} value={mode}>
            {getShortModeLabel(mode)}
          </option>
        ))}
      </select>

      {/* Accessible Branded Trigger Button */}
      <button
        type="button"
        id="mode-switcher-trigger"
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="mode-switcher-menu"
        aria-label={`Active capacity: ${getShortModeLabel(currentMode)}. Switch active capacity`}
        title={`Active capacity: ${getShortModeLabel(currentMode)}`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D3A] focus-visible:ring-offset-2 ${
          isDark
            ? 'bg-[#2F1707] hover:bg-[#3E200C] border-[#C88D3A] text-[#FFF9EE] shadow-xs'
            : 'bg-[#FFF9EE] hover:bg-[#F7F1E7] border-[#C88D3A] text-[#5A2D0C] shadow-xs'
        }`}
      >
        <span className="shrink-0 text-[#C88D3A]">
          {getModeIcon(currentMode)}
        </span>
        <span className="font-semibold tracking-tight truncate max-w-[130px] sm:max-w-none">
          {getShortModeLabel(currentMode)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#C88D3A]' : isDark ? 'text-[#C88D3A]' : 'text-[#8A5D3B]'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Accessible Branded Listbox Menu Popup */}
      {isOpen && (
        <div
          id="mode-switcher-menu"
          role="listbox"
          aria-label="Available operational capacities"
          tabIndex={-1}
          className={`absolute right-0 top-full mt-1.5 w-72 max-w-[calc(100vw-32px)] z-50 rounded-xl border overflow-hidden shadow-2xl transition-all duration-150 ${
            isDark
              ? 'bg-[#2F1707] border-[#C88D3A] text-[#FFF9EE] shadow-black/70'
              : 'bg-[#FFF9EE] border-[#C88D3A] text-[#5A2D0C] shadow-[#5A2D0C]/15'
          }`}
        >
          {/* Member Identity Access Header (Section 25) */}
          <div
            className={`px-3.5 py-2.5 border-b ${
              isDark ? 'border-[#C88D3A]/25 bg-[#3E200C]/70' : 'border-[#C88D3A]/25 bg-[#F7F1E7]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDark ? 'bg-[#C88D3A] text-[#2F1707]' : 'bg-[#5A2D0C] text-[#FFF9EE]'
                }`}
              >
                {member.displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate leading-tight ${
                    isDark ? 'text-[#FFF9EE]' : 'text-[#5A2D0C]'
                  }`}
                >
                  {member.displayName}
                </p>
                <p
                  className={`text-[10px] font-mono truncate ${
                    isDark ? 'text-[#E2AB5D]' : 'text-[#8A5D3B]'
                  }`}
                >
                  {member.h4dMemberId || 'H4D-MEMBER'}
                </p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="px-3.5 pt-2 pb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#C88D3A]' : 'text-[#B77620]'
              }`}
            >
              Active Acting Capacity
            </span>
          </div>

          {/* Capacity Options */}
          <div className="py-1">
            {availableModes.map((mode, idx) => {
              const isSelected = mode === currentMode;
              return (
                <button
                  type="button"
                  key={mode}
                  id={`mode-option-${mode}`}
                  ref={(el) => (menuItemsRef.current[idx] = el)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectMode(mode)}
                  onKeyDown={(e) => handleItemKeyDown(e, idx, mode)}
                  className={`w-full text-left px-3.5 py-2 flex items-start gap-2.5 transition-colors cursor-pointer focus:outline-none ${
                    isSelected
                      ? isDark
                        ? 'bg-[#C88D3A] text-[#2F1707] font-semibold'
                        : 'bg-[#C88D3A]/25 text-[#5A2D0C] font-semibold'
                      : isDark
                        ? 'text-[#FFF9EE] hover:bg-[#5A2D0C] focus:bg-[#5A2D0C]'
                        : 'text-[#5A2D0C] hover:bg-[#C88D3A]/15 focus:bg-[#C88D3A]/15'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 ${
                      isSelected
                        ? isDark
                          ? 'text-[#2F1707]'
                          : 'text-[#5A2D0C]'
                        : 'text-[#C88D3A]'
                    }`}
                  >
                    {getModeIcon(mode)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold leading-tight">
                        {getShortModeLabel(mode)}
                      </span>
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isDark ? 'text-[#2F1707]' : 'text-[#5A2D0C]'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p
                      className={`text-[11px] leading-tight mt-0.5 truncate ${
                        isSelected
                          ? isDark
                            ? 'text-[#2F1707]/85'
                            : 'text-[#5A2D0C]/85'
                          : isDark
                            ? 'text-[#E2AB5D]/80'
                            : 'text-[#8A5D3B]'
                      }`}
                    >
                      {getModeDescription(mode)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
