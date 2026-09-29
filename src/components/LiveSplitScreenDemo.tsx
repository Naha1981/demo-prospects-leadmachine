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
  suggestedAction: string;
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
  onLogoDoubleClick
}) => {
  const industry: IndustryProfile = INDUSTRY_PROFILES[currentIndustryId] || INDUSTRY_PROFILES.roofing;

  // Acquisition source state (WhatsApp default)
  const [source, setSource] = useState<AcquisitionSource>('WhatsApp');

  // Customer conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);

  // Centre process indicator state: idle | enquiry | analyse | respond | qualify
  const [processStage, setProcessStage] = useState<'idle' | 'enquiry' | 'analyse' | 'respond' | 'qualify'>('idle');

  // Business side live lead state
  const [liveLead, setLiveLead] = useState<LiveLeadCardData | null>(null);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Realistic scenario definitions per industry
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
            "Hi Thandi, yes we can help immediately! What street are you on in Rivonia?",
            "We have an emergency master plumber in Rivonia within 35 minutes. Is the water supply isolated?",
            `Master Plumber Jaco V. dispatched to Rivonia Road. ETA 35 minutes.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Confirm plumber dispatch and arrival time",
            "Job scheduled on field calendar"
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
          suggestedActions: [
            "Contact customer immediately",
            "Prepare Chair 1 for acute dental triage at 11:00 AM",
            "Patient confirmed on calendar"
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
            "Understood. We have a licensed electrician open in Sandton by 12:00 PM. Shall we reserve that slot?",
            `Booked! Master Electrician Mandla K. confirmed for 12:00 PM in Sandton.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Allocate DB diagnostic technician",
            "Electrician confirmed for 12:00 PM in Sandton"
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
            `Engineering consultation scheduled for tomorrow at 10:00 AM in Bryanston.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Assign PV engineer for Bryanston site audit",
            "Site audit confirmed on calendar"
          ]
        };
      case 'hvac':
        return {
          customerName: 'Johan K.',
          suburb: 'Centurion',
          service: 'Ducted aircon cooling failure',
          prompts: [
            "Hi, our central cooling stopped blowing cold air and server room is overheating. Can a tech visit today?",
            "Centurion business park. High urgency.",
            "Yes, 11:00 AM is approved."
          ],
          aiReplies: [
            "Hi Johan, we have commercial technicians on standby in Centurion. What is your location?",
            "We have a senior HVAC technician in Centurion within 45 minutes (11:00 AM). Would you like to confirm dispatch?",
            `Dispatched! Senior HVAC Tech Johan V. en route to Centurion business park. ETA 11:00 AM.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Confirm emergency HVAC tech dispatch",
            "Tech on site for diagnostic repair"
          ]
        };
      case 'auto_repair':
        return {
          customerName: 'Marcus B.',
          suburb: 'Randburg',
          service: 'Brake grinding & pad replacement',
          prompts: [
            "Hi, my brakes started grinding loudly on the highway this morning. Can I bring my car in today?",
            "2021 Toyota Hilux. I am in Randburg right now.",
            "Yes, arriving at 10:30 AM."
          ],
          aiReplies: [
            "Hi Marcus, safety first — please drive carefully! What make and model is your vehicle?",
            "We have Bay 2 open for diagnostic brake inspection at 10:30 AM today in Randburg. Shall we book your bay?",
            `Bay 2 reserved for Marcus B. (Toyota Hilux) at 10:30 AM in Randburg.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Hold Bay 2 for 10:30 AM arrival",
            "Vehicle intake logged in workshop"
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
            `Crew Alpha confirmed for Thursday at 08:30 AM in Midrand! Booking details sent to your phone.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Lock in Crew Alpha for Midrand Thursday schedule",
            "Crew booked with steam extraction equipment"
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
            `Chair 3 reserved for Anika with Master Colourist Mandy at 02:30 PM today.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Reserve Chair 3 for 2.5 hour colour service",
            "Appointment confirmed in salon schedule"
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
          suggestedActions: [
            "Contact customer immediately",
            "Prepare examination room for 11:15 AM arrival",
            "Appointment confirmed in medical schedule"
          ]
        };
      case 'roofing':
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
            "Got it. We've flagged this as urgent (Hot). Would 11:30 AM today suit for our senior inspector?",
            `Inspection confirmed for 11:30 AM today in Fourways! Senior Inspector Jaco V. will arrive at your address.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Allocate Fourways senior inspector",
            "Inspection confirmed on field schedule"
          ]
        };
      case 'general':
      default:
        return {
          customerName: 'Alex K.',
          suburb: 'Sandton',
          service: 'Priority service inquiry & consultation quote',
          prompts: [
            "Hi, I'm looking for a quote and consultation for your services. Can someone assist me today?",
            "We are based in Sandton. Could someone do an assessment tomorrow?",
            "Yes please, tomorrow at 10:00 AM works."
          ],
          aiReplies: [
            "Hi Alex, thank you for reaching out! We can assist right away. What specific service do you require?",
            "Understood. We can have a specialist on site in Sandton tomorrow at 10:00 AM. Does that time suit you?",
            `Confirmed! Consultation scheduled for tomorrow at 10:00 AM with our team.`
          ],
          suggestedActions: [
            "Contact customer immediately",
            "Allocate specialist for on-site assessment",
            "Consultation confirmed on schedule"
          ]
        };
    }
  };

  const scenario = getScenarioDefaults();

  // Scroll internal conversation container to bottom whenever messages update
  // Fixed bottom anchor ensures conversation automatically scrolls to the newest message without scrolling the page
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      const frame = requestAnimationFrame(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTo({
            top: messageContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [messages, isTyping]);

  // Handle sending a customer message
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

    // Step 1: Enquiry received
    setProcessStage('enquiry');

    const nextStep = conversationStep + 1;
    setConversationStep(nextStep);

    // Business side immediately transitions from WAITING to NEW LEAD
    const actionIndex = Math.min(nextStep - 1, scenario.suggestedActions.length - 1);
    setLiveLead({
      name: scenario.customerName,
      source: source,
      service: scenario.service,
      suburb: scenario.suburb,
      urgency: 'HOT',
      suggestedAction: scenario.suggestedActions[actionIndex] || 'Contact customer immediately',
      latestSnippet: text
    });

    // Step 2: Lead understood (after brief processing)
    setTimeout(() => {
      setProcessStage('analyse');
    }, 350);

    // Step 3: Response sent (simulated automated reply)
    setIsTyping(true);
    setTimeout(() => {
      setProcessStage('respond');
      const replyText =
        scenario.aiReplies[conversationStep] ||
        `Thank you for reaching out to ${companyName}! We have received your enquiry and our team is ready to assist.`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'leadmachine',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      // Step 4: Lead qualified
      setTimeout(() => {
        setProcessStage('qualify');
      }, 400);
    }, 1000);
  };

  // Reset Demo handler
  const handleResetDemo = () => {
    setMessages([]);
    setCustomInput('');
    setIsTyping(false);
    setConversationStep(0);
    setProcessStage('idle');
    setLiveLead(null);
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 0;
    }
  };

  const currentSuggestedPrompt = scenario.prompts[conversationStep] || null;

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans lg:overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: COMPACT FIXED-HEIGHT APPLICATION HEADER                       */}
      {/* ========================================================================= */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Brand & Secret PIN Gate on double-click */}
          <div
            onDoubleClick={onLogoDoubleClick}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
            title="Double-click for Owner Controls"
          >
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center p-1 text-white shrink-0 font-bold text-xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-4 h-4 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                'LM'
              )}
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                LeadMachine
              </span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">
                Demo Factory
              </span>
            </div>
          </div>

          {/* Industry Selector & Clean Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label htmlFor="industry-select" className="text-xs font-semibold text-slate-600">
                Industry:
              </label>
              <select
                id="industry-select"
                value={currentIndustryId}
                onChange={(e) => onSelectIndustry(e.target.value as IndustryId)}
                className="text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded px-2 py-1 focus:outline-none focus:border-slate-500 cursor-pointer shadow-xs"
              >
                {Object.values(INDUSTRY_PROFILES).map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetDemo}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition cursor-pointer"
            >
              Reset Demo
            </button>

            {/* Link to Full Dashboard */}
            <button
              onClick={onOpenFullDashboard}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border-l border-slate-200 pl-3 transition cursor-pointer"
            >
              Full Dashboard →
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THE THREE-PANEL CORE DEMO (FITS AVAILABLE VIEWPORT HEIGHT)              */}
      {/* CUSTOMER (LEFT) → LEADMACHINE (CENTRE) → YOUR BUSINESS (RIGHT)             */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch lg:overflow-hidden">
        {/* ======================================================================= */}
        {/* LEFT: CUSTOMER (WhatsApp-Style Chat Experience)                         */}
        {/* ======================================================================= */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-xs">
          {/* Main Panel Heading (Preserving 3-Panel Enterprise Structure) */}
          <div className="shrink-0 border-b border-slate-200 px-4 py-2.5 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                CUSTOMER
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Customer enquiry
              </p>
            </div>
            {/* Quiet Channel Indicator (WhatsApp Default) */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">Via:</span>
              <span className="inline-flex items-center space-x-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.541 1.948.824 2.796.825h.005c3.185 0 5.77-2.586 5.77-5.767 0-1.542-.601-2.991-1.692-4.081-1.09-1.09-2.541-1.69-4.083-1.69zm3.328 8.163c-.144.405-.838.774-1.171.825-.315.048-.718.077-2.315-.584-1.916-.795-3.149-2.738-3.245-2.866-.096-.128-.775-1.031-.775-1.965 0-.935.488-1.394.662-1.583.174-.189.379-.236.505-.236.126 0 .252.002.361.008.115.006.269-.044.421.323.157.379.537 1.309.584 1.405.047.096.079.208.016.333-.063.125-.094.204-.188.314-.094.11-.197.246-.282.33-.094.095-.192.198-.083.385.109.187.485.8 1.042 1.295.717.639 1.32.837 1.508.932.188.094.298.079.408-.047.11-.126.471-.55.597-.738.125-.189.251-.157.424-.094.173.063 1.099.518 1.288.613.189.094.315.142.362.221.047.079.047.457-.097.862z"/>
                </svg>
                <span>WhatsApp</span>
              </span>
            </div>
          </div>

          {/* Familiar WhatsApp Conversation Header */}
          <div className="shrink-0 bg-slate-100/90 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {/* Business Avatar */}
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {companyName.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[170px] sm:max-w-[210px]">
                    {companyName}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]" title="Verified Business">
                    ✓
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>online</span>
                </div>
              </div>
            </div>

            {/* Subtle WhatsApp-style action icons */}
            <div className="flex items-center space-x-2.5 text-slate-400">
              <svg className="w-4 h-4 cursor-pointer hover:text-slate-600 transition" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.9 14.3l2.8 2.8c.4.4.4 1 0 1.4l-1.4 1.4c-.8.8-2 .9-2.9.4-2.8-1.5-5.2-3.9-6.7-6.7-.5-.9-.4-2.1.4-2.9l1.4-1.4c.4-.4 1-.4 1.4 0l2.8 2.8c.4.4.4 1 0 1.4l-.8.8c-.2.2-.2.5 0 .7.8 1.4 1.9 2.5 3.3 3.3.2.2.5.2.7 0l.8-.8c.4-.5 1-.5 1.4-.1z"/>
              </svg>
              <svg className="w-4 h-4 cursor-pointer hover:text-slate-600 transition" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          </div>

          {/* Authentic WhatsApp Chat Background & Internal Scroll Area */}
          <div
            ref={messageContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar bg-[#efeae2]/75"
            style={{
              backgroundImage: `radial-gradient(#00000008 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          >
            {/* Friendly WhatsApp Day Divider */}
            <div className="flex justify-center my-1">
              <span className="bg-white/90 text-slate-500 font-medium text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs uppercase tracking-wider">
                Today
              </span>
            </div>

            {/* When no messages yet: subtle prompt reminder */}
            {messages.length === 0 && (
              <div className="flex justify-center py-4">
                <div className="bg-amber-50/95 border border-amber-200/80 rounded-lg p-2.5 text-center max-w-[90%] shadow-2xs space-y-1">
                  <p className="text-[11px] text-amber-900 font-medium">
                    🔒 Messages are end-to-end encrypted. Tap the suggested enquiry below to start the live demonstration.
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp Message Thread */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative p-2.5 px-3 max-w-[84%] text-xs shadow-2xs transition-all ${
                    msg.sender === 'customer'
                      ? 'bg-white text-slate-900 rounded-2xl rounded-tr-xs border border-slate-100'
                      : 'bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {/* Sender label on incoming business response */}
                  {msg.sender === 'leadmachine' && (
                    <span className="text-[10px] font-bold text-[#008069] block mb-0.5 tracking-tight">
                      {companyName}
                    </span>
                  )}

                  {/* Message body */}
                  <p className="leading-relaxed font-normal text-[12.5px] pr-12 pb-1">
                    {msg.text}
                  </p>

                  {/* Timestamp & WhatsApp Status Ticks */}
                  <div className="absolute bottom-1.5 right-2 flex items-center space-x-1 text-[10px] text-slate-400 select-none">
                    <span>{msg.time}</span>
                    {msg.sender === 'customer' && (
                      <span className="text-[#53bdeb] font-bold text-[11px]" title="Read">
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* WhatsApp-Style Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tl-xs px-3 py-2 text-xs flex items-center space-x-2 shadow-2xs">
                  <span className="text-[11px] text-emerald-800 font-medium">typing</span>
                  <span className="inline-flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Fixed Bottom Anchor */}
            <div ref={messagesEndRef} className="h-0 w-full shrink-0" aria-hidden="true" />
          </div>

          {/* WhatsApp Message Composer (Pinned at bottom of column) */}
          <div className="shrink-0 bg-[#f0f2f5] border-t border-slate-200 p-2.5 space-y-2">
            {/* Quick 1-Tap Suggested Customer Enquiry */}
            {currentSuggestedPrompt && !isTyping && (
              <button
                onClick={() => handleSendCustomerMessage(currentSuggestedPrompt)}
                className="w-full text-left bg-white hover:bg-emerald-50/70 border border-slate-300/80 rounded-lg px-3 py-1.5 text-xs transition cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="truncate mr-2">
                  <span className="text-[10px] font-bold text-[#008069] uppercase tracking-wider block">
                    Suggested Enquiry:
                  </span>
                  <span className="text-slate-800 font-medium truncate block text-[11.5px]">
                    "{currentSuggestedPrompt}"
                  </span>
                </div>
                <span className="text-[#008069] font-bold text-xs shrink-0 bg-emerald-50 group-hover:bg-[#00a884] group-hover:text-white border border-emerald-200 px-2.5 py-1 rounded transition">
                  Send →
                </span>
              </button>
            )}

            {/* WhatsApp Composer Bar */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 border border-slate-200 flex items-center space-x-2 shadow-2xs focus-within:border-emerald-500">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendCustomerMessage();
                  }}
                  placeholder="Type a message..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* WhatsApp Green Circular Send Button */}
              <button
                onClick={() => handleSendCustomerMessage()}
                disabled={!customInput.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition active:scale-95 cursor-pointer"
                title="Send"
              >
                <svg className="w-4 h-4 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* CENTRE: LEADMACHINE (Process Pipeline)                                  */}
        {/* ======================================================================= */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full min-h-0 overflow-hidden shadow-xs">
          {/* Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200 pb-3 text-center">
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              LEADMACHINE
            </h1>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              What happens to the enquiry
            </p>
          </div>

          {/* Four Simple Sequential Steps */}
          <div className="space-y-3.5 my-auto py-3">
            {/* Step 1: Enquiry received */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  conversationStep >= 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {conversationStep >= 1 ? '✓' : '1'}
              </div>
              <span
                className={`text-xs font-bold ${
                  conversationStep >= 1 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                1. Enquiry received
              </span>
            </div>

            {/* Connecting line */}
            <div className="w-0.5 h-3 bg-slate-200 ml-3"></div>

            {/* Step 2: Lead understood */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  processStage === 'analyse' || processStage === 'respond' || processStage === 'qualify' || conversationStep >= 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {processStage === 'analyse' || processStage === 'respond' || processStage === 'qualify' || conversationStep >= 1
                  ? '✓'
                  : '2'}
              </div>
              <span
                className={`text-xs font-bold ${
                  processStage === 'analyse' || processStage === 'respond' || processStage === 'qualify' || conversationStep >= 1
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                2. Lead understood
              </span>
            </div>

            {/* Connecting line */}
            <div className="w-0.5 h-3 bg-slate-200 ml-3"></div>

            {/* Step 3: Response sent */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  processStage === 'respond' || processStage === 'qualify' || (conversationStep >= 1 && !isTyping)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {processStage === 'respond' || processStage === 'qualify' || (conversationStep >= 1 && !isTyping)
                  ? '✓'
                  : '3'}
              </div>
              <span
                className={`text-xs font-bold ${
                  processStage === 'respond' || processStage === 'qualify' || (conversationStep >= 1 && !isTyping)
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                3. Response sent
              </span>
            </div>

            {/* Connecting line */}
            <div className="w-0.5 h-3 bg-slate-200 ml-3"></div>

            {/* Step 4: Lead qualified */}
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  processStage === 'qualify' || conversationStep >= 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {processStage === 'qualify' || conversationStep >= 2 ? '✓' : '4'}
              </div>
              <span
                className={`text-xs font-bold ${
                  processStage === 'qualify' || conversationStep >= 2
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}
              >
                4. Lead qualified
              </span>
            </div>
          </div>

          <div className="shrink-0 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-medium">
            Automated intake
          </div>
        </section>

        {/* ======================================================================= */}
        {/* RIGHT: YOUR BUSINESS                                                    */}
        {/* ======================================================================= */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl flex flex-col h-full min-h-0 overflow-hidden shadow-xs">
          {/* Header (shrink-0) */}
          <div className="shrink-0 border-b border-slate-200 px-5 py-2.5 bg-slate-50/50">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              YOUR BUSINESS
            </h1>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">
              {companyName}
            </h2>
          </div>

          {/* Business Body Area (flex-1 min-h-0 overflow-y-auto custom-scrollbar) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-center custom-scrollbar">
            {!liveLead ? (
              /* ================================================================= */
              /* STATE 1: WAITING FOR CUSTOMER                                     */
              /* ================================================================= */
              <div className="border border-red-200 bg-red-50/60 rounded-xl p-6 text-center space-y-2.5">
                <div className="inline-flex items-center justify-center space-x-2 text-red-700 font-bold text-base tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span>WAITING FOR CUSTOMER</span>
                </div>
                <p className="text-sm font-semibold text-red-800">
                  Send a customer enquiry to start the demonstration.
                </p>
                <p className="text-xs text-slate-500 pt-0.5 max-w-sm mx-auto">
                  Click the suggested enquiry on the left or type your own message to see your business receive the lead.
                </p>
              </div>
            ) : (
              /* ================================================================= */
              /* STATE 2: NEW LEAD RESULT                                          */
              /* ================================================================= */
              <div className="space-y-4 animate-fadeIn">
                {/* Status indicator: Customer Enquiry Received */}
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>CUSTOMER ENQUIRY RECEIVED</span>
                  <span className="text-slate-400 font-normal">·</span>
                  <span className="text-slate-500 font-normal">via {liveLead.source}</span>
                </div>

                {/* Primary Lead Presentation */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    NEW LEAD
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {liveLead.name}
                    </h3>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {liveLead.urgency}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {liveLead.service} <span className="text-slate-400 font-normal">({liveLead.suburb})</span>
                  </p>
                </div>

                {/* Customer Message Quote */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CUSTOMER MESSAGE
                  </span>
                  <blockquote className="text-xs text-slate-800 font-medium italic bg-slate-50 border border-slate-200 rounded-lg p-3">
                    "{liveLead.latestSnippet}"
                  </blockquote>
                </div>

                {/* Next Action */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    NEXT ACTION
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {liveLead.suggestedAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER: COMPACT FIXED-HEIGHT FOOTER                                    */}
      {/* ========================================================================= */}
      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-30">
        <div>
          LeadMachine Demo Factory · Configured for <strong>{companyName}</strong> ({industry.name})
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenLandingPage}
            className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
          >
            View Prospect Landing Page
          </button>
          <span>·</span>
          <button
            onClick={onOpenFullDashboard}
            className="text-slate-900 font-semibold hover:underline cursor-pointer"
          >
            Open Contractor Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
};
