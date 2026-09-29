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

// --- DEFAULT BRAND PROFILES ---
interface ProspectProfile {
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

const DEFAULT_PROSPECT: ProspectProfile = {
  websiteUrl: "https://www.jbcroofcover.co.za",
  domain: "jbcroofcover.co.za",
  companyName: "JBC Roof Cover",
  industryId: "roofing",
  detectedConfidence: "High",
  logoUrl: "https://www.google.com/s2/favicons?domain=jbcroofcover.co.za&sz=128",
  accentColor: "#84cc16", // Lime
  secondaryColor: "#0f172a",
  headline: "Turn missed roofing enquiries into booked inspections.",
  subheadline: "AI-powered lead capture and follow-up designed specifically for JBC Roof Cover.",
  serviceDescription: "Professional residential & commercial roof waterproofing, tile replacements, and emergency leak repairs.",
  serviceAreas: "Johannesburg North, Sandton, Fourways, Midrand",
  prospectGreeting: "Welcome to JBC Roof Cover. Need a roof repair or inspection? Tell us what is happening and we'll help you get the right person out quickly.",
  dashboardBusinessName: "JBC Roof Cover"
};

const DEMO_OWNER_PIN = "739214";

function deriveProfileFromUrl(inputUrl: string, forcedIndustryId?: IndustryId): ProspectProfile {
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
    auto_repair: "Turn vehicle repair requests into booked workshop assessments.",
    cleaning: "Turn urgent move-out and office cleaning requests into booked crews.",
    salon: "Turn evening beauty and hair enquiries into fully booked chair appointments.",
    clinic: "Turn patient symptom searches into confirmed doctor consultations.",
    general: "Turn inbound customer enquiries into booked service consultations."
  };

  return {
    websiteUrl: url,
    domain: domain,
    companyName: company,
    industryId: industryId,
    detectedConfidence: forcedIndustryId ? 'High' : detection.confidence,
    logoUrl: faviconUrl,
    accentColor: '#84cc16',
    secondaryColor: '#0f172a',
    headline: headlines[industryId],
    subheadline: `AI-powered lead capture and follow-up designed specifically for ${company}.`,
    serviceDescription: `Specialist ${industry.name} services, emergency response, and expert solutions by ${company}.`,
    serviceAreas: "Gauteng, Johannesburg, Pretoria, Surrounds",
    prospectGreeting: industry.greetingTemplate.replace('{company}', company),
    dashboardBusinessName: company
  };
}

