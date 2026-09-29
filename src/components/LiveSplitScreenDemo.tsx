import React, { useState, useEffect, useRef } from 'react';
import {
  IndustryId,
  INDUSTRY_PROFILES,
  IndustryProfile,
  DemoLead as Lead
} from '../industryProfiles';

export type AcquisitionSource =
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'Google / Ad'
  | 'Link in Bio'
  | 'Email';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'leadmachine';
  text: string;
  time: string;
}

interface LiveLeadCardData {
  name: string;
  source: AcquisitionSource;
  service: string;
  suburb: string;
  urgency: 'HOT' | 'WARM' | 'LOW';
  score: number;
  aiSummary: string;
  status: 'New' | 'Analyzing' | 'Responded' | 'Qualified' | 'Booked';
  suggestedAction: string;
  autoReplyStatus: string;
  latestSnippet: string;
}

interface LiveSplitScreenDemoProps {
  currentIndustryId: IndustryId;
  companyName: string;
  logoUrl: string;
  onSelectIndustry: (id: IndustryId) => void;
  onOpenFullDashboard: () => void;
  onOpenLandingPage: () => void;
  onLogoDoubleClick: () => void;
  initialLeads: Lead[];
}

export const LiveSplitScreenDemo: React.FC<LiveSplitScreenDemoProps> = ({
  currentIndustryId,
  companyName,
  logoUrl,
  onSelectIndustry,
  onOpenFullDashboard,
  onOpenLandingPage,
  onLogoDoubleClick,
  initialLeads
}) => {
  const industry: IndustryProfile = INDUSTRY_PROFILES[currentIndustryId] || INDUSTRY_PROFILES.roofing;

  // Acquisition source state (WhatsApp default)
  const [source, setSource] = useState<AcquisitionSource>('WhatsApp');

  // Customer conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);

  // Centre process indicator state
  const [processStage, setProcessStage] = useState<'idle' | 'enquiry' | 'analyse' | 'respond' | 'qualify'>('idle');

  // Business side live lead state
  const [liveLead, setLiveLead] = useState<LiveLeadCardData | null>(null);
  const [unreadCount, setUnreadCount] = useState(3);
  const [resetFeedback, setResetFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Industry script steps
  const script = industry.getScript(companyName, industry.greetingTemplate.replace('{company}', companyName));

  // Determine realistic customer scenario data per industry
  const getScenarioDefaults = () => {
    switch (currentIndustryId) {
      case 'plumbing':
        return {
          customerName: 'Thandi M.',
          suburb: 'Rivonia',
          service: 'Emergency geyser repair',
          prompts: [
            "Hi, my geyser burst. Can someone come today?",
            "Rivonia Road. How quickly can you come?",
            "Yes, I shut the main valve. Please send the plumber."
          ],
          aiReplies: [
            "Hi Thandi, yes we can help immediately! What street are you on?",
            "We have an emergency master plumber in Sandton/Rivonia within 35 minutes. Is the water supply isolated?",
            `Master Plumber Jaco V. dispatched to Rivonia Road. ETA 35 minutes. Tracking details sent via SMS.`
          ],
          aiSummaries: [
            "NEW LEAD: Urgent burst geyser inquiry from Rivonia. Immediate service intent.",
            "HOT LEAD · 9/10: Geyser flooding risk. Water isolated. Immediate master plumber dispatch approved.",
            "QUALIFIED: Geyser emergency locked in. Master plumber dispatched with 35-min ETA."
          ],
          actions: [
            "AI Intake active · Triage response dispatched in 28s",
            "Contact customer immediately · Review water cutoff safety",
            "Job confirmed · Plumber Jaco V. en route to Rivonia"
          ]
        };
      case 'dentistry':
        return {
          customerName: 'David S.',
          suburb: 'Rosebank',
          service: 'Acute toothache & emergency triage',
          prompts: [
            "Hi, I have severe throbbing tooth pain since last night. Do you have an emergency chair today?",
            "Slight swelling on lower right jaw. In Rosebank.",
            "Yes please, booking 11:00 AM."
          ],
          aiReplies: [
            "Hi David, sorry you are in pain! Yes, we reserve emergency slots. Are you experiencing any facial swelling?",
            "Understood. We can get you into Chair 1 with Dr. Jaco at 11:00 AM today. Does that work for you?",
            `Confirmed! Chair 1 reserved for 11:00 AM with Dr. Jaco at ${companyName}. Please bring your medical aid card.`
          ],
          aiSummaries: [
            "NEW LEAD: Severe throbbing toothache inquiry in Rosebank. High pain level reported.",
            "HOT LEAD · 10/10: Acute tooth pain with lower jaw swelling. Flagged for emergency chair placement.",
            "QUALIFIED: Emergency chair consultation confirmed for 11:00 AM today with Dr. Jaco."
          ],
          actions: [
            "AI Intake active · Triage response dispatched in 25s",
            "Prepare Chair 1 for acute dental triage at 11:00 AM",
            "Patient locked in calendar · Medical aid intake sent"
          ]
        };
      case 'electrical':
        return {
          customerName: 'Sipho Z.',
          suburb: 'Sandton',
          service: 'Main breaker tripping & DB fault',
          prompts: [
            "Hi, our main circuit breaker keeps tripping and half the house has no power. Can an electrician come out?",
            "No smoke, but stove and fridge circuits won't stay up. We're in Sandton.",
            "Yes, please confirm for 12:00 PM."
          ],
          aiReplies: [
            "Hi Sipho, we can help right away! Is there any burning smell or sparking near the DB board?",
            "Understood. No smoke signs. We have a licensed electrician open in Sandton by 12:00 PM. Shall we reserve that slot?",
            `Booked! Master Electrician Mandla K. confirmed for 12:00 PM in Sandton. Compliance equipment ready.`
          ],
          aiSummaries: [
            "NEW LEAD: Repeated DB circuit breaker trip affecting essential power in Sandton.",
            "HOT LEAD · 9/10: Electrical fault impacting refrigeration. Priority certified electrician allocated.",
            "QUALIFIED: Site assessment confirmed for 12:00 PM today. Compliance COC ready."
          ],
          actions: [
            "AI Intake active · Electrical hazard triage in 30s",
            "Contact customer immediately · Allocate DB test equipment",
            "Electrician dispatched for 12:00 PM in Sandton"
          ]
        };
      case 'solar':
        return {
          customerName: 'Lerato M.',
          suburb: 'Bryanston',
          service: '8kW Inverter & 10kWh Battery storage',
          prompts: [
            "Hi, our electric bill hit R6,800/mo and we want a solar & battery backup system. Can you quote?",
            "Single phase standalone house in Bryanston. Looking for 8kW inverter with 10kWh battery.",
            "Yes, tomorrow at 10:00 AM works."
          ],
          aiReplies: [
            "Hi Lerato, we can definitely help size the ideal system! Is your property single or three-phase?",
            "Perfect sizing for that consumption. Would tomorrow at 10:00 AM suit for an engineering site audit?",
            `Engineering consultation scheduled for tomorrow at 10:00 AM in Bryanston. Solar sizing report initiated.`
          ],
          aiSummaries: [
            "NEW LEAD: High-bill homeowner seeking 8kW solar system sizing in Bryanston.",
            "WARM LEAD · 8/10: Single-phase home, R6,800/mo spend. Engineering site survey proposed.",
            "QUALIFIED: Engineering PV audit booked for tomorrow 10:00 AM. Consumption model generated."
          ],
          actions: [
            "AI Intake active · Sizing questionnaire completed",
            "Assign PV engineer for Bryanston site audit",
            "Audit scheduled · Pre-proposal drafted"
          ]
        };
      case 'cleaning':
        return {
          customerName: 'Nomsa D.',
          suburb: 'Midrand',
          service: 'Move-out deep clean with carpet extraction',
          prompts: [
            "Hi, our lease expires this Friday and we need a full deep move-out clean with steam carpet wash.",
            "Midrand. 3 bedrooms, 2 bathrooms. Power and water are on.",
            "Yes please, Thursday at 08:30 AM is perfect."
          ],
          aiReplies: [
            "Hi Nomsa, we specialize in deposit-guarantee move-out cleans! What suburb is the property located in?",
            "We have a 4-person deep cleaning team open this Thursday morning at 08:30 AM. Would that suit the handover?",
            `Crew Alpha confirmed for Thursday at 08:30 AM in Midrand! Check-in confirmation sent to your cell.`
          ],
          aiSummaries: [
            "NEW LEAD: Time-sensitive 3-bed lease handover in Midrand requiring steam extraction.",
            "HOT LEAD · 9/10: Lease deposit handover deadline Friday. 4-person team allocated.",
            "QUALIFIED: Move-out deep clean confirmed for Thursday 08:30 AM. Deposit checklist issued."
          ],
          actions: [
            "AI Intake active · Deposit package dispatched in 22s",
            "Lock in Crew Alpha for Midrand Thursday schedule",
            "Crew booked · Steam extraction equipment assigned"
          ]
        };
      case 'salon':
        return {
          customerName: 'Anika V.',
          suburb: 'Sandton',
          service: 'Balayage colour correction & style',
          prompts: [
            "Hi, do you have any openings this afternoon for balayage colour correction and cut?",
            "Around 02:30 PM in Sandton if possible.",
            "Yes please, lock in 02:30 PM with Mandy."
          ],
          aiReplies: [
            "Hi Anika! Senior colourist Mandy has an opening at 02:30 PM today. Does that time suit your schedule?",
            "Chair 3 is open for 02:30 PM with Mandy! Can we confirm your booking and send directions?",
            `Chair 3 reserved for Anika with Master Colourist Mandy at 02:30 PM today. See you soon!`
          ],
          aiSummaries: [
            "NEW LEAD: Balayage colour transformation inquiry received via Instagram.",
            "HOT LEAD · 9/10: Same-day salon chair placement requested for colour correction.",
            "QUALIFIED: Chair 3 confirmed with Senior Stylist Mandy for 02:30 PM today."
          ],
          actions: [
            "AI Intake active · Instagram enquiry converted in 20s",
            "Reserve Chair 3 for 2.5 hour colour service",
            "Appointment locked in salon booking book"
          ]
        };
      case 'clinic':
        return {
          customerName: 'Patrick N.',
          suburb: 'Fourways',
          service: 'Acute fever triage & doctor consultation',
          prompts: [
            "Hi, I have a high fever and severe flu symptoms since morning and need to see a doctor today.",
            "Fourways clinic branch is closest. I can make 11:15 AM.",
            "Confirmed, thank you."
          ],
          aiReplies: [
            "Hi Patrick, sorry you're unwell! Dr. Jaco has an opening at 11:15 AM today in Fourways. Would you like that?",
            "Consultation logged with Dr. Jaco for 11:15 AM. Please bring your ID card and medical aid details.",
            `Appointment locked for 11:15 AM in Fourways with Dr. Jaco. Triage form prepared.`
          ],
          aiSummaries: [
            "NEW LEAD: Acute fever & flu symptom inquiry in Fourways requiring same-day doctor consultation.",
            "HOT LEAD · 10/10: Acute clinical triage. Doctor consultation allocated for 11:15 AM.",
            "QUALIFIED: Doctor consultation confirmed with Dr. Jaco for 11:15 AM today."
          ],
          actions: [
            "AI Intake active · Medical triage auto-response in 18s",
            "Prepare examination room for 11:15 AM arrival",
            "Appointment confirmed · Medical record created"
          ]
        };
      case 'roofing':
      default:
        return {
          customerName: 'Sarah Mokoena',
          suburb: 'Fourways',
          service: 'Active roof leak & waterproofing assessment',
          prompts: [
            "Hi, we've got water coming through the ceiling in our main bedroom after last night's rain. Can someone come out?",
            "Yes, it's active right now. We are in Fourways.",
            "Yes please, 11:30 AM works for our inspection."
          ],
          aiReplies: [
            "Hi Sarah! We can get this assessed right away. Is the roof leak active, and what suburb are you in?",
            "Got it. We've flagged this as urgent (Hot · 9/10). Would 11:30 AM today suit for our senior inspector?",
            `Inspection confirmed for 11:30 AM today in Fourways! Senior Inspector Jaco V. will arrive at your address.`
          ],
          aiSummaries: [
            "NEW LEAD: Active water leak dripping in bedroom ceiling following rain in Fourways.",
            "HOT LEAD · 9/10: Active rain leak with ceiling damage risk. Priority inspection allocated.",
            "QUALIFIED: On-site roof inspection confirmed for 11:30 AM today with Senior Inspector Jaco V."
          ],
          actions: [
            "AI Intake active · Storm damage auto-response in 32s",
            "Contact customer immediately · Allocate Fourways inspector",
            "Inspection confirmed · Job added to field schedule"
          ]
        };
    }
  };

  const scenario = getScenarioDefaults();

  // Scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle sending a customer message (from quick-reply button or custom text input)
  const handleSendCustomerMessage = (textToSend?: string) => {
    const text = (textToSend || customInput).trim();
    if (!text || isTyping) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setCustomInput('');

    // Advance Centre process indicator
    setProcessStage('enquiry');

    // Update business side immediately to show new lead activity
    const nextStep = conversationStep + 1;
    setConversationStep(nextStep);

    setTimeout(() => {
      setProcessStage('analyse');
      const stepIndex = Math.min(nextStep - 1, scenario.aiSummaries.length - 1);
      const isFinalStep = nextStep >= 3;

      setLiveLead({
        name: scenario.customerName,
        source: source,
        service: scenario.service,
        suburb: scenario.suburb,
        urgency: isFinalStep ? 'HOT' : 'HOT',
        score: isFinalStep ? 10 : 9,
        aiSummary: scenario.aiSummaries[stepIndex] || `Incoming customer enquiry via ${source}: "${text.slice(0, 60)}..."`,
        status: isFinalStep ? 'Qualified' : nextStep === 1 ? 'New' : 'Responded',
        suggestedAction: scenario.actions[stepIndex] || 'Review customer requirements and verify open schedule',
        autoReplyStatus: 'LeadMachine Auto-Intake active',
        latestSnippet: text
      });
      setUnreadCount(prev => prev + 1);
    }, 450);

    // Simulate natural automated response from LeadMachine
    setIsTyping(true);
    setTimeout(() => {
      setProcessStage('respond');
      const replyText =
        scenario.aiReplies[conversationStep] ||
        `Thanks for your message! Our team at ${companyName} has noted your enquiry. Would you like us to schedule a consultation slot today?`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'leadmachine',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      setTimeout(() => {
        setProcessStage('qualify');
        setLiveLead(prev => prev ? {
          ...prev,
          status: nextStep >= 2 ? 'Qualified' : 'Responded',
          autoReplyStatus: 'Auto-reply dispatched in 38s via LeadMachine Engine'
        } : null);
      }, 500);
    }, 1100);
  };

  // Reset Demo handler
  const handleResetDemo = () => {
    setMessages([]);
    setCustomInput('');
    setIsTyping(false);
    setConversationStep(0);
    setProcessStage('idle');
    setLiveLead(null);
    setUnreadCount(2);
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2200);
  };

  // Next quick prompt available for customer
  const currentSuggestedPrompt = scenario.prompts[conversationStep] || null;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-lime-400 selection:text-slate-950">
      {/* ========================================================================= */}
      {/* 1. TOP DEMO NAVIGATION BAR & GUIDED CONTROLS */}
      {/* ========================================================================= */}
      <header className="bg-[#0e1422] border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Logo & Brand Identity with Secret PIN Gate on double-click */}
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-start">
            <div
              onDoubleClick={onLogoDoubleClick}
              className="flex items-center space-x-2.5 cursor-pointer group select-none"
              title="Double-click for Owner Controls"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1 group-hover:border-lime-400 transition">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-5 h-5 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight group-hover:text-lime-400 transition">
                    {companyName}
                  </span>
                  <span className="text-[10px] font-mono bg-lime-950/70 text-lime-400 border border-lime-800/60 px-1.5 py-0.2 rounded">
                    DEMO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {industry.name} · LeadMachine Engine
                </span>
              </div>
            </div>

            {/* Mobile View Switcher Shortcut */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={handleResetDemo}
                className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700 font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Guided Demo Flow Step Indicator */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800">
            <span className="font-bold text-lime-400 font-mono tracking-wider text-[11px] uppercase">
              LIVE DEMO
            </span>
            <span className="text-slate-600">·</span>
            <span className={conversationStep >= 1 ? 'text-white font-semibold' : 'text-slate-400'}>
              1. Customer sends enquiry
            </span>
            <span className="text-slate-600">→</span>
            <span className={processStage === 'respond' || conversationStep >= 1 ? 'text-lime-400 font-semibold' : 'text-slate-400'}>
              2. LeadMachine responds
            </span>
            <span className="text-slate-600">→</span>
            <span className={processStage === 'qualify' || conversationStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              3. Lead qualifies on business dashboard
            </span>
          </div>

          {/* Industry Switcher & Actions */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
            {/* Industry Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[10px] uppercase font-mono text-slate-500">Industry:</span>
              <select
                value={currentIndustryId}
                onChange={(e) => onSelectIndustry(e.target.value as IndustryId)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                {Object.values(INDUSTRY_PROFILES).map((ind) => (
                  <option key={ind.id} value={ind.id} className="bg-slate-900 text-white">
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center space-x-1.5 cursor-pointer ${
                resetFeedback
                  ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
              }`}
              title="Reset conversation and clear temporary live lead"
            >
              <span>{resetFeedback ? '✓ Reset Done' : '↻ Reset Demo'}</span>
            </button>

            {/* Explore Full Dashboard */}
            <button
              onClick={onOpenFullDashboard}
              className="px-3 py-1.5 text-xs font-bold bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-lg transition shadow-sm flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Dashboard</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PRIMARY SCREEN LAYOUT — PERMANENT SPLIT-SCREEN EXPERIENCE */}
      {/* LEFT: CUSTOMER | CENTRE: LEADMACHINE PROCESS | RIGHT: BUSINESS */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4 items-stretch overflow-hidden">
        {/* ======================================================================= */}
        {/* LEFT PANEL: CUSTOMER EXPERIENCE */}
        {/* ======================================================================= */}
        <section className="flex-1 bg-[#0c121e] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg min-h-[520px]">
          {/* Panel Header */}
          <div className="bg-[#101726] border-b border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">
                CUSTOMER
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Enquiry Simulator
            </span>
          </div>

          {/* Acquisition Source Selector Bar */}
          <div className="bg-[#0a0f1a] border-b border-slate-800/80 px-3 py-2 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Acquisition Channel
              </span>
              <span className="text-[10px] text-lime-400/90 font-mono font-medium">
                CUSTOMERS CAN COME FROM ANYWHERE
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  'WhatsApp',
                  'Facebook',
                  'Instagram',
                  'TikTok',
                  'Google / Ad',
                  'Link in Bio',
                  'Email'
                ] as AcquisitionSource[]
              ).map((src) => {
                const isActive = source === src;
                return (
                  <button
                    key={src}
                    onClick={() => {
                      setSource(src);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-lime-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {src === 'WhatsApp' ? '💬 WhatsApp (Default)' : src}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer View Body (WhatsApp Chat vs Other Source Link Intake) */}
          {source === 'WhatsApp' ? (
            /* ================================================================= */
            /* WHATSAPP-STYLE CONVERSATION INTERFACE */
            /* ================================================================= */
            <div className="flex-1 flex flex-col bg-[#0b141a] overflow-hidden">
              {/* WhatsApp Chat Header */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center p-1">
                    <img
                      src={logoUrl}
                      alt="Avatar"
                      className="w-5 h-5 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-white leading-tight">
                        {companyName}
                      </span>
                      <span className="text-emerald-400 text-xs" title="LeadMachine Verified Business Account">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono block">
                      online · LeadMachine AI
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                  WhatsApp Direct
                </span>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar text-xs">
                {/* Security and channel context */}
                <div className="text-center my-1">
                  <span className="text-[10px] bg-[#182229] text-slate-400 px-3 py-1 rounded-md border border-slate-800/80 inline-block font-mono">
                    🔒 Messages are end-to-end secured · Powered by LeadMachine 24/7 Intake
                  </span>
                </div>

                {/* Default Greeting from Business */}
                <div className="flex justify-start">
                  <div className="bg-[#202c33] text-slate-200 rounded-lg rounded-tl-none px-3.5 py-2.5 max-w-[85%] border border-slate-700/60 shadow-sm space-y-1">
                    <p className="leading-relaxed">
                      {industry.greetingTemplate.replace('{company}', companyName)}
                    </p>
                    <span className="text-[9px] text-slate-400 block text-right font-mono">
                      Just now
                    </span>
                  </div>
                </div>

                {/* Chat History */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-3.5 py-2.5 max-w-[85%] shadow-sm space-y-1 leading-relaxed ${
                        msg.sender === 'customer'
                          ? 'bg-[#005c4b] text-white rounded-tr-none'
                          : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/60'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-300/80 font-mono">
                        <span>{msg.time}</span>
                        {msg.sender === 'customer' && <span className="text-cyan-300">✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#202c33] text-slate-400 rounded-lg rounded-tl-none px-3 py-2 flex items-center space-x-1.5 border border-slate-700/50">
                      <span className="text-[11px] font-mono text-emerald-400">LeadMachine typing</span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Quick Prompt Pill (if next step available) */}
              {currentSuggestedPrompt && !isTyping && (
                <div className="bg-[#111b21] border-t border-slate-800/80 px-3 py-2 shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono uppercase">Suggested Customer Prompt:</span>
                    <span className="text-lime-400 font-mono">1-Click Fast Test</span>
                  </div>
                  <button
                    onClick={() => handleSendCustomerMessage(currentSuggestedPrompt)}
                    className="w-full text-left bg-[#1f2c34] hover:bg-[#2a3942] border border-slate-700/90 text-slate-200 rounded-lg p-2 text-xs transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate mr-2 font-medium">
                      "{currentSuggestedPrompt}"
                    </span>
                    <span className="text-lime-400 font-bold shrink-0 text-sm group-hover:translate-x-0.5 transition">
                      Send →
                    </span>
                  </button>
                </div>
              )}

              {/* WhatsApp Text Composer (Active Typing Input) */}
              <div className="bg-[#202c33] p-2.5 border-t border-slate-800 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendCustomerMessage();
                  }}
                  placeholder={`Type as a customer for ${companyName}...`}
                  className="flex-1 bg-[#2a3942] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={() => handleSendCustomerMessage()}
                  disabled={!customInput.trim() || isTyping}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black px-3.5 py-2 rounded-lg text-xs transition shadow-sm cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* UNIVERSAL LEADMACHINE LINK / EXTERNAL SOURCE INTAKE EXPERIENCE */
            /* ================================================================= */
            <div className="flex-1 p-4 flex flex-col justify-between bg-[#0a0f1a] overflow-y-auto">
              <div className="space-y-4">
                {/* Source Banner */}
                <div className="bg-[#111928] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">🔗</span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Universal Inbound Link
                      </span>
                      <span className="text-xs font-bold text-white">
                        Arrived via {source}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-lime-950/70 text-lime-400 border border-lime-800/80 px-2 py-0.5 rounded font-mono">
                    LeadMachine Link
                  </span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Instant Intake for {companyName}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Customer taps your link in {source}, submits this frictionless enquiry, and LeadMachine immediately responds and alerts your business dashboard.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono uppercase">Customer Name & Contact</label>
                      <input
                        type="text"
                        readOnly
                        value={`${scenario.customerName} · 082 555 0199`}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono uppercase">Requested Service & Urgency</label>
                      <input
                        type="text"
                        readOnly
                        value={`${scenario.service} (${scenario.suburb}) · Urgent`}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Chat Feed for this channel */}
                {messages.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Live Response Exchange</span>
                    {messages.map((m) => (
                      <div key={m.id} className="text-xs">
                        <span className={`font-bold ${m.sender === 'customer' ? 'text-lime-400' : 'text-slate-300'}`}>
                          {m.sender === 'customer' ? `${scenario.customerName}: ` : 'LeadMachine AI: '}
                        </span>
                        <span className="text-slate-200">{m.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Enquiry Button */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleSendCustomerMessage(scenario.prompts[0])}
                  disabled={isTyping}
                  className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Submit Live Enquiry via {source}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ======================================================================= */}
        {/* CENTRE PANEL: LEADMACHINE ACTIVITY & PROCESS INDICATOR */}
        {/* ENQUIRY → ANALYSE → RESPOND → QUALIFY */}
        {/* ======================================================================= */}
        <section className="w-full lg:w-48 bg-[#0c121e] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-md">
          {/* Header */}
          <div className="border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              CAUSE & EFFECT
            </span>
            <h3 className="text-xs font-extrabold text-white">
              Process Pipeline
            </h3>
          </div>

          {/* Process Stages List */}
          <div className="space-y-4 my-auto py-3">
            {/* 1. ENQUIRY */}
            <div className="flex items-start space-x-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition ${
                processStage === 'enquiry'
                  ? 'bg-lime-400 text-slate-950 ring-2 ring-lime-400/40 ring-offset-2 ring-offset-slate-950'
                  : conversationStep >= 1
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                1
              </div>
              <div>
                <span className={`text-xs font-bold block ${
                  processStage === 'enquiry' || conversationStep >= 1 ? 'text-white' : 'text-slate-500'
                }`}>
                  ENQUIRY
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight font-mono">
                  {source} intake caught
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-3 bg-slate-800 ml-3"></div>

            {/* 2. ANALYSE */}
            <div className="flex items-start space-x-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition ${
                processStage === 'analyse'
                  ? 'bg-lime-400 text-slate-950 ring-2 ring-lime-400/40 ring-offset-2 ring-offset-slate-950'
                  : conversationStep >= 1
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                2
              </div>
              <div>
                <span className={`text-xs font-bold block ${
                  processStage === 'analyse' || conversationStep >= 1 ? 'text-white' : 'text-slate-500'
                }`}>
                  ANALYSE
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight font-mono">
                  Score & intent parsed
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-3 bg-slate-800 ml-3"></div>

            {/* 3. RESPOND */}
            <div className="flex items-start space-x-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition ${
                processStage === 'respond'
                  ? 'bg-lime-400 text-slate-950 ring-2 ring-lime-400/40 ring-offset-2 ring-offset-slate-950'
                  : conversationStep >= 1
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                3
              </div>
              <div>
                <span className={`text-xs font-bold block ${
                  processStage === 'respond' || conversationStep >= 1 ? 'text-white' : 'text-slate-500'
                }`}>
                  RESPOND
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight font-mono">
                  Instant auto-reply
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-3 bg-slate-800 ml-3"></div>

            {/* 4. QUALIFY */}
            <div className="flex items-start space-x-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 transition ${
                processStage === 'qualify' || conversationStep >= 2
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                4
              </div>
              <div>
                <span className={`text-xs font-bold block ${
                  processStage === 'qualify' || conversationStep >= 2 ? 'text-white' : 'text-slate-500'
                }`}>
                  QUALIFY
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight font-mono">
                  Calendar slot secured
                </span>
              </div>
            </div>
          </div>

          {/* Channel Story Box */}
          <div className="bg-[#080d16] border border-slate-800 rounded-xl p-2.5 text-[10px] text-slate-400 space-y-1">
            <span className="text-slate-500 block uppercase font-mono text-[9px]">Channel Story</span>
            <p className="leading-tight text-slate-300">
              WhatsApp, Social, Ads & Link in Bio
            </p>
            <div className="text-center font-bold text-lime-400 text-xs">↓</div>
            <p className="font-bold text-white text-center">
              ONE LEADMACHINE INBOX
            </p>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* RIGHT PANEL: BUSINESS / LEADMACHINE (CONTRACTOR VIEW) */}
        {/* Professional SaaS Product Interface (Stripe/Linear Polish) */}
        {/* ======================================================================= */}
        <section className="flex-1 bg-[#0c121e] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-lg min-h-[520px]">
          {/* Header */}
          <div className="bg-[#101726] border-b border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">
                LEADMACHINE · BUSINESS
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-slate-900 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                Unread: {unreadCount}
              </span>
              <span className="text-[10px] bg-lime-950/60 text-lime-400 border border-lime-800/80 px-2 py-0.5 rounded font-mono">
                Live Feed
              </span>
            </div>
          </div>

          {/* Quick Real-Time KPI Strip */}
          <div className="bg-[#0a0f1a] border-b border-slate-800/80 px-4 py-2 shrink-0 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Avg AI Speed</span>
              <span className="font-mono font-bold text-lime-400 text-xs">42s</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Auto-Intake</span>
              <span className="font-mono font-bold text-white text-xs">100% 24/7</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Pipeline Mode</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">{industry.name}</span>
            </div>
          </div>

          {/* Business Body Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {/* REAL-TIME NEW LEAD CARD */}
            {liveLead ? (
              <div className="bg-[#111928] border-2 border-lime-500/80 rounded-xl p-4 space-y-3 shadow-md animate-fadeIn">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-lime-400 text-slate-950 font-black text-[10px] rounded uppercase tracking-wider">
                        NEW LEAD
                      </span>
                      <h3 className="font-extrabold text-sm text-white">
                        {liveLead.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {liveLead.service} · {liveLead.suburb}
                    </p>
                  </div>

                  {/* Small, Professional Source Badge (No large loud pills) */}
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-lime-400">
                      {liveLead.urgency} · {liveLead.score}/10 {liveLead.source}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                      Status: {liveLead.status}
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-[#090e18] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    AI Intent & Triage Summary
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {liveLead.aiSummary}
                  </p>
                </div>

                {/* Latest Customer Quote / Conversation Snippet */}
                <div className="text-xs bg-[#0e1626] p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-slate-400 text-[10px] font-mono block">Latest Customer Message:</span>
                    <span className="text-slate-200 italic font-sans truncate">"{liveLead.latestSnippet}"</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                    Just now
                  </span>
                </div>

                {/* Suggested Next Action & Auto-Reply Timestamp */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      AI Suggested Action:
                    </span>
                    <span className="font-semibold text-white">
                      {liveLead.suggestedAction}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded shrink-0">
                    {liveLead.autoReplyStatus}
                  </span>
                </div>
              </div>
            ) : (
              /* Empty / Waiting state */
              <div className="border border-dashed border-slate-800 rounded-xl p-5 text-center space-y-2 bg-[#090f1a]/60">
                <span className="text-xl">⚡</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Awaiting Customer Interaction
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Type a message on the left or click "Suggested Customer Prompt" to watch LeadMachine receive, analyse, and qualify the lead here in real time.
                </p>
              </div>
            )}

            {/* RECENT PIPELINE LEADS (Showcases Source Badges across channels) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-200 font-mono uppercase text-[10px]">
                  Recent Inbound Leads
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Multiple Capture Sources
                </span>
              </div>

              {initialLeads.slice(0, 3).map((lead, idx) => {
                const badgeSource =
                  lead.source ||
                  (idx === 0
                    ? 'Instagram'
                    : idx === 1
                    ? 'Facebook Ad'
                    : 'Link in Bio');
                return (
                  <div
                    key={lead.id}
                    className="bg-[#0e1626] border border-slate-800/90 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">
                          {lead.name}
                        </span>
                        <span className="text-[10px] text-slate-400">· {lead.suburb}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {lead.type} · {lead.problem}
                      </p>
                    </div>

                    {/* Source Badge */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                        {lead.urgency} · {lead.score}/10 {badgeSource}
                      </span>
                      <span className="text-[10px] text-lime-400 font-mono block mt-0.5 font-bold">
                        R{lead.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. RESTRAINED FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#090d16] border-t border-slate-800/80 px-4 py-2.5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <span>LeadMachine Demo Factory</span>
          <span>·</span>
          <span>Configured for <strong>{companyName}</strong> ({industry.name})</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenLandingPage}
            className="hover:text-slate-300 underline cursor-pointer text-[11px]"
          >
            View Prospect Landing Page
          </button>
          <span>·</span>
          <button
            onClick={onOpenFullDashboard}
            className="hover:text-lime-400 font-semibold cursor-pointer text-[11px]"
          >
            Open Contractor Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
};
