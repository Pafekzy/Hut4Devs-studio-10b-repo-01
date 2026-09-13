import React, { useState } from 'react';
import { MemberRole } from '../domain/auth';
import {
  INSTITUTIONS_SEED,
  CAMPUSES_SEED,
  ACCOMMODATION_SPACES_SEED,
  ROOM_CAPTAINS_SEED,
  COORDINATOR_ASSIGNMENTS_SEED,
  ADMINISTRATION_ASSIGNMENTS_SEED,
  Institution,
  Campus,
  AccommodationSpace,
  RoomCaptainAssignment,
  CoordinatorAssignment,
  AdministrationAssignment,
} from '../domain/governanceHierarchy';
import {
  Building2,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
  Home,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Scale,
  Sparkles,
} from 'lucide-react';

interface GovernanceDevHierarchyProps {
  isDark: boolean;
  isLoading: boolean;
  authenticating: boolean;
  onAuthenticate: (role: MemberRole) => Promise<void>;
  onReturnToSignIn?: () => void;
}

type DrillLevel = 'INSTITUTIONS' | 'CAMPUSES' | 'CATEGORIES' | 'ROOM_CAPTAINS' | 'COORDINATOR' | 'ADMINISTRATION';

export const GovernanceDevHierarchy: React.FC<GovernanceDevHierarchyProps> = ({
  isDark,
  isLoading,
  authenticating,
  onAuthenticate,
  onReturnToSignIn,
}) => {
  // Navigation State
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('INSTITUTIONS');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(
    INSTITUTIONS_SEED.find((i) => i.id === 'inst-learn2earn') || INSTITUTIONS_SEED[0]
  );
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [selectedRoomCaptain, setSelectedRoomCaptain] = useState<RoomCaptainAssignment | null>(null);
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdministrationAssignment | null>(null);

  // Active preview feedback state
  const [previewNote, setPreviewNote] = useState<string | null>(null);

  // Handlers for Drill-down
  const handleSelectInstitution = (inst: Institution) => {
    setSelectedInstitution(inst);
    setSelectedCampus(null);
    setSelectedRoomCaptain(null);
    setSelectedAdminRole(null);
    setPreviewNote(null);
    setDrillLevel('CAMPUSES');
  };

  const handleSelectCampus = (campus: Campus) => {
    setSelectedCampus(campus);
    setSelectedRoomCaptain(null);
    setSelectedAdminRole(null);
    setPreviewNote(null);
    setDrillLevel('CATEGORIES');
  };

  const handleBack = () => {
    setPreviewNote(null);
    if (drillLevel === 'ROOM_CAPTAINS' || drillLevel === 'COORDINATOR' || drillLevel === 'ADMINISTRATION') {
      setDrillLevel('CATEGORIES');
    } else if (drillLevel === 'CATEGORIES') {
      setDrillLevel('CAMPUSES');
    } else if (drillLevel === 'CAMPUSES') {
      setDrillLevel('INSTITUTIONS');
    }
  };

  // Trigger Development Preview Authentication
  const handleLaunchPreview = async (
    role: MemberRole,
    contextSummary: string
  ) => {
    setPreviewNote(`Activating Development Preview: ${contextSummary}`);
    await onAuthenticate(role);
  };

  // Helper getters
  const campuses = selectedInstitution ? CAMPUSES_SEED[selectedInstitution.id] || [] : [];
  const roomCaptains = selectedCampus ? ROOM_CAPTAINS_SEED[selectedCampus.id] || [] : [];
  const coordinator = selectedCampus ? COORDINATOR_ASSIGNMENTS_SEED[selectedCampus.id] : null;
  const administration = selectedCampus ? ADMINISTRATION_ASSIGNMENTS_SEED[selectedCampus.id] || [] : [];

  return (
    <div
      className="rounded-2xl border-2 border-b-4 p-4 sm:p-5 transition-all duration-200 shadow-md backdrop-blur-md"
      style={{
        backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.75)',
        borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
      }}
    >
      {/* Dev Hierarchy Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b"
        style={{ borderColor: isDark ? 'rgba(200, 141, 58, 0.25)' : 'rgba(90, 45, 12, 0.15)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase border shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                color: isDark ? '#E5A955' : '#B77620',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
              }}
            >
              SCOPED GOVERNANCE MODEL
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
            >
              Development Tools &amp; Seed Fixtures
            </span>
          </div>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: isDark ? '#EAD6C0' : '#8A5D3B' }}
          >
            Institution → Campus → Responsibility Category → Assigned Person / Room → Dev Preview
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {drillLevel !== 'INSTITUTIONS' && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.6)' : 'rgba(247, 241, 231, 0.8)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.2)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span>Back</span>
            </button>
          )}
          {onReturnToSignIn && (
            <button
              type="button"
              onClick={onReturnToSignIn}
              aria-label="Return to Sign In"
              title="Return to Sign In"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer shadow-xs"
              style={{
                backgroundColor: isDark ? 'rgba(30, 27, 24, 0.6)' : 'rgba(255, 253, 248, 0.8)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.4)' : 'rgba(90, 45, 12, 0.25)',
                color: isDark ? '#FFF9EE' : '#5A2D0C',
              }}
            >
              <Home className="w-3.5 h-3.5 text-[#C88D3A]" />
              <span className="hidden sm:inline">Sign In Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Governance Hierarchy Breadcrumbs" className="mb-4 flex items-center flex-wrap gap-1.5 text-[11px] font-medium">
        {onReturnToSignIn && (
          <>
            <button
              type="button"
              onClick={onReturnToSignIn}
              className="text-[#C88D3A] hover:text-[#B77620] hover:underline cursor-pointer transition-colors flex items-center gap-1"
              title="Return to Sign In"
            >
              <Home className="w-3 h-3" />
              <span>Sign In</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setDrillLevel('INSTITUTIONS');
            setSelectedCampus(null);
          }}
          className={`hover:underline cursor-pointer transition-colors ${
            drillLevel === 'INSTITUTIONS'
              ? 'font-bold text-[#5A2D0C] dark:text-[#FFF9EE]'
              : 'text-[#C88D3A] hover:text-[#B77620]'
          }`}
        >
          Institutions
        </button>

        {selectedInstitution && drillLevel !== 'INSTITUTIONS' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button
              type="button"
              onClick={() => {
                setDrillLevel('CAMPUSES');
                setSelectedCampus(null);
              }}
              className={`hover:underline cursor-pointer transition-colors ${
                drillLevel === 'CAMPUSES'
                  ? 'font-bold text-[#5A2D0C] dark:text-[#FFF9EE]'
                  : 'text-[#C88D3A] hover:text-[#B77620]'
              }`}
            >
              {selectedInstitution.name}
            </button>
          </>
        )}

        {selectedCampus && (drillLevel === 'CATEGORIES' || drillLevel === 'ROOM_CAPTAINS' || drillLevel === 'COORDINATOR' || drillLevel === 'ADMINISTRATION') && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button
              type="button"
              onClick={() => setDrillLevel('CATEGORIES')}
              className={`hover:underline cursor-pointer transition-colors ${
                drillLevel === 'CATEGORIES'
                  ? 'font-bold text-[#5A2D0C] dark:text-[#FFF9EE]'
                  : 'text-[#C88D3A] hover:text-[#B77620]'
              }`}
            >
              {selectedCampus.name}
            </button>
          </>
        )}

        {drillLevel === 'ROOM_CAPTAINS' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
              Room Captains
            </span>
          </>
        )}

        {drillLevel === 'COORDINATOR' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
              Fellow Accommodation Coordinator
            </span>
          </>
        )}

        {drillLevel === 'ADMINISTRATION' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-[#5A2D0C] dark:text-[#FFF9EE]">
              Accommodation Administration
            </span>
          </>
        )}
      </nav>

      {/* Notice Banner */}
      <div
        className="mb-4 p-3.5 rounded-xl border text-[11px] leading-relaxed transition-colors duration-200 shadow-xs"
        style={{
          backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
          borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
          color: isDark ? '#EAD6C0' : '#5A2D0C',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3.5 h-3.5 text-[#C88D3A] shrink-0" />
          <span className="font-bold">Principle: Capability is Not Authority</span>
        </div>
        <p className="opacity-90">
          A Member is the base identity. Administrative and captaincy capacities are strictly scoped to specific institutions, campuses, and rooms. Authority does not leak across campuses.
        </p>
      </div>

      {previewNote && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{previewNote}</span>
        </div>
      )}

      {/* ============================================================
       * LEVEL 1: INSTITUTIONS
       * ============================================================ */}
      {drillLevel === 'INSTITUTIONS' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>Select Institution</span>
            <span className="text-[11px] font-normal opacity-75">4 Ecosystems Configured</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {INSTITUTIONS_SEED.map((inst) => (
              <div
                key={inst.id}
                onClick={() => handleSelectInstitution(inst)}
                className="p-4 rounded-xl border-2 border-b-4 hover:border-[#5A2D0C] dark:hover:border-[#C88D3A] transition-all cursor-pointer shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center font-bold text-xs shadow-inner">
                        {inst.logoBadge}
                      </span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {inst.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                        color: isDark ? '#E5A955' : '#B77620',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      }}
                    >
                      {inst.campusesCount} {inst.campusesCount === 1 ? 'Campus' : 'Campuses'}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#B77620] mb-1">
                    {inst.tagline}
                  </p>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                  >
                    {inst.description}
                  </p>
                </div>

                <div
                  className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs font-bold"
                  style={{
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  <span>Explore Campuses</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C88D3A]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
       * LEVEL 2: CAMPUSES
       * ============================================================ */}
      {drillLevel === 'CAMPUSES' && selectedInstitution && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>
              {selectedInstitution.name} — Campuses ({campuses.length})
            </span>
            <span className="text-[11px] font-normal opacity-75">Select Campus Scope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {campuses.map((campus) => (
              <div
                key={campus.id}
                onClick={() => handleSelectCampus(campus)}
                className="p-4 rounded-xl border-2 border-b-4 hover:border-[#5A2D0C] dark:hover:border-[#C88D3A] transition-all cursor-pointer shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span
                        className="font-bold text-xs"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {campus.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {campus.stateOrRegion}
                    </span>
                  </div>

                  <p
                    className="text-[11px] line-clamp-2 mt-1 leading-relaxed"
                    style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                  >
                    {campus.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono">
                    <span
                      className="px-2 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                        color: isDark ? '#E5A955' : '#B77620',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      }}
                    >
                      {campus.accommodationSpacesCount} Spaces
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                        color: isDark ? '#E5A955' : '#B77620',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      }}
                    >
                      {campus.activeCaptainsCount} Captains
                    </span>
                    {campus.coordinatorAssigned ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-700">
                        Coordinator ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="mt-3.5 pt-2 border-t flex items-center justify-between text-xs font-bold"
                  style={{
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                    color: isDark ? '#FFF9EE' : '#5A2D0C',
                  }}
                >
                  <span>Open Responsibilities</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C88D3A]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
       * LEVEL 3: RESPONSIBILITY CATEGORIES (Lagos Yaba / Campus Scope)
       * Shows:
       * 1. ROOM CAPTAINS
       * 2. FELLOW ACCOMMODATION COORDINATOR
       * 3. ACCOMMODATION ADMINISTRATION
       * ============================================================ */}
      {drillLevel === 'CATEGORIES' && selectedCampus && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>
              {selectedInstitution?.name} • {selectedCampus.name} — Responsibility Categories
            </span>
            <span className="text-[11px] font-normal opacity-75">Scoped Authority</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Category 1: Room Captains */}
            <div
              onClick={() => setDrillLevel('ROOM_CAPTAINS')}
              className="p-4 rounded-xl border-2 border-b-4 hover:border-[#5A2D0C] dark:hover:border-[#C88D3A] transition-all cursor-pointer shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center shadow-inner">
                    <Home className="w-4 h-4 text-[#C88D3A]" />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                      color: isDark ? '#E5A955' : '#B77620',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    }}
                  >
                    {roomCaptains.length} Rooms
                  </span>
                </div>
                <h3
                  className="font-bold text-xs"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  1. Room Captains
                </h3>
                <p
                  className="text-[11px] mt-1 leading-relaxed"
                  style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                >
                  Fellows with room-scoped delegated responsibility. Grouped by property and room assignment.
                </p>
              </div>

              <div
                className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs font-bold"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                  color: isDark ? '#FFF9EE' : '#5A2D0C',
                }}
              >
                <span>Inspect Room Assignments</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C88D3A]" />
              </div>
            </div>

            {/* Category 2: Fellow Accommodation Coordinator */}
            <div
              onClick={() => setDrillLevel('COORDINATOR')}
              className="p-4 rounded-xl border-2 border-b-4 hover:border-[#5A2D0C] dark:hover:border-[#C88D3A] transition-all cursor-pointer shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center shadow-inner">
                    <Users className="w-4 h-4 text-[#C88D3A]" />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                      color: isDark ? '#E5A955' : '#B77620',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    }}
                  >
                    {coordinator ? 'Assigned' : 'Vacant'}
                  </span>
                </div>
                <h3
                  className="font-bold text-xs"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  2. Fellow Accommodation Coordinator
                </h3>
                <p
                  className="text-[11px] mt-1 leading-relaxed"
                  style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                >
                  Campus-wide coordinator responsible for onboarding, delegations, and fellow oversight.
                </p>
              </div>

              <div
                className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs font-bold"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                  color: isDark ? '#FFF9EE' : '#5A2D0C',
                }}
              >
                <span>Inspect Coordinator</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C88D3A]" />
              </div>
            </div>

            {/* Category 3: Accommodation Administration */}
            <div
              onClick={() => setDrillLevel('ADMINISTRATION')}
              className="p-4 rounded-xl border-2 border-b-4 hover:border-[#5A2D0C] dark:hover:border-[#C88D3A] transition-all cursor-pointer shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-4 h-4 text-[#C88D3A]" />
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                      color: isDark ? '#E5A955' : '#B77620',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                    }}
                  >
                    {administration.length} Roles
                  </span>
                </div>
                <h3
                  className="font-bold text-xs"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  3. Accommodation Administration
                </h3>
                <p
                  className="text-[11px] mt-1 leading-relaxed"
                  style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                >
                  Financial Admin accountability &amp; Accommodation Welfare &amp; Mediation Officer.
                </p>
              </div>

              <div
                className="mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs font-bold"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                  color: isDark ? '#FFF9EE' : '#5A2D0C',
                }}
              >
                <span>Inspect Administration</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C88D3A]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
       * LEVEL 4A: ROOM CAPTAINS BREAKDOWN
       * ============================================================ */}
      {drillLevel === 'ROOM_CAPTAINS' && selectedCampus && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>
              Room Captain Assignments — {selectedCampus.name} ({roomCaptains.length})
            </span>
            <span className="text-[11px] font-mono opacity-75">Scope: Room-level only</span>
          </div>

          {roomCaptains.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white dark:bg-[#1E0D03] border border-[#C88D3A]/30">
              <Home className="w-6 h-6 text-[#C88D3A] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-[#5A2D0C] dark:text-[#FFF9EE]">
                No Room Captains currently assigned for {selectedCampus.name}.
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Room Captains are delegated per room by the Fellow Accommodation Coordinator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {roomCaptains.map((rc) => (
                <div
                  key={rc.id}
                  className="p-4 rounded-xl border-2 border-b-4 shadow-md flex flex-col justify-between"
                  style={{
                    backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#C88D3A]" />
                        <span
                          className="font-bold text-xs"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {rc.roomNumber} ({rc.accommodationSpaceName})
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                        style={{
                          backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                          color: isDark ? '#E5A955' : '#B77620',
                          borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                        }}
                      >
                        ROOM CAPTAIN
                      </span>
                    </div>

                    <div
                      className="mt-2 p-2.5 rounded-lg border text-xs shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                      }}
                    >
                      <div
                        className="font-bold"
                        style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                      >
                        {rc.memberName}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {rc.memberEmail}
                      </div>
                      <div className="text-[10px] text-[#B77620] font-mono mt-1">
                        Scope: {rc.accommodationSpaceName} • {rc.floor} • {rc.roomNumber}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        Delegated by: {rc.delegatedBy}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-3.5 pt-2.5 border-t"
                    style={{
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                    }}
                  >
                    <button
                      type="button"
                      id={`dev-preview-captain-${rc.id}`}
                      disabled={isLoading || authenticating}
                      onClick={() =>
                        handleLaunchPreview(
                          MemberRole.ROOM_CAPTAIN,
                          `${rc.memberName} (${rc.roomNumber} Captain Scope)`
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>Development Preview: Room Captain ({rc.roomNumber})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
       * LEVEL 4B: FELLOW ACCOMMODATION COORDINATOR BREAKDOWN
       * ============================================================ */}
      {drillLevel === 'COORDINATOR' && selectedCampus && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>
              Fellow Accommodation Coordinator — {selectedCampus.name}
            </span>
            <span className="text-[11px] font-mono opacity-75">Scope: Campus-wide</span>
          </div>

          {coordinator ? (
            <div
              className="p-4 rounded-xl border-2 border-b-4 shadow-md"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center shadow-inner">
                    <Users className="w-3.5 h-3.5 text-[#C88D3A]" />
                  </div>
                  <div>
                    <h4
                      className="font-bold text-xs"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {coordinator.memberName}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {coordinator.memberEmail}
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                  style={{
                    backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                    color: isDark ? '#E5A955' : '#B77620',
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                  }}
                >
                  COORDINATOR
                </span>
              </div>

              <div
                className="mt-3 p-3 rounded-lg border text-xs space-y-1 shadow-xs"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                }}
              >
                <div
                  className="font-semibold"
                  style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                >
                  {coordinator.title} ({selectedCampus.name})
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                >
                  {coordinator.scopeDescription}
                </p>
                <div className="text-[10px] text-stone-500 pt-1 font-mono">
                  Invariant: Emmanuel Ukom is Coordinator for Lagos Yaba ONLY. Authority does not leak to other campuses.
                </div>
              </div>

              <div
                className="mt-4 pt-3 border-t"
                style={{
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                }}
              >
                <button
                  type="button"
                  id="dev-preview-coordinator-btn"
                  disabled={isLoading || authenticating}
                  onClick={() =>
                    handleLaunchPreview(
                      MemberRole.ACCOMMODATION_FELLOWS_COORDINATOR,
                      `${coordinator.memberName} (L2E Lagos Yaba Coordinator)`
                    )
                  }
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                  <span>Development Preview: Coordinator Workspace</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="p-6 text-center rounded-xl border-2 shadow-sm"
              style={{
                backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
              }}
            >
              <Users className="w-6 h-6 text-[#C88D3A] mx-auto mb-2 opacity-60" />
              <p
                className="text-xs font-semibold"
                style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
              >
                No Coordinator currently assigned for {selectedCampus.name}.
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Emmanuel Ukom coordinates Lagos Yaba only. Independent coordinator assignments apply per campus.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
       * LEVEL 4C: ACCOMMODATION ADMINISTRATION BREAKDOWN
       * Contains:
       * 1. Financial Admin
       * 2. Accommodation Welfare & Mediation Officer
       * ============================================================ */}
      {drillLevel === 'ADMINISTRATION' && selectedCampus && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#5A2D0C] dark:text-[#FFF9EE] flex items-center justify-between">
            <span>
              Accommodation Administration — {selectedCampus.name} ({administration.length})
            </span>
            <span className="text-[11px] font-mono opacity-75">Scope: Administrative &amp; Welfare</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {administration.map((adm) => (
              <div
                key={adm.id}
                className="p-4 rounded-xl border-2 border-b-4 shadow-md flex flex-col justify-between"
                style={{
                  backgroundColor: isDark ? 'rgba(23, 21, 19, 0.55)' : 'rgba(255, 253, 248, 0.65)',
                  borderColor: isDark ? 'rgba(200, 141, 58, 0.35)' : 'rgba(90, 45, 12, 0.25)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#5A2D0C] text-[#FFF9EE] flex items-center justify-center shadow-inner">
                        {adm.responsibilityType === 'FINANCIAL_ADMIN' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                        ) : (
                          <Scale className="w-3.5 h-3.5 text-[#C88D3A]" />
                        )}
                      </div>
                      <div>
                        <h4
                          className="font-bold text-xs"
                          style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                        >
                          {adm.memberName}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {adm.memberEmail}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: isDark ? 'rgba(42, 34, 28, 0.6)' : 'rgba(247, 241, 231, 0.7)',
                        color: isDark ? '#E5A955' : '#B77620',
                        borderColor: isDark ? 'rgba(200, 141, 58, 0.3)' : 'rgba(90, 45, 12, 0.2)',
                      }}
                    >
                      {adm.responsibilityType === 'FINANCIAL_ADMIN' ? 'FINANCIAL' : 'WELFARE'}
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-lg border text-xs space-y-1 shadow-xs"
                    style={{
                      backgroundColor: isDark ? 'rgba(30, 27, 24, 0.45)' : 'rgba(247, 241, 231, 0.50)',
                      borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ color: isDark ? '#FFF9EE' : '#5A2D0C' }}
                    >
                      {adm.roleTitle}
                    </div>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: isDark ? '#EAD6C0' : '#5A2D0C' }}
                    >
                      {adm.description}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t"
                  style={{
                    borderColor: isDark ? 'rgba(200, 141, 58, 0.2)' : 'rgba(90, 45, 12, 0.15)',
                  }}
                >
                  {adm.responsibilityType === 'FINANCIAL_ADMIN' ? (
                    <button
                      type="button"
                      id="dev-preview-admin-financial-btn"
                      disabled={isLoading || authenticating}
                      onClick={() =>
                        handleLaunchPreview(
                          MemberRole.ACCOMMODATION_ADMIN,
                          `${adm.memberName} (Financial Admin Command Center)`
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>Development Preview: Financial Admin Command Center</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="dev-preview-admin-welfare-btn"
                      disabled={isLoading || authenticating}
                      onClick={() =>
                        handleLaunchPreview(
                          MemberRole.ACCOMMODATION_WELFARE_OFFICER,
                          `${adm.memberName} (${adm.roleTitle})`
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#5A2D0C] text-[#FFF9EE] hover:bg-[#723B12] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C88D3A]" />
                      <span>Development Preview: Welfare &amp; Mediation View</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