function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: 'gray' | 'green' | 'red' | 'orange' | 'lime' }) {
  const colors = {
    gray: 'bg-gray-800 text-gray-300 border-gray-700',
    green: 'bg-lime-900/40 text-lime-400 border-lime-800',
    red: 'bg-red-950/60 text-red-400 border-red-800',
    orange: 'bg-amber-950/60 text-amber-400 border-amber-800',
    lime: 'bg-lime-400 text-gray-950 border-lime-500 font-bold'
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

// --- OWNER ACCESS PIN GATE MODAL ---
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span>
            <h3 className="text-base font-extrabold text-white">Owner Access</h3>
          </div>
          <button
            onClick={() => {
              setPin("");
              setErrorMessage("");
              onClose();
            }}
            className="text-gray-400 hover:text-white text-sm p-1 rounded-lg hover:bg-gray-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-300">Enter your private admin PIN.</p>

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
              className="w-full bg-gray-950 border border-gray-700 focus:border-lime-400 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] text-white focus:outline-none transition"
            />
            {errorMessage && (
              <p className="text-xs text-red-400 mt-2 font-medium text-center">
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
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-lime-400 hover:bg-lime-500 text-gray-950 text-xs font-bold rounded-xl transition shadow-lg cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-600 text-center font-mono">
          Prototype access gate for demo control.
        </p>
      </div>
    </div>
  );
}

// --- OWNER DEMO CONTROL SCREEN (REPLACED SUPER ADMIN) ---
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
  const [urlInput, setUrlInput] = useState("");
  const [step, setStep] = useState<"input" | "edit_preview">("input");
  const [draftProfile, setDraftProfile] = useState<ProspectProfile | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const activeIndustry = step === 'edit_preview' && draftProfile
    ? (INDUSTRY_PROFILES[draftProfile.industryId] || INDUSTRY_PROFILES.roofing)
    : (INDUSTRY_PROFILES[currentProspect.industryId] || INDUSTRY_PROFILES.roofing);

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
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 flex flex-col items-center justify-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {toastMessage && (
        <div className="fixed top-6 right-6 bg-lime-400 text-gray-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="font-extrabold text-white text-base">Confirm Reset</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                Remove the current prospect and restore the default demo?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition shadow-lg cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-2xl relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-lime-500/10 border border-lime-500/20 px-3 py-1 rounded-full text-xs font-semibold text-lime-400 mb-2">
              <span>OWNER DEMO CONTROL</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Owner Demo Control</h1>
            <p className="text-gray-400 text-sm mt-1">Manage sales demo identities and custom branding.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-800 rounded-xl transition cursor-pointer">
            ✕
          </button>
        </div>

        {/* CURRENT ACTIVE PROSPECT (SHOWN ONLY INSIDE OWNER DEMO CONTROL) */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
              CURRENT DEMO
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-900/50 text-lime-400 border border-lime-800">
              ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Company:</span>
              <span className="font-bold text-white text-sm">{currentProspect.companyName}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Website:</span>
              <span className="font-mono text-gray-300 break-all">{currentProspect.websiteUrl}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Industry:</span>
              <span className="font-bold text-lime-400">
                {INDUSTRY_PROFILES[currentProspect.industryId]?.name || 'Roofing'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Primary Conversion:</span>
              <span className="font-mono text-xs text-white">
                {INDUSTRY_PROFILES[currentProspect.industryId]?.conversionEvent || 'BOOK INSPECTION'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Change Industry:</span>
              <select
                value={currentProspect.industryId}
                onChange={(e) => {
                  const newInd = e.target.value as IndustryId;
                  const updated = deriveProfileFromUrl(currentProspect.websiteUrl, newInd);
                  onActivateProspect(updated);
                  setToastMessage(`Switched to ${INDUSTRY_PROFILES[newInd].name}`);
                  setTimeout(() => setToastMessage(""), 3000);
                }}
                className="bg-gray-900 border border-gray-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-lime-400 cursor-pointer"
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
                className="text-xs px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold rounded-lg transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                title="Generate shareable URL and copy to clipboard"
              >
                <span>🔗</span>
                <span>{isCopied ? "✓ Link Copied!" : "Share Demo"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg transition cursor-pointer font-medium"
              >
                Remove Current Prospect
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition cursor-pointer font-medium"
              >
                Reset App to Default
              </button>
            </div>
          </div>

          {/* Shareable Link Output Card */}
          {copiedShareUrl && (
            <div className="pt-3 border-t border-gray-800/80 space-y-2 animate-fadeIn bg-gray-900/60 -mx-5 -mb-5 p-4 rounded-b-xl border-t">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-lime-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                  Shareable Demo Link Generated
                </span>
                <span className="text-gray-400 font-mono text-[10px]">
                  Copied to Clipboard
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={copiedShareUrl}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-lime-300 font-mono select-all focus:outline-none focus:border-lime-400"
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
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 cursor-pointer"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[10px] text-gray-400">
                Send this link to <strong className="text-white">{currentProspect.companyName}</strong> — opening it automatically loads their personalized multi-channel demo.
              </p>
            </div>
          )}
        </div>

        {/* INDUSTRY INSIGHTS SUMMARY CARD */}
        <div className="bg-gray-950/90 border border-lime-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden animate-fadeIn">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-lime-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4 relative z-10">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 font-bold text-base shrink-0">
                📊
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">Industry Insights & Value Benchmarks</h3>
                  <span className="text-[10px] bg-lime-900/40 text-lime-400 border border-lime-800 font-bold px-2.5 py-0.5 rounded-full">
                    {activeIndustry.name} Playbook
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sector performance benchmarks to help you demonstrate concrete ROI and conversion lift to {step === 'edit_preview' && draftProfile ? draftProfile.companyName : currentProspect.companyName}.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0 bg-gray-900/60 border border-gray-800/80 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Category</span>
              <span className="text-xs font-bold text-gray-200">{activeIndustry.category}</span>
            </div>
          </div>

          {/* Key Performance Benchmarks Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs relative z-10">
            <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/90 space-y-1">
              <span className="text-gray-400 text-[11px] block font-medium">⚡ Average AI Response Speed</span>
              <p className="text-lg font-extrabold text-lime-400 font-mono">
                {activeIndustry.benchmarks.avgResponseTime}
              </p>
              <p className="text-[10px] text-gray-400">
                vs <span className="text-red-400 line-through">{activeIndustry.benchmarks.industryAvgResponse}</span> industry callback avg
              </p>
            </div>

            <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/90 space-y-1">
              <span className="text-gray-400 text-[11px] block font-medium">📥 Monthly Inbound Volume</span>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeIndustry.benchmarks.monthlyEnquiryVolume}
              </p>
              <p className="text-[10px] text-gray-400">
                Typical customer enquiry pipeline
              </p>
            </div>

            <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/90 space-y-1">
              <span className="text-gray-400 text-[11px] block font-medium">🌙 After-Hours Demand</span>
              <p className="text-lg font-extrabold text-amber-400 font-mono">
                {activeIndustry.benchmarks.afterHoursEnquiryShare}
              </p>
              <p className="text-[10px] text-amber-300/80">
                ⚠️ {activeIndustry.benchmarks.missedCallRate}
              </p>
            </div>

            <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800/90 space-y-1">
              <span className="text-gray-400 text-[11px] block font-medium">💰 Avg. Ticket Size & Lift</span>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeIndustry.benchmarks.avgDealValue}
              </p>
              <p className="text-[10px] text-lime-400 font-bold">
                {activeIndustry.benchmarks.conversionLift}
              </p>
            </div>
          </div>

          {/* Sales Talking Point & Pitch */}
          <div className="bg-lime-950/20 border border-lime-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs relative z-10">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-lime-400 font-bold text-xs">
                <span>💡</span>
                <span>Owner Value Pitch (Demonstrate Value to Prospect):</span>
              </div>
              <p className="text-gray-200 text-xs italic leading-relaxed">
                "{activeIndustry.benchmarks.keyPitchPoint}"
              </p>
            </div>
            <div className="shrink-0 bg-gray-950 border border-gray-800 px-3.5 py-2 rounded-xl text-left sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Primary Conversion</span>
              <span className="text-xs font-mono font-bold text-lime-400">{activeIndustry.conversionEvent}</span>
            </div>
          </div>

          {/* Common Qualification Triggers */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] relative z-10">
            <span className="text-gray-400 mr-1 font-medium">Common Automated Triage Triggers:</span>
            {activeIndustry.commonProblems.map((prob, i) => (
              <span key={i} className="bg-gray-900 text-gray-300 border border-gray-800 px-2.5 py-0.5 rounded-lg">
                {prob}
              </span>
            ))}
          </div>
        </div>

        {/* STEP 1: INPUT */}
        {step === "input" && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prospect Website URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.example.co.za"
                  className="flex-1 bg-gray-950 border border-gray-700 focus:border-lime-400 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition text-base"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold rounded-xl transition shadow-lg flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Generate Prospect Demo</span>
                  <span>→</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Paste any prospect website (Roofing, Dentistry, Plumbing, Electrical, Solar, HVAC, Auto Repair, etc.) to detect industry and build a personalized demo.
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: EDIT & PREVIEW */}
        {step === "edit_preview" && draftProfile && (
          <div className="space-y-8 animate-fadeIn">
            {/* Detection Summary Banner */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-900 pb-3">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">PROSPECT PROFILE</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-sm font-bold text-white">{draftProfile.companyName}</span>
                    <span className="text-xs text-gray-400">({draftProfile.websiteUrl})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Detection Confidence:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    draftProfile.detectedConfidence === 'High'
                      ? 'bg-lime-900/40 text-lime-400 border-lime-800'
                      : draftProfile.detectedConfidence === 'Medium'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                      : 'bg-red-950/60 text-red-400 border-red-800'
                  }`}>
                    {draftProfile.detectedConfidence || 'Low'}
                  </span>
                </div>
              </div>

              {draftProfile.detectedConfidence === 'Low' && (
                <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Industry detected with low confidence. Please verify or choose from the dropdown below.</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-white shrink-0">Selected Industry:</label>
                  <select
                    value={draftProfile.industryId}
                    onChange={(e) => {
                      const newId = e.target.value as IndustryId;
                      const updated = deriveProfileFromUrl(draftProfile.websiteUrl, newId);
                      setDraftProfile({
                        ...updated,
                        accentColor: draftProfile.accentColor
                      });
                    }}
                    className="flex-1 sm:flex-initial bg-gray-900 border border-gray-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-lime-400 cursor-pointer font-semibold"
                  >
                    {Object.values(INDUSTRY_PROFILES).map(ind => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name} ({ind.conversionEvent})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => setStep("input")} className="text-xs underline text-gray-400 hover:text-white cursor-pointer">
                  ← Change URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Editable Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">1. Adjust Profile Details</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={draftProfile.companyName}
                    onChange={(e) => {
                      const newComp = e.target.value;
                      const ind = INDUSTRY_PROFILES[draftProfile.industryId] || INDUSTRY_PROFILES.roofing;
                      setDraftProfile({
                        ...draftProfile,
                        companyName: newComp,
                        dashboardBusinessName: newComp,
                        subheadline: `AI-powered lead capture and follow-up designed specifically for ${newComp}.`,
                        prospectGreeting: ind.greetingTemplate.replace('{company}', newComp)
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Accent Colour (Hex)</label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={draftProfile.accentColor}
                      onChange={(e) => setDraftProfile({ ...draftProfile, accentColor: e.target.value })}
                      className="w-10 h-9 bg-gray-950 border border-gray-800 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftProfile.accentColor}
                      onChange={(e) => setDraftProfile({ ...draftProfile, accentColor: e.target.value })}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Landing Headline</label>
                  <input
                    type="text"
                    value={draftProfile.headline}
                    onChange={(e) => setDraftProfile({ ...draftProfile, headline: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={draftProfile.subheadline}
                    onChange={(e) => setDraftProfile({ ...draftProfile, subheadline: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={draftProfile.logoUrl}
                    onChange={(e) => setDraftProfile({ ...draftProfile, logoUrl: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Live Personalisation Preview */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">2. Personalisation Preview</h3>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-4 shadow-inner">
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-900">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 p-2 flex items-center justify-center border border-gray-800">
                      <img
                        src={draftProfile.logoUrl}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white">{draftProfile.companyName}</div>
                      <div className="text-xs text-gray-500">{draftProfile.domain}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Landing Preview</span>
                    <p className="text-sm font-semibold text-white leading-tight mb-1">{draftProfile.headline}</p>
                    <p className="text-xs text-gray-400">{draftProfile.subheadline}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Accent Colour Swatch</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg border border-white/20 shadow-sm" style={{ backgroundColor: draftProfile.accentColor }}></div>
                      <span className="text-xs font-mono text-gray-300">{draftProfile.accentColor}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-900 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Primary Conversion</span>
                      <span className="font-bold text-lime-400 font-mono text-[11px]">
                        {INDUSTRY_PROFILES[draftProfile.industryId]?.conversionEvent}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Booking Terminology</span>
                      <span className="font-semibold text-white text-[11px]">
                        {INDUSTRY_PROFILES[draftProfile.industryId]?.bookingLabel}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-900">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Customer AI Greeting</span>
                    <p className="text-xs bg-gray-900 p-2.5 rounded-lg border border-gray-800 text-gray-300 italic">
                      "{draftProfile.prospectGreeting}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setStep("input")}
                className="w-full sm:w-auto px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                ← Switch Prospect
              </button>
              <div className="flex flex-wrap items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => draftProfile && handleShareDemo(draftProfile)}
                  className="px-5 py-3.5 bg-gray-800 hover:bg-gray-700 text-lime-400 border border-gray-700 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  title="Generate shareable URL and copy to clipboard"
                >
                  <span>🔗</span>
                  <span>{isCopied ? "✓ Link Copied!" : "Share Demo"}</span>
                </button>
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="px-4 py-3 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  onClick={handleActivate}
                  className="w-full sm:w-auto px-8 py-3.5 bg-lime-400 hover:bg-lime-500 text-gray-950 font-extrabold text-sm rounded-xl transition shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Activate This Demo</span>
                  <span>✓</span>
                </button>
              </div>
            </div>

            {copiedShareUrl && (
              <div className="mt-4 bg-gray-950 border border-lime-500/40 rounded-xl p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-lime-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                    Shareable Demo Link Ready
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">
                    Copied to Clipboard
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={copiedShareUrl}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-lime-300 font-mono select-all focus:outline-none focus:border-lime-400"
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
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 cursor-pointer"
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- LANDING SCREEN (NO PUBLIC ADMIN CONTROLS) ---
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Nav */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-20 pt-2">
        <div
          onDoubleClick={onLogoDoubleClick}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-lime-400/50 transition p-1">
            <img
              src={prospect.logoUrl}
              alt="Logo"
              className="w-6 h-6 object-contain"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight group-hover:text-lime-400 transition">
              {prospect.companyName}
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              Powered by {INDUSTRY_PROFILES[prospect.industryId]?.brandSuffix || 'RoofLead AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onEnterApp}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition cursor-pointer"
          >
            Launch Dashboard →
          </button>
        </div>
      </div>

      {/* Hero Body */}
      <div className="max-w-4xl w-full mx-auto text-center z-10 py-16 space-y-8">
        <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          <span className="text-gray-300 font-medium tracking-wide text-xs md:text-sm">
            AI Lead Engine for <strong className="text-white">{prospect.companyName}</strong>
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          {prospect.headline}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          {prospect.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold rounded-xl transition-all flex items-center justify-center space-x-3 text-lg shadow-[0_0_30px_rgba(132,204,22,0.3)] hover:shadow-[0_0_40px_rgba(132,204,22,0.5)] transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>▶</span>
            <span>Experience Customer AI Intake</span>
          </button>
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 text-lg border border-gray-800 hover:border-gray-700 cursor-pointer"
          >
            <span>Explore Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-gray-900 text-left">
          <div className="p-6 bg-gray-900/40 rounded-2xl border border-gray-900 space-y-2">
            <div className="text-lime-400 font-bold text-lg">⚡ Instant Intake</div>
            <h3 className="text-sm font-bold text-white">Capture Enquiries 24/7</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Engage customers immediately when on site, in surgery, or consulting.</p>
          </div>
          <div className="p-6 bg-gray-900/40 rounded-2xl border border-gray-900 space-y-2">
            <div className="text-lime-400 font-bold text-lg">🎯 Automated Qualification</div>
            <h3 className="text-sm font-bold text-white">Filter Low-Value Leads</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Capture urgency, location, specific problems, and photos upfront.
            </p>
          </div>
          <div className="p-6 bg-gray-900/40 rounded-2xl border border-gray-900 space-y-2">
            <div className="text-lime-400 font-bold text-lg">
              📅 Direct {INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel || 'Booking'}
            </div>
            <h3 className="text-sm font-bold text-white">Fill Your Calendar</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Automatically offer open slots for qualified {INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel.toLowerCase() || 'bookings'}.
            </p>
          </div>
        </div>
      </div>

      {/* Footer (No domain URL, clean public experience) */}
      <div className="max-w-6xl w-full mx-auto text-center z-10 text-xs text-gray-600 py-4 border-t border-gray-900/50">
        {INDUSTRY_PROFILES[prospect.industryId]?.brandSuffix || 'RoofLead AI'} • Personalised for {prospect.companyName}
      </div>
    </div>
  );
}

// --- CUSTOMER DEMO FLOW ---
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

  const currentIndustry = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.roofing;
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
    <div
      className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-gray-950 flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden z-40"
      style={{ height: '100dvh', minHeight: '100dvh' }}
    >
      <div className="w-full max-w-md h-full sm:h-[750px] sm:max-h-[calc(100dvh-2rem)] bg-gray-900 rounded-none sm:rounded-3xl flex flex-col shadow-2xl border-0 sm:border border-gray-800 overflow-hidden relative">
        {/* Fixed Header */}
        <div className="shrink-0 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gray-800 p-1 flex items-center justify-center border border-gray-700 shrink-0">
              <img
                src={prospect.logoUrl}
                alt="logo"
                className="w-5 h-5 object-contain"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-white text-xs tracking-tight truncate">{prospect.companyName}</h1>
              <p className="text-[10px] text-lime-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shrink-0"></span>
                AI Receptionist Active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">STEP {currentStepNumber}/5</span>
            <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-white bg-gray-800/80 rounded-lg text-xs font-bold cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        {/* Fixed Customer Mode Banner */}
        <div className="shrink-0 bg-lime-500/10 border-b border-lime-500/20 px-4 py-1.5 text-[11px] text-lime-300 flex justify-between items-center font-medium">
          <span className="truncate">{currentIndustry.name} Intake Flow</span>
          <span className="font-semibold text-white shrink-0 ml-2">Lead: {currentIndustry.heroLead.name}</span>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-950/50">
          <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest my-2 font-mono">
            Live AI Intake Session
          </div>

          {currentVisibleScript.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.type === 'user'
                  ? 'bg-lime-400 text-gray-950 rounded-br-none font-semibold shadow-md'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700 shadow-md'
              }`}>
                {msg.isUpload ? (
                  <div className="flex items-center space-x-2 bg-gray-900/80 p-2 rounded-xl border border-gray-700 text-xs">
                    <span className="text-base">📷</span>
                    <span className="font-mono text-lime-400">ceiling_leak_fourways.jpg</span>
                  </div>
                ) : (
                  <p className="leading-relaxed text-xs sm:text-sm">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1.5 items-center">
                <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="shrink-0 p-4 bg-gray-950 border-t border-gray-800 z-10 shadow-lg">
          {nextUserAction && nextUserAction.type === 'user' ? (
            <button
              onClick={handleNextUserAction}
              disabled={isTyping}
              className="w-full bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg text-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{nextUserAction.action}</span>
              <span>→</span>
            </button>
          ) : (
            <div className="text-center text-xs text-lime-400 font-semibold py-2 animate-pulse">
              ✓ Intake Complete! Redirecting to Contractor Dashboard...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- CONTRACTOR DASHBOARD ---
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

  const currentIndustry = INDUSTRY_PROFILES[prospect.industryId] || INDUSTRY_PROFILES.roofing;

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

  // Urgency value breakdown for Analytics Bar Chart
  const hotLeads = leads.filter(l => l.urgency === 'HOT');
  const warmLeads = leads.filter(l => l.urgency === 'WARM');
  const lowLeads = leads.filter(l => l.urgency === 'LOW');

  const hotValue = hotLeads.reduce((sum, l) => sum + l.value, 0);
  const warmValue = warmLeads.reduce((sum, l) => sum + l.value, 0);
  const lowValue = lowLeads.reduce((sum, l) => sum + l.value, 0);
  const totalUrgencyValue = hotValue + warmValue + lowValue || 1;
  const maxUrgencyValue = Math.max(hotValue, warmValue, lowValue, 1);

  // Projected Monthly Revenue model over next 4 weeks
  const projectedCloseRate = 0.82;
  const projectedMonthlyTotal = Math.round(totalUrgencyValue * projectedCloseRate);
  const quarterlyTarget = Math.max(Math.round(projectedMonthlyTotal * 2.8), 120000);
  const week1Revenue = Math.round(totalUrgencyValue * 0.22);
  const week2Revenue = Math.round(totalUrgencyValue * 0.48);
  const week3Revenue = Math.round(totalUrgencyValue * 0.71);
  const week4Revenue = projectedMonthlyTotal;

  const getWeeklyBreakdownLabels = (indId: IndustryId) => {
    switch (indId) {
      case 'dentistry':
        return [
          { week: 'Week 1', label: 'Emergency Toothaches & Triage', share: '22%' },
          { week: 'Week 2', label: 'Booked Chair Consultations', share: '48%' },
          { week: 'Week 3', label: 'Cleanings, Crowns & Restorations', share: '71%' },
          { week: 'Week 4', label: 'Implants, Ortho & Month End', share: '82%' }
        ];
      case 'plumbing':
        return [
          { week: 'Week 1', label: 'Emergency Burst Pipes & Geysers', share: '22%' },
          { week: 'Week 2', label: 'Drain Unblocking & Callouts', share: '48%' },
          { week: 'Week 3', label: 'Pipe Relining & Installations', share: '71%' },
          { week: 'Week 4', label: 'Commercial Projects & Month End', share: '82%' }
        ];
      case 'electrical':
        return [
          { week: 'Week 1', label: 'Fault Finding & Tripping Breakers', share: '22%' },
          { week: 'Week 2', label: 'DB Board & Rewiring Callouts', share: '48%' },
          { week: 'Week 3', label: 'COC Compliance & Installations', share: '71%' },
          { week: 'Week 4', label: 'Solar/Backup Integration & Month End', share: '82%' }
        ];
      case 'solar':
        return [
          { week: 'Week 1', label: 'System Sizing & Bill Audit Calls', share: '22%' },
          { week: 'Week 2', label: 'Engineering Site Surveys', share: '48%' },
          { week: 'Week 3', label: 'Inverter & Battery Installs', share: '71%' },
          { week: 'Week 4', label: 'Full PV Commissioning & Month End', share: '82%' }
        ];
      case 'hvac':
        return [
          { week: 'Week 1', label: 'Emergency Breakdown Repairs', share: '22%' },
          { week: 'Week 2', label: 'Diagnostics & Aircon Servicing', share: '48%' },
          { week: 'Week 3', label: 'New Duct & Split Installs', share: '71%' },
          { week: 'Week 4', label: 'Commercial Maintenance & Month End', share: '82%' }
        ];
      case 'auto_repair':
        return [
          { week: 'Week 1', label: 'Brake, Battery & Urgent Triage', share: '22%' },
          { week: 'Week 2', label: 'Workshop Diagnostics & Quoted Work', share: '48%' },
          { week: 'Week 3', label: 'Major Engine & Gearbox Repairs', share: '71%' },
          { week: 'Week 4', label: 'Full Overhauls & Month End', share: '82%' }
        ];
      case 'general':
      case 'roofing':
      default:
        return [
          { week: 'Week 1', label: 'Urgent Leaks & Triage', share: '22%' },
          { week: 'Week 2', label: 'Quoted Inspections', share: '48%' },
          { week: 'Week 3', label: 'Waterproofing & Repairs', share: '71%' },
          { week: 'Week 4', label: 'Replacements & Month End', share: '82%' }
        ];
    }
  };

  const weeklyLabels = getWeeklyBreakdownLabels(prospect.industryId);
  const weeklyTrendData = [
    { week: 'Week 1', label: weeklyLabels[0].label, value: week1Revenue, share: weeklyLabels[0].share },
    { week: 'Week 2', label: weeklyLabels[1].label, value: week2Revenue, share: weeklyLabels[1].share },
    { week: 'Week 3', label: weeklyLabels[2].label, value: week3Revenue, share: weeklyLabels[2].share },
    { week: 'Week 4', label: weeklyLabels[3].label, value: week4Revenue, share: weeklyLabels[3].share }
  ];

  const maxWeeklyRevenue = Math.max(week4Revenue * 1.25, 10000);
  const chartHeight = 130;
  const chartBaseY = 160;
  const getChartY = (val: number) => Math.round(chartBaseY - (val / maxWeeklyRevenue) * chartHeight);

  const y1 = getChartY(week1Revenue);
  const y2 = getChartY(week2Revenue);
  const y3 = getChartY(week3Revenue);
  const y4 = getChartY(week4Revenue);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-lime-400 text-gray-950 font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header with double-click for Owner Access (no tooltip or visible text) */}
          <div
            onDoubleClick={onLogoDoubleClick}
            className="p-5 border-b border-gray-800 flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center p-1 group-hover:border-lime-400 transition">
              <img
                src={prospect.logoUrl}
                alt="Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-white text-sm truncate group-hover:text-lime-400 transition">{prospect.companyName}</h2>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{INDUSTRY_PROFILES[prospect.industryId]?.brandSuffix || 'RoofLead AI'} Suite</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview' as const, label: 'Dashboard', icon: '📊' },
              { id: 'leads' as const, label: INDUSTRY_PROFILES[prospect.industryId]?.leadTypeLabel || 'Leads & Enquiries', icon: '🔥', count: leads.length },
              { id: 'inbox' as const, label: 'AI Inbox', icon: '💬' },
              { id: 'followups' as const, label: 'Follow-ups', icon: '⚡', count: followups.filter(f => f.status !== 'Completed').length },
              { id: 'inspections' as const, label: INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel || 'Inspections', icon: '📅', count: inspections.length },
              { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
              { id: 'settings' as const, label: 'Settings', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentTab === item.id
                    ? 'bg-lime-400 text-gray-950 shadow-md font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    currentTab === item.id ? 'bg-gray-950 text-lime-400' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          {onRunLiveSplitDemo && (
            <button
              onClick={onRunLiveSplitDemo}
              className="w-full bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 border border-slate-700 transition cursor-pointer"
            >
              <span>⚡</span>
              <span>Live Split Demo</span>
            </button>
          )}
          <button
            onClick={onRunCustomerDemo}
            className="w-full bg-lime-400 hover:bg-lime-500 text-gray-950 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition cursor-pointer"
          >
            <span>▶</span>
            <span>Test Customer Intake</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top App Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-extrabold text-white">
              {prospect.companyName}
            </h1>
            <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-700 tracking-wider">
              DEMO DATA
            </span>
            {onRunLiveSplitDemo && (
              <button
                onClick={onRunLiveSplitDemo}
                className="bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-700 transition cursor-pointer flex items-center space-x-1"
              >
                <span>⚡</span>
                <span>Live Split Demo</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">Logged in as {INDUSTRY_PROFILES[prospect.industryId]?.name || 'Contractor'}</p>
              <p className="text-[10px] text-lime-400">AI Receptionist Active</p>
            </div>
          </div>
        </header>

        {/* TAB CONTENT */}
        <main className="p-6 space-y-6">

          {currentTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 font-medium">Total Enquiries (Demo)</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{leads.length}</p>
                  <p className="text-[11px] text-lime-400 mt-1">Example conversion rate: 100% responded</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 font-medium">Hot Leads (Urgent Issues)</p>
                  <p className="text-3xl font-extrabold text-red-400 mt-2">
                    {leads.filter(l => l.urgency === 'HOT').length}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Requires immediate attention</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 font-medium">
                    Booked {INDUSTRY_PROFILES[prospect.industryId]?.bookingLabel || 'Inspections'}
                  </p>
                  <p className="text-3xl font-extrabold text-lime-400 mt-2">{inspections.length}</p>
                  <p className="text-[11px] text-lime-400 mt-1">Demo metric</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 font-medium">Sample Pipeline Value</p>
                  <p className="text-3xl font-extrabold text-white mt-2">
                    R{leads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Illustrative demo benchmark</p>
                </div>
              </div>

              {/* Recent Hot Leads Table */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Recent {INDUSTRY_PROFILES[prospect.industryId]?.leadTypeLabel || 'Enquiries'}
                    </h3>
                    <p className="text-xs text-gray-400">Captured and qualified automatically by AI</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('leads')}
                    className="text-xs text-lime-400 hover:underline font-semibold cursor-pointer"
                  >
                    View All ({leads.length}) →
                  </button>
                </div>
                <div className="divide-y divide-gray-800">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-800/40 transition">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-white text-xs">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-white">{lead.name}</h4>
                            <UrgencyBadge urgency={lead.urgency} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {lead.suburb} • {lead.type} ({lead.roof}) • <span className="text-lime-400 font-mono">R{lead.value.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => { setBookingLead(lead); setIsBookingModalOpen(true); }}
                          className="text-xs bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          {INDUSTRY_PROFILES[prospect.industryId]?.bookingActionLabel || 'Book'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === 'leads' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                <input
                  type="text"
                  placeholder="Search by lead name, suburb, or repair type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                />
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-gray-400 mr-1">Urgency:</span>
                  {['ALL', 'HOT', 'WARM', 'LOW'].map(u => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        urgencyFilter === u ? 'bg-lime-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <UrgencyBadge urgency={lead.urgency} />
                        <span className="text-[11px] text-gray-500 font-mono">{lead.time}</span>
                      </div>
                      <h3 className="font-bold text-base text-white">{lead.name}</h3>
                      <p className="text-xs text-gray-400">
                        📍 {lead.suburb} • {lead.property} ({lead.roof} Roof)
                      </p>
                      <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 text-xs text-gray-300">
                        <p className="font-semibold text-gray-400 text-[10px] uppercase mb-1">Issue Reported:</p>
                        <p className="italic">"{lead.problem}"</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Estimated Job</p>
                        <p className="text-sm font-bold text-lime-400">R{lead.value.toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setBookingLead(lead); setIsBookingModalOpen(true); }}
                          className="text-xs bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'inbox' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl h-[600px] flex overflow-hidden animate-fadeIn">
              {/* Lead List */}
              <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
                <div className="p-4 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase tracking-wider">
                  Active AI Conversations
                </div>
                {leads.slice(0, 8).map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 border-b border-gray-800/60 cursor-pointer hover:bg-gray-800/50 transition ${
                      selectedLead?.id === lead.id ? 'bg-gray-800/80' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{lead.name}</span>
                      <span className="text-[10px] text-gray-500">{lead.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{lead.problem}</p>
                  </div>
                ))}
              </div>

              {/* Chat Display */}
              <div className="flex-1 flex flex-col justify-between bg-gray-950/50 p-6">
                <div className="border-b border-gray-800 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedLead ? selectedLead.name : "Sarah Mokoena"}</h3>
                    <p className="text-xs text-gray-400">{selectedLead ? selectedLead.suburb : "Fourways"} • Active Intake Session</p>
                  </div>
                  <span className="text-xs bg-lime-900/40 text-lime-400 border border-lime-800 px-2.5 py-1 rounded-full font-mono">
                    AI Managed
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
                  <div className="bg-gray-800 text-gray-200 text-xs p-3 rounded-xl max-w-[80%] border border-gray-700">
                    {prospect.prospectGreeting}
                  </div>
                  <div className="bg-lime-400 text-gray-950 font-medium text-xs p-3 rounded-xl max-w-[80%] ml-auto">
                    {selectedLead ? selectedLead.problem : "Water coming through ceiling in main bedroom after rain."}
                  </div>
                  <div className="bg-gray-800 text-gray-200 text-xs p-3 rounded-xl max-w-[80%] border border-gray-700">
                    Thank you. We have logged this enquiry for {prospect.companyName}. An inspection team member will contact you shortly.
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type manual override message..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => showNotification("Manual message sent to prospect!")}
                    className="bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'followups' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Automated Follow-up Queue</h3>
                  <p className="text-xs text-gray-400">Nurturing unanswered quotes and lead confirmations automatically</p>
                </div>
              </div>

              <div className="space-y-3">
                {followups.map(item => (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{item.lead}</span>
                        <span className="text-[10px] bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-md font-mono">{item.stage}</span>
                      </div>
                      <p className="text-xs text-gray-400 italic">"{item.message}"</p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.status === 'Completed' ? 'bg-lime-900/40 text-lime-400 border border-lime-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}>
                        {item.status}
                      </span>
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => handleTriggerFollowup(item.id)}
                          className="text-xs bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Trigger Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'inspections' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between bg-gray-900 border border-gray-800 p-5 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white text-sm">Scheduled {currentIndustry.bookingLabel}</h3>
                  <p className="text-xs text-gray-400">Total upcoming {currentIndustry.bookingLabel.toLowerCase()}: {inspections.length}</p>
                </div>
                <button
                  onClick={() => { setBookingLead(null); setIsBookingModalOpen(true); }}
                  className="bg-lime-400 hover:bg-lime-500 text-gray-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  + Schedule New {currentIndustry.bookingLabel.replace(/s$/, '')}
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-gray-950 text-gray-400 uppercase font-mono border-b border-gray-800">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Suburb</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">{currentIndustry.teamLabel}</th>
                      <th className="p-4">{currentIndustry.valueLabel}</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {inspections.map(insp => (
                      <tr key={insp.id} className="hover:bg-gray-800/40">
                        <td className="p-4 font-bold text-white">{insp.customer}</td>
                        <td className="p-4">{insp.suburb}</td>
                        <td className="p-4 font-mono">{insp.date} at {insp.time}</td>
                        <td className="p-4">{insp.team}</td>
                        <td className="p-4 font-bold text-lime-400">{insp.value}</td>
                        <td className="p-4">
                          <Badge variant="green">{insp.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Notice Banner */}
              <div className="bg-gray-900/80 border border-gray-800 px-4 py-2.5 rounded-xl text-center">
                <p className="text-xs text-gray-400 tracking-wider font-mono uppercase">
                  ILLUSTRATIVE DEMO DATA — NOT LIVE CUSTOMER RESULTS
                </p>
              </div>

              {/* Top Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Avg. Lead Response Speed</p>
                  <p className="text-4xl font-extrabold text-lime-400">42 Seconds</p>
                  <p className="text-xs text-gray-500">Demo metric benchmark</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Inspection Conversion Sample</p>
                  <p className="text-4xl font-extrabold text-white">68%</p>
                  <p className="text-xs text-gray-500">Example conversion rate</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Sample Monthly Pipeline</p>
                  <p className="text-4xl font-extrabold text-white">
                    R{totalUrgencyValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Aggregated from active pipeline</p>
                </div>
              </div>

              {/* PERFORMANCE GAUGE (RECHARTS) & PROJECTED REVENUE TRENDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col">
                  <QuarterlyTargetGauge
                    projectedMonthlyRevenue={projectedMonthlyTotal}
                    quarterlyTarget={quarterlyTarget}
                    currencyPrefix="R"
                    industryName={currentIndustry.name}
                  />
                </div>

                <div className="lg:col-span-2">
                  {/* PROJECTED MONTHLY REVENUE LINE CHART WIDGET */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 h-full flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lime-400 font-bold text-base">📈</span>
                          <h3 className="font-extrabold text-white text-base">Projected Monthly Revenue</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Projected revenue trends over the next 4 weeks modeled from active leads, historical closure velocity, and inspection schedules.
                        </p>
                      </div>
                      <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 shrink-0 text-right">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Estimated Month-End Total</span>
                        <span className="text-base font-extrabold text-lime-400 font-mono">
                          R{projectedMonthlyTotal.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-lime-400/80 block font-mono">
                          ~{Math.round(projectedCloseRate * 100)}% Pipeline Realization
                        </span>
                      </div>
                    </div>

                    {/* Line Chart Graphic */}
                    <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-0.5 bg-lime-400 inline-block rounded-full"></span>
                          Cumulative 4-Week Realization Curve
                        </span>
                        <span className="font-mono text-[11px] text-gray-400">Target Ceiling: R{maxWeeklyRevenue.toLocaleString()}</span>
                      </div>

                      {/* SVG Line Chart */}
                      <div className="w-full overflow-x-auto custom-scrollbar">
                        <svg
                          viewBox="0 0 600 200"
                          className="w-full min-w-[500px] h-48"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="revenueLineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#a3e635" />
                              <stop offset="50%" stopColor="#84cc16" />
                              <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                            <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.32" />
                              <stop offset="60%" stopColor="#84cc16" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid Lines */}
                          <line x1="30" y1={chartBaseY} x2="570" y2={chartBaseY} stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="30" y1={Math.round(chartBaseY - chartHeight * 0.33)} x2="570" y2={Math.round(chartBaseY - chartHeight * 0.33)} stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="30" y1={Math.round(chartBaseY - chartHeight * 0.66)} x2="570" y2={Math.round(chartBaseY - chartHeight * 0.66)} stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="30" y1={chartBaseY - chartHeight} x2="570" y2={chartBaseY - chartHeight} stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />

                          {/* Y-Axis Value Labels */}
                          <text x="35" y={chartBaseY - chartHeight + 4} fill="#6b7280" fontSize="9" fontFamily="monospace">
                            R{maxWeeklyRevenue.toLocaleString()}
                          </text>
                          <text x="35" y={Math.round(chartBaseY - chartHeight * 0.5) + 3} fill="#4b5563" fontSize="9" fontFamily="monospace">
                            R{Math.round(maxWeeklyRevenue / 2).toLocaleString()}
                          </text>
                          <text x="35" y={chartBaseY - 4} fill="#4b5563" fontSize="9" fontFamily="monospace">
                            R0
                          </text>

                          {/* Shaded Area Under Curve */}
                          <path
                            d={`M 60,${chartBaseY} L 60,${y1} C 130,${(y1 + y2) / 2} 150,${(y1 + y2) / 2} 220,${y2} C 290,${(y2 + y3) / 2} 310,${(y2 + y3) / 2} 380,${y3} C 450,${(y3 + y4) / 2} 470,${(y3 + y4) / 2} 540,${y4} L 540,${chartBaseY} Z`}
                            fill="url(#revenueAreaGrad)"
                          />

                          {/* Smooth Line Stroke */}
                          <path
                            d={`M 60,${y1} C 130,${(y1 + y2) / 2} 150,${(y1 + y2) / 2} 220,${y2} C 290,${(y2 + y3) / 2} 310,${(y2 + y3) / 2} 380,${y3} C 450,${(y3 + y4) / 2} 470,${(y3 + y4) / 2} 540,${y4}`}
                            fill="none"
                            stroke="url(#revenueLineGrad)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Data Point Nodes and Tooltip Badges */}
                          {[
                            { x: 60, y: y1, val: week1Revenue, week: 'Week 1' },
                            { x: 220, y: y2, val: week2Revenue, week: 'Week 2' },
                            { x: 380, y: y3, val: week3Revenue, week: 'Week 3' },
                            { x: 540, y: y4, val: week4Revenue, week: 'Week 4' }
                          ].map((pt, idx) => (
                            <g key={idx} className="cursor-pointer group">
                              {/* Glow circle */}
                              <circle cx={pt.x} cy={pt.y} r="10" fill="#84cc16" opacity="0.2" className="animate-pulse" />
                              {/* Outer node */}
                              <circle cx={pt.x} cy={pt.y} r="6" fill="#0f172a" stroke="#84cc16" strokeWidth="2.5" />
                              {/* Inner center */}
                              <circle cx={pt.x} cy={pt.y} r="2.5" fill="#a3e635" />
                              
                              {/* Value Tag Badge */}
                              <rect
                                x={pt.x - 42}
                                y={pt.y - 30}
                                width="84"
                                height="18"
                                rx="4"
                                fill="#020617"
                                stroke="#334155"
                                strokeWidth="1"
                              />
                              <text
                                x={pt.x}
                                y={pt.y - 17}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                R{pt.val.toLocaleString()}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      {/* 4-Week Breakdown Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {weeklyTrendData.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-900/90 border border-gray-800/90 rounded-xl p-3 space-y-1 hover:border-lime-500/40 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-lime-400 font-mono">{item.week}</span>
                              <span className="text-[10px] bg-gray-800 text-gray-300 font-mono px-1.5 py-0.5 rounded">
                                {item.share}
                              </span>
                            </div>
                            <p className="text-base font-extrabold text-white font-mono">
                              R{item.value.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400 leading-tight">
                              {item.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REVENUE BY LEAD URGENCY BAR CHART */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lime-400 font-bold text-base">📊</span>
                      <h3 className="font-extrabold text-white text-base">Lead Value by Urgency Level</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Visualizing total pipeline value by urgency segment (HOT, WARM, LOW) to identify high-revenue revenue opportunities.
                    </p>
                  </div>
                  <div className="bg-gray-950 px-3.5 py-1.5 rounded-xl border border-gray-800 shrink-0 text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Tracked Pipeline</span>
                    <span className="text-sm font-extrabold text-lime-400 font-mono">R{totalUrgencyValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Urgency Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* HOT */}
                  <div className="bg-gray-950/70 border border-red-900/40 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        HOT Urgency
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{hotLeads.length} leads</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      R{hotValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {Math.round((hotValue / totalUrgencyValue) * 100)}% of total pipeline
                    </p>
                  </div>

                  {/* WARM */}
                  <div className="bg-gray-950/70 border border-amber-900/40 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        WARM Urgency
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{warmLeads.length} leads</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      R{warmValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {Math.round((warmValue / totalUrgencyValue) * 100)}% of total pipeline
                    </p>
                  </div>

                  {/* LOW */}
                  <div className="bg-gray-950/70 border border-gray-800 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        LOW Urgency
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{lowLeads.length} leads</span>
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      R{lowValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {Math.round((lowValue / totalUrgencyValue) * 100)}% of total pipeline
                    </p>
                  </div>
                </div>

                {/* Vertical Bar Chart Graphic */}
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-6 space-y-4">
                  <div className="h-56 flex items-end justify-around gap-4 sm:gap-12 pt-8 pb-2 px-4 border-b border-gray-800 relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 px-2 py-4">
                      <div className="border-b border-gray-600 w-full flex justify-between text-[10px] font-mono text-gray-400">
                        <span>Max</span>
                        <span>R{maxUrgencyValue.toLocaleString()}</span>
                      </div>
                      <div className="border-b border-gray-700 w-full flex justify-between text-[10px] font-mono text-gray-400">
                        <span>50%</span>
                        <span>R{Math.round(maxUrgencyValue / 2).toLocaleString()}</span>
                      </div>
                      <div className="border-b border-gray-800 w-full flex justify-between text-[10px] font-mono text-gray-400">
                        <span>0</span>
                        <span>R0</span>
                      </div>
                    </div>

                    {/* Bar 1: HOT */}
                    <div className="flex-1 max-w-[120px] flex flex-col items-center h-full justify-end group z-10">
                      <span className="text-xs font-bold text-white mb-2 font-mono group-hover:scale-105 transition">
                        R{hotValue.toLocaleString()}
                      </span>
                      <div className="w-full bg-gray-900/60 rounded-t-xl overflow-hidden flex items-end h-[180px] p-1">
                        <div
                          className="w-full bg-gradient-to-t from-red-600 via-rose-500 to-rose-400 rounded-lg transition-all duration-700 shadow-[0_0_15px_rgba(239,68,68,0.25)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                          style={{
                            height: `${Math.max(Math.round((hotValue / maxUrgencyValue) * 100), 8)}%`
                          }}
                        ></div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs font-bold text-red-400 block">HOT 🔥</span>
                        <span className="text-[10px] text-gray-400 font-mono">{hotLeads.length} leads</span>
                      </div>
                    </div>

                    {/* Bar 2: WARM */}
                    <div className="flex-1 max-w-[120px] flex flex-col items-center h-full justify-end group z-10">
                      <span className="text-xs font-bold text-white mb-2 font-mono group-hover:scale-105 transition">
                        R{warmValue.toLocaleString()}
                      </span>
                      <div className="w-full bg-gray-900/60 rounded-t-xl overflow-hidden flex items-end h-[180px] p-1">
                        <div
                          className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-lg transition-all duration-700 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                          style={{
                            height: `${Math.max(Math.round((warmValue / maxUrgencyValue) * 100), 8)}%`
                          }}
                        ></div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs font-bold text-amber-400 block">WARM ⚡</span>
                        <span className="text-[10px] text-gray-400 font-mono">{warmLeads.length} leads</span>
                      </div>
                    </div>

                    {/* Bar 3: LOW */}
                    <div className="flex-1 max-w-[120px] flex flex-col items-center h-full justify-end group z-10">
                      <span className="text-xs font-bold text-white mb-2 font-mono group-hover:scale-105 transition">
                        R{lowValue.toLocaleString()}
                      </span>
                      <div className="w-full bg-gray-900/60 rounded-t-xl overflow-hidden flex items-end h-[180px] p-1">
                        <div
                          className="w-full bg-gradient-to-t from-slate-700 via-slate-600 to-slate-400 rounded-lg transition-all duration-700 shadow-[0_0_10px_rgba(148,163,184,0.15)] group-hover:shadow-[0_0_20px_rgba(148,163,184,0.3)]"
                          style={{
                            height: `${Math.max(Math.round((lowValue / maxUrgencyValue) * 100), 8)}%`
                          }}
                        ></div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-xs font-bold text-gray-400 block">LOW ⏱️</span>
                        <span className="text-[10px] text-gray-400 font-mono">{lowLeads.length} leads</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Segment Share Bars */}
                  <div className="pt-3 space-y-2">
                    <div className="text-[11px] text-gray-400 font-medium">Pipeline Distribution Share:</div>
                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ width: `${(hotValue / totalUrgencyValue) * 100}%` }}
                        title={`HOT: R${hotValue.toLocaleString()}`}
                      ></div>
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${(warmValue / totalUrgencyValue) * 100}%` }}
                        title={`WARM: R${warmValue.toLocaleString()}`}
                      ></div>
                      <div
                        className="bg-slate-600 h-full transition-all duration-500"
                        style={{ width: `${(lowValue / totalUrgencyValue) * 100}%` }}
                        title={`LOW: R${lowValue.toLocaleString()}`}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-red-500"></span>
                        HOT: {Math.round((hotValue / totalUrgencyValue) * 100)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-amber-500"></span>
                        WARM: {Math.round((warmValue / totalUrgencyValue) * 100)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-slate-600"></span>
                        LOW: {Math.round((lowValue / totalUrgencyValue) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="max-w-2xl bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-6 animate-fadeIn">
              <h3 className="font-bold text-white text-base">Contractor System Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Business Name</label>
                  <input
                    type="text"
                    defaultValue={prospect.companyName}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Suburbs Covered</label>
                  <input
                    type="text"
                    defaultValue={prospect.serviceAreas}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">AI Receptionist Welcome Greeting</label>
                  <textarea
                    rows={3}
                    defaultValue={prospect.prospectGreeting}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => showNotification("Settings saved successfully!")}
                  className="bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* LEAD DETAIL PANEL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-gray-900 border-l border-gray-800 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-white">{selectedLead.name}</h2>
                  <p className="text-xs text-gray-400">📍 {selectedLead.suburb} • {selectedLead.phone}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-xl cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Lead Urgency:</span>
                    <UrgencyBadge urgency={selectedLead.urgency} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {prospect.industryId === 'dentistry' ? 'Dental Focus:' :
                       prospect.industryId === 'auto_repair' ? 'Vehicle System:' :
                       prospect.industryId === 'plumbing' ? 'Plumbing System:' :
                       prospect.industryId === 'electrical' ? 'Electrical Focus:' :
                       prospect.industryId === 'solar' ? 'Solar Requirement:' :
                       prospect.industryId === 'hvac' ? 'HVAC System:' :
                       prospect.industryId === 'roofing' ? 'Roof Type:' : 'Service Category:'}
                    </span>
                    <span className="font-bold text-white">{selectedLead.roof}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{currentIndustry.valueLabel}:</span>
                    <span className="font-bold text-lime-400">R{selectedLead.value.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">AI Lead Assessment</h4>
                  <p className="text-gray-300 bg-gray-950 p-3 rounded-xl border border-gray-800">{selectedLead.aiSummary}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">Customer Reported Problem</h4>
                  <p className="text-gray-300 italic bg-gray-950 p-3 rounded-xl border border-gray-800">"{selectedLead.problem}"</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex space-x-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl text-xs font-semibold cursor-pointer"
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
                className="flex-1 bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold py-3 rounded-xl text-xs cursor-pointer"
              >
                {currentIndustry.bookingActionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION / SERVICE BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="font-bold text-white text-base">
                {currentIndustry.bookingModalTitle} for {bookingLead ? bookingLead.name : 'Customer'}
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">{currentIndustry.bookingLabel.replace(/s$/, '')} Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-lime-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-lime-400"
                >
                  <option>08:00 AM</option>
                  <option>10:00 AM</option>
                  <option>01:00 PM</option>
                  <option>03:30 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">{currentIndustry.teamLabel}</label>
                <select
                  value={bookingTech}
                  onChange={(e) => setBookingTech(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-lime-400"
                >
                  {prospect.industryId === 'dentistry' ? (
                    <>
                      <option>Dr. Jaco V. (Principal Dentist)</option>
                      <option>Dr. Mandla K. (Associate Dentist)</option>
                      <option>Chair 1 (Open Allocation)</option>
                    </>
                  ) : prospect.industryId === 'plumbing' ? (
                    <>
                      <option>Jaco V. (Master Plumber)</option>
                      <option>Mandla K. (Drain Specialist)</option>
                      <option>Unassigned (Pool)</option>
                    </>
                  ) : prospect.industryId === 'electrical' ? (
                    <>
                      <option>Jaco V. (Master Electrician)</option>
                      <option>Mandla K. (Installation Tech)</option>
                      <option>Unassigned (Pool)</option>
                    </>
                  ) : prospect.industryId === 'solar' ? (
                    <>
                      <option>Jaco V. (PV System Engineer)</option>
                      <option>Mandla K. (Senior Solar Tech)</option>
                      <option>Unassigned (Pool)</option>
                    </>
                  ) : prospect.industryId === 'hvac' ? (
                    <>
                      <option>Jaco V. (HVAC Master Tech)</option>
                      <option>Mandla K. (Cooling Specialist)</option>
                      <option>Unassigned (Pool)</option>
                    </>
                  ) : prospect.industryId === 'auto_repair' ? (
                    <>
                      <option>Jaco V. (Master Diagnostic Tech)</option>
                      <option>Mandla K. (Senior Mechanic)</option>
                      <option>Bay 1 / Pool</option>
                    </>
                  ) : (
                    <>
                      <option>Jaco V. (Senior Inspector)</option>
                      <option>Mandla K. (Lead Tech)</option>
                      <option>Unassigned (Pool)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-800 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-gray-950 font-bold py-3 rounded-xl shadow-lg cursor-pointer"
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

const INITIAL_LEADS: Lead[] = INDUSTRY_PROFILES.roofing.sampleLeads;
const INITIAL_FOLLOWUPS: FollowupItem[] = INDUSTRY_PROFILES.roofing.sampleFollowups;
const INITIAL_INSPECTIONS: InspectionItem[] = INDUSTRY_PROFILES.roofing.sampleBookings;

export default function App() {
  const [prospect, setProspect] = useState<ProspectProfile>(DEFAULT_PROSPECT);
  const [activeView, setActiveView] = useState<'live-split-demo' | 'landing' | 'customer-demo' | 'dashboard' | 'owner-control'>('live-split-demo');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [followups, setFollowups] = useState<FollowupItem[]>(INITIAL_FOLLOWUPS);
  const [inspections, setInspections] = useState<InspectionItem[]>(INITIAL_INSPECTIONS);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Auto-load shared prospect demo from URL parameters if present
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const sharedIndustry = params.get('industry') as IndustryId | null;
      const sharedUrl = params.get('url');
      const sharedCompany = params.get('company');

      if (sharedIndustry || sharedUrl || sharedCompany) {
        const targetUrl = sharedUrl || DEFAULT_PROSPECT.websiteUrl;
        const validInd = sharedIndustry && INDUSTRY_PROFILES[sharedIndustry] ? sharedIndustry : undefined;
        const derived = deriveProfileFromUrl(targetUrl, validInd);
        if (sharedCompany) {
          derived.companyName = sharedCompany;
          derived.dashboardBusinessName = sharedCompany;
        }
        setProspect(derived);
        const ind = INDUSTRY_PROFILES[derived.industryId] || INDUSTRY_PROFILES.roofing;
        setLeads([...ind.sampleLeads]);
        setFollowups([...ind.sampleFollowups]);
        setInspections([...ind.sampleBookings]);
        setActiveView('live-split-demo');
        triggerToast(`Shared demo loaded for ${derived.companyName}!`);
      }
    } catch (e) {
      console.warn("Could not parse shared demo parameters", e);
    }
  }, []);

  const handleSelectIndustry = (newIndustryId: IndustryId) => {
    const updated = deriveProfileFromUrl(prospect.websiteUrl, newIndustryId);
    setProspect(updated);
    const ind = INDUSTRY_PROFILES[newIndustryId] || INDUSTRY_PROFILES.roofing;
    setLeads([...ind.sampleLeads]);
    setFollowups([...ind.sampleFollowups]);
    setInspections([...ind.sampleBookings]);
    triggerToast(`Switched industry demo to ${ind.name}!`);
  };

  const handleActivateProspect = (newProspect: ProspectProfile) => {
    setProspect(newProspect);
    const ind = INDUSTRY_PROFILES[newProspect.industryId] || INDUSTRY_PROFILES.general;
    setLeads([...ind.sampleLeads]);
    setFollowups([...ind.sampleFollowups]);
    setInspections([...ind.sampleBookings]);
    setActiveView('live-split-demo');
    triggerToast(`Demo activated for ${newProspect.companyName}!`);
  };

  const handleResetDefault = () => {
    setProspect({ ...DEFAULT_PROSPECT });
    setLeads([...INITIAL_LEADS]);
    setFollowups([...INITIAL_FOLLOWUPS]);
    setInspections([...INITIAL_INSPECTIONS]);
    setActiveView('live-split-demo');
    triggerToast("App restored to default demo state.");
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
    <div>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-lime-400 text-gray-950 font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
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

      {/* PRIMARY SCREEN: PERMANENT SPLIT-SCREEN LIVE DEMO */}
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

      {activeView === 'landing' && (
        <LandingScreen
          prospect={prospect}
          onStartDemo={() => setActiveView('live-split-demo')}
          onEnterApp={() => setActiveView('dashboard')}
          onLogoDoubleClick={handleLogoDoubleClick}
        />
      )}

      {activeView === 'customer-demo' && (
        <CustomerDemoFlow
          prospect={prospect}
          onComplete={handleCustomerDemoComplete}
          onCancel={() => setActiveView('live-split-demo')}
        />
      )}

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
