import React, { useState, useEffect, useRef } from 'react';
import {
  IndustryId,
  IndustryProfile,
  INDUSTRY_PROFILES,
  detectIndustryFromUrl,
  DemoLead as Lead,
  DemoFollowup as FollowupItem,
  DemoBooking as InspectionItem
} from './industryProfiles';
import { QuarterlyTargetGauge } from './components/QuarterlyTargetGauge';
import { LiveSplitScreenDemo } from './components/LiveSplitScreenDemo';

// --- STORAGE KEY FOR CONFIGURED WEBSITE ---
const CONFIG_STORAGE_KEY = 'leadmachine_configured_website_url';

// --- DEFAULT BRAND PROFILES ---
export interface ProspectProfile {
  websiteUrl: string;
  domain: string;
  companyName: string;
  industryId: IndustryId;
  detectedConfidence?: 'High' | 'Medium' | 'Low';
  logoUrl: string;
  accentColor: string;
  secondaryColor: string;
  headline: string;
  subheadline: string;
  serviceDescription: string;
  serviceAreas: string;
  prospectGreeting: string;
  dashboardBusinessName: string;
}

// Neutral default state when no business website URL has been configured in Super Admin
export const NEUTRAL_LEADMACHINE_PROSPECT: ProspectProfile = {
  websiteUrl: "",
  domain: "",
  companyName: "Your Business",
  industryId: "general",
  detectedConfidence: "Medium",
  logoUrl: "",
  accentColor: "#00a884",
  secondaryColor: "#0f172a",
  headline: "Turn missed customer enquiries into booked appointments.",
  subheadline: "AI-powered 24/7 lead capture and qualification for high-ticket service businesses.",
  serviceDescription: "Fast, intelligent qualification and appointment booking across WhatsApp, web, and ads.",
  serviceAreas: "All operational regions",
  prospectGreeting: "Welcome to LeadMachine. Tell us what service you need and our team will assist you immediately.",
  dashboardBusinessName: "LeadMachine Demo"
};

const DEMO_OWNER_PIN = "739214";

