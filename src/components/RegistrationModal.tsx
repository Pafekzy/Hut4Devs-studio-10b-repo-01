import React, { useState } from 'react';
import { ACCOMMODATION_PROPERTIES } from '../domain/membership';
import { membershipStore } from '../services/membershipStore';
import { X, CheckCircle, ArrowRight, ArrowLeft, Building2, User } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [programCommunity, setProgramCommunity] = useState('L2E (Learn to Earn) Dev Cohort');
  const [selectedPropertyId, setSelectedPropertyId] = useState(ACCOMMODATION_PROPERTIES[0].id);
  const [floorName, setFloorName] = useState('Floor 3');
  const [roomName, setRoomName] = useState('');

  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProperty = ACCOMMODATION_PROPERTIES.find((p) => p.id === selectedPropertyId)!;

  // Check if existing fellow matches email
  const existingMember = membershipStore.getMembers().find(
    (m) => m.email?.toLowerCase() === email.trim().toLowerCase()
  );
  const existingAssignment = existingMember
    ? membershipStore.getActiveAssignmentForMember(existingMember.id)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !roomName.trim()) {
      setError('Please provide your full name, email, and assigned room number.');
      return;
    }

    try {
      const req = membershipStore.submitMembershipRequest({
        fullName,
        email,
        phone,
        githubHandle,
        programCommunity,
        propertyId: selectedPropertyId,
        floorName,
        roomName,
      });

      setSubmittedRequestId(req.id);
      setStep(4);
      if (onSuccess) onSuccess(req.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit membership request.');
    }
  };

  const handleReset = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setGithubHandle('');
    setRoomName('');
    setSubmittedRequestId(null);
    setError(null);
    onClose();
  };

  return (
    <div
      id="registration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F1707]/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-[#FFF9EE] border border-[#C88D3A]/40 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-[#5A2D0C]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5A2D0C]/10 bg-[#F7F1E7]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B77620]">
              Hut4Devs Residency Onboarding
            </span>
            <h2 className="font-serif text-xl font-bold text-[#5A2D0C]">
              {step === 4 ? 'Request Submitted' : 'Submit Accommodation Membership Request'}
            </h2>
          </div>
          <button
            id="close-registration-modal-btn"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#5A2D0C]/60 hover:text-[#5A2D0C] hover:bg-[#5A2D0C]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator (Steps 1-3) */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#5A2D0C]/70 mb-2">
              <span className={step === 1 ? 'font-bold text-[#5A2D0C]' : ''}>1. Identity Details</span>
              <span>→</span>
              <span className={step === 2 ? 'font-bold text-[#5A2D0C]' : ''}>2. Program & Property</span>
              <span>→</span>
              <span className={step === 3 ? 'font-bold text-[#5A2D0C]' : ''}>3. Room & Review</span>
            </div>
            <div className="w-full bg-[#5A2D0C]/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C88D3A] h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#F7F1E7] rounded-xl border border-[#C88D3A]/20 text-xs text-[#5A2D0C]/80">
                <span className="font-semibold text-[#5A2D0C]">Core Principle: </span>
                Registration establishes your <strong>Identity</strong> and accommodation application.
                Roles and responsibilities are delegated authoritatively after membership verification.
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-input-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ada Okafor"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ada.okafor@example.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                />
              </div>

              {existingMember && (
                <div
                  id="existing-fellow-detected-notice"
                  className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900"
                >
                  <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                    <span className="text-xs" aria-hidden="true">🛖</span>
                    Existing Hut4Devs Fellow Recognized: {existingMember.displayName} ({existingMember.h4dMemberId})
                  </div>
                  <p className="mt-1 text-amber-800">
                    Previous Accommodation:{' '}
                    <strong>
                      {existingAssignment?.propertyName} ({existingAssignment?.roomName})
                    </strong>
                    . Submitting will register an accommodation transfer request without duplicating your member identity.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">Phone / WhatsApp</label>
                  <input
                    id="reg-input-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">GitHub Handle</label>
                  <input
                    id="reg-input-github"
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. adadev"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  id="reg-step1-next-btn"
                  type="button"
                  onClick={() => {
                    if (!fullName.trim() || !email.trim()) {
                      setError('Please enter your full name and email.');
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A2D0C] text-[#FFF9EE] rounded-lg text-sm font-medium hover:bg-[#2F1707] transition-colors"
                >
                  Next: Program & Property <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Program & Property Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">
                  Program or Sponsoring Community
                </label>
                <select
                  id="reg-select-program"
                  value={programCommunity}
                  onChange={(e) => setProgramCommunity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                >
                  <option value="L2E (Learn to Earn) Dev Cohort">L2E (Learn to Earn) Dev Cohort</option>
                  <option value="Hut4Devs Residency Interns 2026">Hut4Devs Residency Interns 2026</option>
                  <option value="Web3 & Distributed Systems Fellows">Web3 & Distributed Systems Fellows</option>
                  <option value="Independent Developer Fellow">Independent Developer Fellow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A2D0C] mb-2">
                  Select Accredited Accommodation Property
                </label>
                <div className="space-y-2">
                  {ACCOMMODATION_PROPERTIES.map((prop) => (
                    <label
                      key={prop.id}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPropertyId === prop.id
                          ? 'bg-[#F7F1E7] border-[#C88D3A] ring-1 ring-[#C88D3A]'
                          : 'bg-white border-[#5A2D0C]/15 hover:border-[#C88D3A]/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="property-selection"
                          value={prop.id}
                          checked={selectedPropertyId === prop.id}
                          onChange={() => setSelectedPropertyId(prop.id)}
                          className="mt-1 text-[#C88D3A] focus:ring-[#C88D3A]"
                        />
                        <div>
                          <div className="text-sm font-bold text-[#5A2D0C]">{prop.name}</div>
                          <div className="text-xs text-[#5A2D0C]/70">{prop.description}</div>
                          <div className="text-[11px] text-[#5A2D0C]/60 mt-0.5">{prop.location}</div>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap pl-2">
                        <span className="text-sm font-extrabold text-[#B77620]">
                          ₦{prop.monthlyCommitment.toLocaleString()}
                        </span>
                        <div className="text-[10px] uppercase font-semibold text-[#5A2D0C]/60">monthly</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5A2D0C] hover:bg-[#5A2D0C]/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  id="reg-step2-next-btn"
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A2D0C] text-[#FFF9EE] rounded-lg text-sm font-medium hover:bg-[#2F1707] transition-colors"
                >
                  Next: Room & Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Room & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">
                    Floor Name / Level
                  </label>
                  <select
                    id="reg-select-floor"
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="Floor 3">Floor 3</option>
                    <option value="Floor 4">Floor 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A2D0C] mb-1">
                    Assigned Room Number / Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-input-room"
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Room 304"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#5A2D0C]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C88D3A]"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-[#F7F1E7] border border-[#C88D3A]/30 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#5A2D0C] text-sm border-b border-[#5A2D0C]/10 pb-1">
                  Membership Request Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A2D0C]/70">Candidate:</span>
                  <span className="font-semibold text-[#5A2D0C]">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A2D0C]/70">Email:</span>
                  <span className="font-semibold text-[#5A2D0C]">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A2D0C]/70">Program:</span>
                  <span className="font-semibold text-[#5A2D0C]">{programCommunity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A2D0C]/70">Property:</span>
                  <span className="font-semibold text-[#5A2D0C]">{selectedProperty.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A2D0C]/70">Room:</span>
                  <span className="font-semibold text-[#5A2D0C]">{roomName || 'Pending'} ({floorName})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#5A2D0C]/10">
                  <span className="text-[#5A2D0C]/70">Monthly Commitment:</span>
                  <span className="font-bold text-[#B77620]">
                    ₦{selectedProperty.monthlyCommitment.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5A2D0C] hover:bg-[#5A2D0C]/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  id="reg-submit-btn"
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C88D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#B77620] shadow-xs transition-colors"
                >
                  Submit Membership Request
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Awaiting Verification */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#5A2D0C]">
                Membership Request Submitted Successfully
              </h3>
              <p className="text-xs text-[#5A2D0C]/80 max-w-md mx-auto leading-relaxed">
                Your request has been routed to the <strong>L2E Accommodation Fellows Coordinator</strong> for
                verification. A Room Captain may be delegated to confirm your room occupancy.
              </p>
              <div className="p-3 bg-[#F7F1E7] rounded-xl text-xs font-mono text-[#5A2D0C] max-w-sm mx-auto">
                Reference ID: <strong>{submittedRequestId}</strong>
              </div>
              <div className="pt-2">
                <button
                  id="reg-close-done-btn"
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 bg-[#5A2D0C] text-[#FFF9EE] rounded-lg text-sm font-medium hover:bg-[#2F1707] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