export function deriveProfileFromUrl(inputUrl: string, forcedIndustryId?: IndustryId): ProspectProfile {
  if (!inputUrl || !inputUrl.trim()) {
    const indId = forcedIndustryId || 'general';
    const ind = INDUSTRY_PROFILES[indId] || INDUSTRY_PROFILES.general;
    return {
      ...NEUTRAL_LEADMACHINE_PROSPECT,
      industryId: indId,
      headline: `Turn missed ${ind.name} enquiries into booked appointments.`,
      prospectGreeting: ind.greetingTemplate.replace('{company}', 'LeadMachine')
    };
  }

  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  let hostname = '';
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
  } catch {
    hostname = url.replace(/^https?:\/\//, '').split('/')[0];
  }

  const domain = hostname.replace(/^www\./, '');
  const domainParts = domain.split('.');
  let rawBrand = domainParts[0] || 'Service Pro';
  if (rawBrand.toLowerCase() === 'co' || rawBrand.length <= 2) {
    rawBrand = domainParts[1] || 'Service Pro';
  }

  let company = rawBrand
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      const upper = word.toUpperCase();
      if (['JBC', 'ABC', 'SA', 'KZN', 'JHB', 'CPT', 'RFA', 'DIY', 'USA', 'HVAC', 'AC', 'COC', 'DB'].includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  const detection = detectIndustryFromUrl(url, company);
  const industryId = forcedIndustryId || detection.industryId;
  const industry = INDUSTRY_PROFILES[industryId] || INDUSTRY_PROFILES.general;

  const lowerCompany = company.toLowerCase();
  if (industryId === 'roofing' && !lowerCompany.includes('roof') && !lowerCompany.includes('cover') && !lowerCompany.includes('waterproof')) {
    company += ' Roofing';
  } else if (industryId === 'dentistry' && !lowerCompany.includes('dent') && !lowerCompany.includes('smile') && !lowerCompany.includes('tooth')) {
    company += ' Dental Care';
  } else if (industryId === 'plumbing' && !lowerCompany.includes('plumb') && !lowerCompany.includes('drain') && !lowerCompany.includes('pipe')) {
    company += ' Plumbing';
  } else if (industryId === 'electrical' && !lowerCompany.includes('electr') && !lowerCompany.includes('spark') && !lowerCompany.includes('power')) {
    company += ' Electrical';
  } else if (industryId === 'solar' && !lowerCompany.includes('solar') && !lowerCompany.includes('sun') && !lowerCompany.includes('energy')) {
    company += ' Solar';
  } else if (industryId === 'hvac' && !lowerCompany.includes('air') && !lowerCompany.includes('hvac') && !lowerCompany.includes('cooling')) {
    company += ' Air Conditioning';
  } else if (industryId === 'auto_repair' && !lowerCompany.includes('auto') && !lowerCompany.includes('mechanic') && !lowerCompany.includes('motor') && !lowerCompany.includes('garage')) {
    company += ' Auto Repair';
  } else if (industryId === 'cleaning' && !lowerCompany.includes('clean') && !lowerCompany.includes('hygiene')) {
    company += ' Cleaning Services';
  } else if (industryId === 'salon' && !lowerCompany.includes('salon') && !lowerCompany.includes('hair') && !lowerCompany.includes('beauty')) {
    company += ' Hair & Beauty Lounge';
  } else if (industryId === 'clinic' && !lowerCompany.includes('clinic') && !lowerCompany.includes('medical') && !lowerCompany.includes('care')) {
    company += ' Medical Clinic';
  } else if (industryId === 'general' && !lowerCompany.includes('service') && !lowerCompany.includes('solution') && !lowerCompany.includes('group')) {
    company += ' Services';
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const headlines: Record<IndustryId, string> = {
    roofing: "Turn missed roofing enquiries into booked inspections.",
    dentistry: "Turn emergency toothaches and smile enquiries into booked chair appointments.",
    plumbing: "Turn emergency plumbing calls into confirmed callouts.",
    electrical: "Turn dangerous electrical faults into scheduled site visits.",
    solar: "Turn high-bill solar enquiries into qualified engineering consultations.",
    hvac: "Turn heating & cooling breakdowns into booked service visits.",
    auto_repair: "Turn urgent car trouble into scheduled workshop bookings.",
    cleaning: "Turn move-out and commercial enquiries into booked cleaning jobs.",
    salon: "Turn appointment requests into confirmed chair bookings.",
    clinic: "Turn acute symptoms into booked triage appointments.",
    general: "Turn missed customer enquiries into booked appointments."
  };

  const subheadlines: Record<IndustryId, string> = {
    roofing: `AI-powered lead capture and follow-up designed specifically for ${company}.`,
    dentistry: `24/7 emergency dental triage and appointment booking for ${company}.`,
    plumbing: `Instant emergency dispatch and booking qualification for ${company}.`,
    electrical: `Licensed electrician scheduling and emergency triage for ${company}.`,
    solar: `Residential & commercial solar qualification and site audit booking for ${company}.`,
    hvac: `Priority air conditioning repair triage and seasonal booking for ${company}.`,
    auto_repair: `Digital vehicle check-in and service bay booking for ${company}.`,
    cleaning: `Deposit-guaranteed move-out and office cleaning scheduling for ${company}.`,
    salon: `24/7 stylist booking and color service reservation for ${company}.`,
    clinic: `Doctor consultation triage and immediate patient booking for ${company}.`,
    general: `AI-powered lead capture and appointment booking for ${company}.`
  };

  return {
    websiteUrl: url,
    domain,
    companyName: company,
    industryId,
    detectedConfidence: detection.confidence,
    logoUrl: faviconUrl,
    accentColor: "#00a884",
    secondaryColor: "#0f172a",
    headline: headlines[industryId] || headlines.general,
    subheadline: subheadlines[industryId] || subheadlines.general,
    serviceDescription: `Professional ${industry.name} services, repairs, and scheduled consultations.`,
    serviceAreas: "Gauteng, Johannesburg, Pretoria, Surrounds",
    prospectGreeting: industry.greetingTemplate.replace('{company}', company),
    dashboardBusinessName: company
  };
}

function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'gray' | 'green' | 'red' | 'orange' | 'lime' }) {
  const colors = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    orange: 'bg-amber-50 text-amber-800 border-amber-200',
    lime: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant] || colors.gray}`}>
      {children}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  if (urgency === 'HOT') return <Badge variant="red">🔥 HOT</Badge>;
  if (urgency === 'WARM') return <Badge variant="orange">⚡ WARM</Badge>;
  return <Badge variant="gray">LOW</Badge>;
}

// --- OWNER ACCESS PIN GATE MODAL (LIGHT THEME) ---
function OwnerPinGateModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DEMO_OWNER_PIN) {
      setPin("");
      setErrorMessage("");
      onSuccess();
    } else {
      setErrorMessage("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            <h3 className="text-base font-extrabold text-slate-900">Owner Access</h3>
          </div>
          <button
            onClick={() => {
              setPin("");
              setErrorMessage("");
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 text-sm p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600">Enter your private admin PIN to access Super Admin demo controls.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="••••••"
              autoFocus
              className="w-full bg-white border-2 border-slate-300 focus:border-slate-900 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] text-slate-900 focus:outline-none transition shadow-2xs"
            />
            {errorMessage && (
              <p className="text-xs text-rose-600 mt-2 font-medium text-center">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPin("");
                setErrorMessage("");
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center font-mono">
          Prototype access gate for demo control.
        </p>
      </div>
    </div>
  );
}

// --- OWNER DEMO CONTROL SCREEN / SUPER ADMIN (LIGHT THEME) ---
function OwnerDemoControlScreen({
  currentProspect,
  onActivateProspect,
  onResetDefault,
  onClose
}: {
  currentProspect: ProspectProfile;
  onActivateProspect: (profile: ProspectProfile) => void;
  onResetDefault: () => void;
  onClose: () => void;
}) {
  const [urlInput, setUrlInput] = useState(currentProspect.websiteUrl || "");
  const [step, setStep] = useState<"input" | "edit_preview">("input");
  const [draftProfile, setDraftProfile] = useState<ProspectProfile | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const isConfigured = Boolean(currentProspect.websiteUrl && currentProspect.websiteUrl.trim());

  const activeIndustry = step === 'edit_preview' && draftProfile
    ? (INDUSTRY_PROFILES[draftProfile.industryId] || INDUSTRY_PROFILES.general)
    : (INDUSTRY_PROFILES[currentProspect.industryId] || INDUSTRY_PROFILES.general);

  const handleShareDemo = async (targetProfile: ProspectProfile) => {
    let shareUrl = "";
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('demo', 'share');
      url.searchParams.set('industry', targetProfile.industryId);
      url.searchParams.set('url', targetProfile.websiteUrl);
      url.searchParams.set('company', targetProfile.companyName);
      url.searchParams.set('sid', Math.random().toString(36).substring(2, 8));
      shareUrl = url.toString();
    } catch {
      shareUrl = `${window.location.origin}${window.location.pathname}?demo=share&industry=${targetProfile.industryId}&url=${encodeURIComponent(targetProfile.websiteUrl)}&company=${encodeURIComponent(targetProfile.companyName)}`;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setIsCopied(true);
      setCopiedShareUrl(shareUrl);
      setToastMessage("✓ Share link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 3000);
      setTimeout(() => setToastMessage(""), 3500);
    } catch {
      setCopiedShareUrl(shareUrl);
      setToastMessage("Link generated below");
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleGenerate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!urlInput.trim()) return;
    const derived = deriveProfileFromUrl(urlInput);
    setDraftProfile(derived);
    setStep("edit_preview");
    setToastMessage("Brand profile generated");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleActivate = () => {
    if (draftProfile) {
      onActivateProspect(draftProfile);
    }
  };

  const handleExecuteReset = () => {
    setShowConfirmReset(false);
    setUrlInput("");
    setDraftProfile(null);
    setCopiedShareUrl("");
    onResetDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center justify-center relative font-sans">
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce text-xs">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">Remove Configured Business?</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                This will clear the website URL and return the Demo Factory and Dashboard to the neutral LeadMachine default state.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Clear & Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 mb-2">
              <span>SUPER ADMIN</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Demo Factory Business Configuration</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Configure tailor-made demos by entering a prospect website URL.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">
            ✕
          </button>
        </div>

        {/* CURRENT DEMO CONFIGURATION STATUS CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
              CURRENT DEMO STATUS
            </span>
            {isConfigured ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ● BUSINESS CONFIGURED
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                LEADMACHINE DEFAULT (NO BUSINESS CONFIGURED)
              </span>
            )}
          </div>

          {isConfigured ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Company:</span>
                  <span className="font-bold text-slate-900 text-sm">{currentProspect.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Website:</span>
                  <span className="font-mono text-slate-700 break-all">{currentProspect.websiteUrl}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Industry:</span>
                  <span className="font-bold text-emerald-700">
                    {INDUSTRY_PROFILES[currentProspect.industryId]?.name || 'General'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Primary Conversion:</span>
                  <span className="font-mono text-xs text-slate-900 font-bold">
                    {INDUSTRY_PROFILES[currentProspect.industryId]?.conversionEvent || 'BOOK CONSULTATION'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Change Industry:</span>
                  <select
                    value={currentProspect.industryId}
                    onChange={(e) => {
                      const newInd = e.target.value as IndustryId;
                      const updated = deriveProfileFromUrl(currentProspect.websiteUrl, newInd);
                      onActivateProspect(updated);
                      setToastMessage(`Switched to ${INDUSTRY_PROFILES[newInd].name}`);
                      setTimeout(() => setToastMessage(""), 3000);
                    }}
                    className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-800 cursor-pointer shadow-2xs"
                  >
                    {Object.values(INDUSTRY_PROFILES).map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareDemo(currentProspect)}
                    className="text-xs px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>{isCopied ? "✓ Link Copied!" : "Share Demo Link"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition cursor-pointer font-semibold"
                  >
                    Remove Website URL
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">Neutral State Active</p>
              <p>The Demo Factory and Dashboard are currently operating in default LeadMachine mode. Enter a business website URL below to configure the demo for a real prospect.</p>
            </div>
          )}

          {/* Shareable Link Output Card */}
          {copiedShareUrl && (
            <div className="pt-3 border-t border-slate-200 space-y-2 animate-fadeIn bg-white -mx-5 -mb-5 p-4 rounded-b-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Shareable Demo Link Generated
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Copied to Clipboard
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={copiedShareUrl}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(copiedShareUrl);
                      setIsCopied(true);
                      setToastMessage("✓ Copied again!");
                      setTimeout(() => setIsCopied(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === "input" && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Configure New Prospect by Website URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.examplebusiness.co.za"
                  className="flex-1 bg-white border border-slate-300 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition text-sm shadow-2xs"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer text-sm"
                >
                  <span>⚡</span>
                  <span>Scan & Configure</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                The website URL is the authoritative trigger for business-specific demos. If cleared, the system cleanly returns to LeadMachine default.
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: EDIT & PREVIEW FORM */}
        {step === "edit_preview" && draftProfile && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Preview Detected Profile</h3>
                <span className="text-xs text-slate-500 font-mono">Confidence: {draftProfile.detectedConfidence || 'High'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={draftProfile.companyName}
                    onChange={(e) => setDraftProfile({ ...draftProfile, companyName: e.target.value, dashboardBusinessName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Industry</label>
                  <select
                    value={draftProfile.industryId}
                    onChange={(e) => {
                      const indId = e.target.value as IndustryId;
                      const updated = deriveProfileFromUrl(draftProfile.websiteUrl, indId);
                      setDraftProfile({ ...updated, companyName: draftProfile.companyName });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  >
                    {Object.values(INDUSTRY_PROFILES).map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-medium mb-1">Headline</label>
                  <input
                    type="text"
                    value={draftProfile.headline}
                    onChange={(e) => setDraftProfile({ ...draftProfile, headline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("input")}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleActivate}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Activate & Open Demo →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- LANDING SCREEN (LIGHT THEME) ---
function LandingScreen({
  prospect,
  onStartDemo,
  onEnterApp,
  onLogoDoubleClick
}: {
  prospect: ProspectProfile;
  onStartDemo: () => void;
  onEnterApp: () => void;
  onLogoDoubleClick: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 font-sans">
      {/* Header Nav */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-20 pt-2">
        <div
          onDoubleClick={onLogoDoubleClick}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
            {prospect.logoUrl ? (
              <img
                src={prospect.logoUrl}
                alt="Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <span className="font-bold text-xs text-slate-900">LM</span>
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base tracking-tight">
              {prospect.companyName}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              Powered by LeadMachine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onEnterApp}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium transition cursor-pointer shadow-xs"
          >
            Launch Dashboard →
          </button>
        </div>
      </div>

      {/* Hero Body */}
      <div className="max-w-4xl w-full mx-auto text-center z-10 py-16 space-y-8">
        <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-slate-700 font-medium tracking-wide text-xs md:text-sm">
            AI Lead Engine for <strong className="text-slate-900">{prospect.companyName}</strong>
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          {prospect.headline}
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          {prospect.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-3 text-base shadow-sm cursor-pointer"
          >
            <span>▶</span>
            <span>Experience Live Split Demo</span>
          </button>
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-base border border-slate-300 cursor-pointer shadow-2xs"
          >
            <span>Explore Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-slate-200 text-left">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="text-emerald-700 font-bold text-lg">⚡ Instant Intake</div>
            <h3 className="text-sm font-bold text-slate-900">Capture Enquiries 24/7</h3>
            <p className="text-slate-600 text-xs leading-relaxed">Engage customers immediately on WhatsApp, web, and ads before they contact competitors.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="text-emerald-700 font-bold text-lg">🎯 Automated Qualification</div>
            <h3 className="text-sm font-bold text-slate-900">Filter High-Value Leads</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Capture urgency, suburb, specific problems, and photos upfront without manual phone calls.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="text-emerald-700 font-bold text-lg">
              📅 Direct {INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel || 'Booking'}
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fill Your Calendar</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Automatically offer open slots for qualified {INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel.toLowerCase() || 'bookings'}.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center z-10 text-xs text-slate-400 py-4 border-t border-slate-200">
        LeadMachine • Configured for {prospect.companyName}
      </div>
    </div>
  );
}

// --- CUSTOMER DEMO FLOW (STANDALONE MODAL - LIGHT THEME) ---
function CustomerDemoFlow({
  prospect,
  onComplete,
  onCancel
}: {
  prospect: ProspectProfile;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentIndustry = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;
  const script = currentIndustry.getScript(prospect.companyName, prospect.prospectGreeting);

  const currentVisibleScript = script.slice(0, stepIndex + 1);
  const nextUserAction = script[stepIndex + 1];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stepIndex, isTyping]);

  const handleNextUserAction = () => {
    if (!nextUserAction) return;
    
    setStepIndex(prev => prev + 1);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setStepIndex(prev => {
        const nextStep = prev + 1;
        if (script[nextStep]?.isFinal) {
          setTimeout(() => {
            onComplete();
          }, 2800);
        }
        return nextStep;
      });
    }, 1000);
  };

  const currentStepNumber = Math.min(Math.floor(stepIndex / 3) + 1, 5);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-slate-900/50 backdrop-blur-xs flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden z-40">
      <div className="w-full max-w-md h-full sm:h-[750px] sm:max-h-[calc(100dvh-2rem)] bg-white rounded-none sm:rounded-3xl flex flex-col shadow-2xl border-0 sm:border border-slate-200 overflow-hidden relative">
        {/* Fixed Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 p-1 flex items-center justify-center border border-slate-200 shrink-0">
              {prospect.logoUrl ? (
                <img
                  src={prospect.logoUrl}
                  alt="logo"
                  className="w-5 h-5 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <span className="font-bold text-xs text-slate-800">LM</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-xs tracking-tight truncate">{prospect.companyName}</h1>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                AI Receptionist Active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">STEP {currentStepNumber}/5</span>
            <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-lg text-xs font-bold cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        {/* Fixed Customer Mode Banner */}
        <div className="shrink-0 bg-slate-100 border-b border-slate-200 px-4 py-1.5 text-[11px] text-slate-600 flex justify-between items-center font-medium">
          <span className="truncate">{currentIndustry.name} Intake Flow</span>
          <span className="font-semibold text-slate-900 shrink-0 ml-2">Lead: {currentIndustry.heroLead.name}</span>
        </div>

        {/* Scrollable Chat Area (WhatsApp-Styled Wallpaper) */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#efeae2]/75"
          style={{
            backgroundImage: `radial-gradient(#00000008 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        >
          <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest my-2 font-mono">
            Live Customer WhatsApp Simulation
          </div>

          {currentVisibleScript.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                msg.type === 'user'
                  ? 'bg-white text-slate-900 rounded-tr-xs border border-slate-100 font-medium'
                  : 'bg-[#d9fdd3] text-[#111b21] rounded-tl-xs'
              }`}>
                {msg.isUpload ? (
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                    <span className="text-base">📷</span>
                    <span className="font-mono text-emerald-800 font-bold">customer_photo.jpg</span>
                  </div>
                ) : (
                  <p className="leading-relaxed text-xs">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#d9fdd3] rounded-2xl rounded-tl-xs px-3.5 py-2 flex space-x-1.5 items-center shadow-2xs">
                <div className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="shrink-0 p-3 bg-[#f0f2f5] border-t border-slate-200 z-10 shadow-sm">
          {nextUserAction && nextUserAction.type === 'user' ? (
            <button
              onClick={handleNextUserAction}
              disabled={isTyping}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-xs text-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{nextUserAction.action}</span>
              <span>→</span>
            </button>
          ) : (
            <div className="text-center text-xs text-emerald-700 font-semibold py-2 animate-pulse">
              ✓ Intake Complete! Redirecting to Contractor Dashboard...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- FULL CONTRACTOR DASHBOARD (LIGHT PROFESSIONAL THEME) ---
function DashboardApp({
  prospect,
  leads,
  setLeads,
  followups,
  setFollowups,
  inspections,
  setInspections,
  onRunCustomerDemo,
  onRunLiveSplitDemo,
  onLogoDoubleClick
}: {
  prospect: ProspectProfile;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  followups: FollowupItem[];
  setFollowups: React.Dispatch<React.SetStateAction<FollowupItem[]>>;
  inspections: InspectionItem[];
  setInspections: React.Dispatch<React.SetStateAction<InspectionItem[]>>;
  onRunCustomerDemo: () => void;
  onRunLiveSplitDemo?: () => void;
  onLogoDoubleClick: () => void;
}) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'leads' | 'inbox' | 'followups' | 'inspections' | 'analytics' | 'settings'>('overview');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLead, setBookingLead] = useState<Lead | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const currentIndustry = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2026-03-30');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingTech, setBookingTech] = useState(
    currentIndustry.sampleBookings[0]?.team || 'Jaco V. (Senior Specialist)'
  );

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTriggerFollowup = (id: number) => {
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'Completed' } : f));
    showNotification("Automated follow-up dispatched to customer!");
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const leadName = bookingLead ? bookingLead.name : "New Customer";
    const leadSuburb = bookingLead ? bookingLead.suburb : "Fourways";
    const leadType = bookingLead ? bookingLead.type : (currentIndustry.services[0] || "Consultation");
    const leadValue = bookingLead ? `R${bookingLead.value.toLocaleString()}` : `R${currentIndustry.heroLead.value.toLocaleString()}`;

    const newInspection: InspectionItem = {
      id: Date.now(),
      customer: leadName,
      suburb: leadSuburb,
      date: bookingDate,
      time: bookingTime,
      team: bookingTech,
      value: leadValue,
      status: "Confirmed",
      type: leadType
    };

    setInspections([newInspection, ...inspections]);
    if (bookingLead) {
      setLeads(prev => prev.map(l => l.id === bookingLead.id ? { ...l, status: "Inspection Booked" } : l));
    }
    setIsBookingModalOpen(false);
    setBookingLead(null);
    showNotification(`${currentIndustry.bookingLabel.replace(/s$/, '')} confirmed for ${leadName}!`);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === 'ALL' || lead.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const hotLeads = leads.filter(l => l.urgency === 'HOT');
  const warmLeads = leads.filter(l => l.urgency === 'WARM');
  const lowLeads = leads.filter(l => l.urgency === 'LOW');

  const hotValue = hotLeads.reduce((sum, l) => sum + l.value, 0);
  const warmValue = warmLeads.reduce((sum, l) => sum + l.value, 0);
  const lowValue = lowLeads.reduce((sum, l) => sum + l.value, 0);
  const totalUrgencyValue = hotValue + warmValue + lowValue || 1;

  const projectedCloseRate = 0.82;
  const projectedMonthlyTotal = Math.round(totalUrgencyValue * projectedCloseRate);
  const quarterlyTarget = Math.max(Math.round(projectedMonthlyTotal * 2.8), 120000);

  return (
    <div className="h-screen max-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce text-xs">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR (LIGHT THEME - VIEWPORT LOCKED) */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo / Header with double-click for Owner Access (shrink-0) */}
          <div
            onDoubleClick={onLogoDoubleClick}
            className="shrink-0 p-4 border-b border-slate-200 flex items-center space-x-3 cursor-pointer group select-none"
            title="Double-click for Owner Controls"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
              {prospect.logoUrl ? (
                <img
                  src={prospect.logoUrl}
                  alt="Logo"
                  className="w-5 h-5 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <span className="font-bold text-xs text-slate-800">LM</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-slate-900 text-sm truncate">{prospect.companyName}</h2>
              <p className="text-[10px] text-slate-500 font-medium">{currentIndustry.name} Suite</p>
            </div>
          </div>

          {/* Nav Items (Internally scrollable if height is constrained) */}
          <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {[
              { id: 'overview' as const, label: 'Dashboard', icon: '📊' },
              { id: 'leads' as const, label: currentIndustry.leadTypeLabel || 'Leads & Enquiries', icon: '🔥', count: leads.length },
              { id: 'inbox' as const, label: 'AI Inbox', icon: '💬' },
              { id: 'followups' as const, label: 'Follow-ups', icon: '⚡', count: followups.filter(f => f.status !== 'Completed').length },
              { id: 'inspections' as const, label: currentIndustry.bookingLabel || 'Bookings', icon: '📅', count: inspections.length },
              { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
              { id: 'settings' as const, label: 'Settings', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  currentTab === item.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    currentTab === item.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions (shrink-0) */}
        <div className="shrink-0 p-4 border-t border-slate-200 bg-white space-y-2">
          {onRunLiveSplitDemo && (
            <button
              onClick={onRunLiveSplitDemo}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 border border-slate-300 transition cursor-pointer"
            >
              <span>⚡</span>
              <span>Back to Demo Factory</span>
            </button>
          )}
          <button
            onClick={onRunCustomerDemo}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
          >
            <span>▶</span>
            <span>Test Customer Intake</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA (VIEWPORT LOCKED - INTERNAL SCROLL) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top App Header (shrink-0) */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              {prospect.companyName}
            </h1>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 tracking-wider">
              PORTAL ACTIVE
            </span>
            {onRunLiveSplitDemo && (
              <button
                onClick={onRunLiveSplitDemo}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1 rounded-lg text-xs border border-slate-300 transition cursor-pointer flex items-center space-x-1"
              >
                <span>⚡</span>
                <span>Demo Factory</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{currentIndustry.name}</p>
              <p className="text-[10px] text-emerald-600 font-medium">● LeadMachine Active</p>
            </div>
          </div>
        </header>

        {/* TAB CONTENT (FLEX-1 MIN-H-0 OVERFLOW-Y-AUTO) */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Total Inbound Enquiries</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 font-mono">{leads.length}</p>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">100% responded via AI</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Hot Leads (Urgent Action)</p>
                  <p className="text-3xl font-black text-rose-600 mt-1 font-mono">
                    {leads.filter(l => l.urgency === 'HOT').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Immediate priority</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">
                    Booked {currentIndustry.bookingLabel || 'Bookings'}
                  </p>
                  <p className="text-3xl font-black text-emerald-700 mt-1 font-mono">{inspections.length}</p>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">Direct calendar placement</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Active Pipeline Value</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 font-mono">
                    R{leads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Qualified pipeline value</p>
                </div>
              </div>

              {/* Recent Leads Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recent {currentIndustry.leadTypeLabel || 'Enquiries'}
                    </h3>
                    <p className="text-xs text-slate-500">Captured and qualified automatically by LeadMachine</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('leads')}
                    className="text-xs text-slate-700 hover:text-slate-900 font-bold cursor-pointer underline"
                  >
                    View All ({leads.length}) →
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {leads.slice(0, 5).map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                            <UrgencyBadge urgency={lead.urgency} />
                          </div>
                          <p className="text-xs text-slate-500">
                            📍 {lead.suburb} • {lead.type} • <span className="italic">"{lead.problem}"</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono text-sm block">R{lead.value.toLocaleString()}</span>
                        <span className="text-[11px] text-slate-400">{lead.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEADS & ENQUIRIES */}
          {currentTab === 'leads' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Search & Filters */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <input
                  type="text"
                  placeholder="Search customer, suburb, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                />

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 font-medium">Urgency:</span>
                  {(['ALL', 'HOT', 'WARM', 'LOW'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                        urgencyFilter === u
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Urgency</th>
                        <th className="px-4 py-3">Service / Problem</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLeads.map(lead => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 block">{lead.name}</span>
                            <span className="text-slate-500 text-[11px]">📍 {lead.suburb} • {lead.phone}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <UrgencyBadge urgency={lead.urgency} />
                          </td>
                          <td className="px-4 py-3.5 max-w-xs truncate text-slate-700">
                            <span className="font-medium block text-slate-900">{lead.type}</span>
                            <span className="text-slate-500 truncate block">{lead.problem}</span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900 font-mono">
                            R{lead.value.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookingLead(lead);
                                setIsBookingModalOpen(true);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs cursor-pointer"
                            >
                              Book →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INBOX */}
          {currentTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[480px] animate-fadeIn">
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs h-full min-h-0">
                <div className="shrink-0 p-3.5 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
                  Customer Conversations ({leads.length})
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition ${
                        selectedLead?.id === lead.id ? 'bg-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">{lead.name}</span>
                        <span className="text-[10px] text-slate-400">{lead.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lead.problem}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat View (WhatsApp Styled Conversation) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-xs h-full min-h-0">
                <div className="shrink-0 p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">
                      {selectedLead ? selectedLead.name : 'Select a conversation'}
                    </span>
                    {selectedLead && <UrgencyBadge urgency={selectedLead.urgency} />}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">WhatsApp Channel Active</span>
                </div>

                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]/75 custom-scrollbar"
                  style={{
                    backgroundImage: `radial-gradient(#00000008 1px, transparent 1px)`,
                    backgroundSize: '16px 16px'
                  }}
                >
                  {selectedLead ? (
                    <>
                      <div className="flex justify-end">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-xs p-3 max-w-[80%] text-xs shadow-2xs">
                          <p className="text-slate-900">{selectedLead.problem}</p>
                          <span className="text-[10px] text-slate-400 text-right block mt-1">11:15 AM ✓✓</span>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tl-xs p-3 max-w-[80%] text-xs shadow-2xs">
                          <span className="text-[10px] font-bold text-[#008069] block mb-0.5">{prospect.companyName}</span>
                          <p>{selectedLead.aiSummary}</p>
                          <span className="text-[10px] text-slate-400 text-right block mt-1">11:16 AM</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Select a lead from the left to view the WhatsApp conversation
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#f0f2f5] border-t border-slate-200 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a WhatsApp message to customer..."
                    className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
                  />
                  <button
                    onClick={() => showNotification("Message sent via WhatsApp")}
                    className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    ✓
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FOLLOW-UPS */}
          {currentTab === 'followups' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followups.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.lead}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{item.message}"</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Next: {item.nextAction}</span>
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => handleTriggerFollowup(item.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs cursor-pointer"
                        >
                          Send WhatsApp Follow-up →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INSPECTIONS / BOOKINGS */}
          {currentTab === 'inspections' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs animate-fadeIn">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Confirmed Bookings Calendar</h3>
                  <p className="text-xs text-slate-500">Automatically scheduled on calendar via AI qualification</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {inspections.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{item.customer}</span>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {item.suburb} • {item.type} • Assigned: <strong className="text-slate-800">{item.team}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-xs block">{item.date} at {item.time}</span>
                      <span className="text-xs text-slate-500 font-mono">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {currentTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuarterlyTargetGauge
                  projectedMonthlyRevenue={projectedMonthlyTotal}
                  quarterlyTarget={quarterlyTarget}
                  currencyPrefix="R"
                  industryName={currentIndustry.name}
                />

                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Automated Conversion Performance</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Average AI Lead Response:</span>
                      <span className="font-bold text-emerald-700 font-mono">{currentIndustry.benchmarks.avgResponseTime}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Estimated Monthly Lead Volume:</span>
                      <span className="font-bold text-slate-900 font-mono">{currentIndustry.benchmarks.monthlyEnquiryVolume}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">After-Hours Enquiry Share:</span>
                      <span className="font-bold text-amber-700 font-mono">{currentIndustry.benchmarks.afterHoursEnquiryShare}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Projected Close Rate Lift:</span>
                      <span className="font-bold text-emerald-700 font-mono">{currentIndustry.benchmarks.conversionLift}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="max-w-2xl bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-5 animate-fadeIn">
              <h3 className="font-bold text-slate-900 text-base">Portal Settings & Integration</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company Display Name</label>
                  <input
                    type="text"
                    defaultValue={prospect.companyName}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Service Areas Covered</label>
                  <input
                    type="text"
                    defaultValue={prospect.serviceAreas}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">AI Receptionist Welcome Greeting</label>
                  <textarea
                    rows={3}
                    defaultValue={prospect.prospectGreeting}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <button
                  onClick={() => showNotification("Settings saved successfully!")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition cursor-pointer shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* LEAD DETAIL MODAL (LIGHT THEME) */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedLead.name}</h2>
                  <p className="text-xs text-slate-500">📍 {selectedLead.suburb} • {selectedLead.phone}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Lead Urgency:</span>
                    <UrgencyBadge urgency={selectedLead.urgency} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Service Category:</span>
                    <span className="font-bold text-slate-900">{selectedLead.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{currentIndustry.valueLabel}:</span>
                    <span className="font-bold text-slate-900 font-mono">R{selectedLead.value.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">AI Lead Assessment</h4>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedLead.aiSummary}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Customer Reported Problem</h4>
                  <p className="text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-200">"{selectedLead.problem}"</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex space-x-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const leadToBook = selectedLead;
                  setSelectedLead(null);
                  setBookingLead(leadToBook);
                  setIsBookingModalOpen(true);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-xs"
              >
                {currentIndustry.bookingActionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION / SERVICE BOOKING MODAL (LIGHT THEME) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {currentIndustry.bookingModalTitle} for {bookingLead ? bookingLead.name : 'Customer'}
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{currentIndustry.bookingLabel.replace(/s$/, '')} Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-800"
                >
                  <option>08:00 AM</option>
                  <option>10:00 AM</option>
                  <option>01:00 PM</option>
                  <option>03:30 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{currentIndustry.teamLabel}</label>
                <input
                  type="text"
                  value={bookingTech}
                  onChange={(e) => setBookingTech(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Initial state retrieval: strictly LeadMachine default unless Super Admin entered a URL
function getInitialProspect(): ProspectProfile {
  if (typeof window === 'undefined') return NEUTRAL_LEADMACHINE_PROSPECT;
  try {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    if (sharedUrl && sharedUrl.trim()) {
      const sharedIndustry = params.get('industry') as IndustryId | null;
      const validInd = sharedIndustry && INDUSTRY_PROFILES[sharedIndustry] ? sharedIndustry : undefined;
      const derived = deriveProfileFromUrl(sharedUrl, validInd);
      const sharedCompany = params.get('company');
      if (sharedCompany) {
        derived.companyName = sharedCompany;
        derived.dashboardBusinessName = sharedCompany;
      }
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, sharedUrl);
      } catch {}
      return derived;
    }

    const savedUrl = localStorage.getItem(CONFIG_STORAGE_KEY);
    // Invalidate old stale roofing test data if found
    if (savedUrl && savedUrl.trim() && !savedUrl.includes('jbcroofcover')) {
      return deriveProfileFromUrl(savedUrl);
    }
    // Clean up any stale test key
    if (savedUrl && savedUrl.includes('jbcroofcover')) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Storage access failed", e);
  }
  return NEUTRAL_LEADMACHINE_PROSPECT;
}

const INITIAL_LEADS: Lead[] = INDUSTRY_PROFILES.general.sampleLeads;
const INITIAL_FOLLOWUPS: FollowupItem[] = INDUSTRY_PROFILES.general.sampleFollowups;
const INITIAL_INSPECTIONS: InspectionItem[] = INDUSTRY_PROFILES.general.sampleBookings;

export default function App() {
  const [prospect, setProspect] = useState<ProspectProfile>(getInitialProspect);
  const [activeView, setActiveView] = useState<'live-split-demo' | 'landing' | 'customer-demo' | 'dashboard' | 'owner-control'>('live-split-demo');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(() => {
    const ind = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;
    return [...ind.sampleLeads];
  });
  const [followups, setFollowups] = useState<FollowupItem[]>(() => {
    const ind = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;
    return [...ind.sampleFollowups];
  });
  const [inspections, setInspections] = useState<InspectionItem[]>(() => {
    const ind = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;
    return [...ind.sampleBookings];
  });
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSelectIndustry = (newIndustryId: IndustryId) => {
    const updated = deriveProfileFromUrl(prospect.websiteUrl, newIndustryId);
    setProspect(updated);
    const ind = INDUSTRY_PROFILES[newIndustryId] || INDUSTRY_PROFILES.general;
    setLeads([...ind.sampleLeads]);
    setFollowups([...ind.sampleFollowups]);
    setInspections([...ind.sampleBookings]);
    triggerToast(`Switched industry demo to ${ind.name}!`);
  };

  const handleActivateProspect = (newProspect: ProspectProfile) => {
    try {
      if (newProspect.websiteUrl && newProspect.websiteUrl.trim()) {
        localStorage.setItem(CONFIG_STORAGE_KEY, newProspect.websiteUrl);
      } else {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
      }
    } catch {}
    setProspect(newProspect);
    const ind = INDUSTRY_PROFILES[newProspect.industryId] || INDUSTRY_PROFILES.general;
    setLeads([...ind.sampleLeads]);
    setFollowups([...ind.sampleFollowups]);
    setInspections([...ind.sampleBookings]);
    setActiveView('live-split-demo');
    triggerToast(newProspect.websiteUrl ? `Demo activated for ${newProspect.companyName}!` : "Demo restored to LeadMachine default");
  };

  const handleResetDefault = () => {
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {}
    setProspect({ ...NEUTRAL_LEADMACHINE_PROSPECT });
    setLeads([...INITIAL_LEADS]);
    setFollowups([...INITIAL_FOLLOWUPS]);
    setInspections([...INITIAL_INSPECTIONS]);
    setActiveView('live-split-demo');
    triggerToast("Demo restored to LeadMachine default.");
  };

  const handleCustomerDemoComplete = () => {
    const ind = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.general;
    const hero = ind.heroLead;
    const heroExists = leads.some(l => l.name === hero.name || l.phone === hero.phone);
    if (!heroExists) {
      const heroSarah: Lead = {
        ...hero,
        id: Date.now(),
        aiSummary: hero.aiSummary.replace(/JBC Roof Cover|this business/g, prospect.companyName)
      };
      setLeads(prev => [heroSarah, ...prev]);
    }
    setActiveView('dashboard');
  };

  const handleLogoDoubleClick = () => {
    setIsPinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce text-xs">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Owner PIN Gate Modal */}
      <OwnerPinGateModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setActiveView('owner-control');
        }}
      />

      {/* PRIMARY SCREEN: SPLIT-SCREEN LIVE DEMO */}
      {activeView === 'live-split-demo' && (
        <LiveSplitScreenDemo
          currentIndustryId={prospect.industryId}
          companyName={prospect.companyName}
          logoUrl={prospect.logoUrl}
          onSelectIndustry={handleSelectIndustry}
          onOpenFullDashboard={() => setActiveView('dashboard')}
          onOpenLandingPage={() => setActiveView('landing')}
          onLogoDoubleClick={handleLogoDoubleClick}
          initialLeads={leads}
        />
      )}

      {/* PUBLIC LANDING PAGE */}
      {activeView === 'landing' && (
        <LandingScreen
          prospect={prospect}
          onStartDemo={() => setActiveView('live-split-demo')}
          onEnterApp={() => setActiveView('dashboard')}
          onLogoDoubleClick={handleLogoDoubleClick}
        />
      )}

      {/* STEP-BY-STEP CUSTOMER DEMO FLOW */}
      {activeView === 'customer-demo' && (
        <CustomerDemoFlow
          prospect={prospect}
          onComplete={handleCustomerDemoComplete}
          onCancel={() => setActiveView('live-split-demo')}
        />
      )}

      {/* FULL CONTRACTOR DASHBOARD */}
      {activeView === 'dashboard' && (
        <DashboardApp
          prospect={prospect}
          leads={leads}
          setLeads={setLeads}
          followups={followups}
          setFollowups={setFollowups}
          inspections={inspections}
          setInspections={setInspections}
          onRunCustomerDemo={() => setActiveView('customer-demo')}
          onRunLiveSplitDemo={() => setActiveView('live-split-demo')}
          onLogoDoubleClick={handleLogoDoubleClick}
        />
      )}

      {/* SUPER ADMIN (OWNER CONTROLS) */}
      {activeView === 'owner-control' && (
        <OwnerDemoControlScreen
          currentProspect={prospect}
          onActivateProspect={handleActivateProspect}
          onResetDefault={handleResetDefault}
          onClose={() => setActiveView('live-split-demo')}
        />
      )}
    </div>
  );
}
