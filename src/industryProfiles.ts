export type IndustryId =
  | 'roofing'
  | 'dentistry'
  | 'plumbing'
  | 'electrical'
  | 'solar'
  | 'hvac'
  | 'auto_repair'
  | 'general';

export interface ScriptStep {
  id: number;
  type: 'ai' | 'user';
  text: string;
  action?: string;
  isUpload?: boolean;
  isFinal?: boolean;
}

export interface DemoLead {
  id: number;
  name: string;
  suburb: string;
  type: string;
  urgency: 'HOT' | 'WARM' | 'LOW';
  value: number;
  score: number;
  status: string;
  time: string;
  phone: string;
  email: string;
  property: string;
  roof: string; // or specific detail
  problem: string;
  aiSummary: string;
}

export interface DemoFollowup {
  id: number;
  lead: string;
  stage: string;
  message: string;
  nextAction: string;
  status: string;
}

export interface DemoBooking {
  id: number;
  customer: string;
  suburb: string;
  date: string;
  time: string;
  team: string;
  value: string;
  status: string;
  type: string;
}

export interface IndustryBenchmark {
  avgResponseTime: string;
  industryAvgResponse: string;
  monthlyEnquiryVolume: string;
  afterHoursEnquiryShare: string;
  avgDealValue: string;
  conversionLift: string;
  missedCallRate: string;
  keyPitchPoint: string;
}

export interface IndustryProfile {
  id: IndustryId;
  name: string;
  category: string;
  services: string[];
  commonProblems: string[];
  qualificationQuestions: string[];
  urgencyRules: {
    hot: string;
    warm: string;
    low: string;
  };
  leadScoringRules: string;
  conversionEvent: string;
  leadTypeLabel: string;
  bookingLabel: string;
  bookingActionLabel: string;
  valueLabel: string;
  teamLabel: string;
  serviceAreaLabel: string;
  bookingModalTitle: string;
  greetingTemplate: string;
  brandSuffix: string;
  heroLead: DemoLead;
  sampleLeads: DemoLead[];
  sampleFollowups: DemoFollowup[];
  sampleBookings: DemoBooking[];
  benchmarks: IndustryBenchmark;
  getScript: (companyName: string, greeting: string) => ScriptStep[];
}

export const INDUSTRY_PROFILES: Record<IndustryId, IndustryProfile> = {
  roofing: {
    id: 'roofing',
    name: 'Roofing',
    category: 'Building & Waterproofing',
    services: ['Tile Replacement', 'Waterproofing', 'Emergency Leak Repair', 'Full Roof Replacement', 'Gutter Repair'],
    commonProblems: ['Water leaking through ceiling', 'Missing tiles after storm', 'Sagging roof trusses', 'Rusted valley iron'],
    qualificationQuestions: ['Is the roof leak active?', 'What suburb are you in?', 'Property and roof type?', 'Photo of the leak?'],
    urgencyRules: {
      hot: 'Active leak, flooding, storm damage, structural sag',
      warm: 'Waterproofing, flashing reseal, quote request',
      low: 'Routine maintenance, gutter cleaning, future quotes'
    },
    leadScoringRules: 'Active rain leaks and structural sagging receive 85-95 score for immediate dispatch.',
    conversionEvent: 'BOOK INSPECTION',
    leadTypeLabel: 'Roofing Enquiries',
    bookingLabel: 'Inspections',
    bookingActionLabel: 'Book Inspection',
    valueLabel: 'Est. Repair Value',
    teamLabel: 'Assigned Inspector',
    serviceAreaLabel: 'Suburbs Covered',
    bookingModalTitle: 'Schedule Roof Inspection',
    greetingTemplate: "Welcome to {company}. Need a roof repair or inspection? Tell us what is happening and we'll help you get the right person out quickly.",
    brandSuffix: 'RoofLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Fourways",
      type: "Active Roof Leak",
      urgency: "HOT",
      value: 28500,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "House",
      roof: "Tile",
      problem: "Water dripping into main bedroom ceiling after rain storm.",
      aiSummary: "HOT LEAD: Active water leak in Fourways. Qualified for priority inspection. Photo verified."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Roof Leak", urgency: "WARM", value: 15000, score: 75, status: "Contacted", time: "2 hours ago", phone: "082 123 4567", email: "thabo@example.com", property: "House", roof: "Tile", problem: "Missing tiles after strong wind.", aiSummary: "Standard tile replacement needed. Responsive customer." },
      { id: 2, name: "Lerato Modise", suburb: "Midrand", type: "Full Replacement", urgency: "LOW", value: 85000, score: 45, status: "New", time: "3 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "Commercial", roof: "IBR", problem: "Looking for quotes for next quarter.", aiSummary: "Long-term prospect. Automated email nurture sequence." },
      { id: 3, name: "David Smit", suburb: "Centurion", type: "Sagging Roof", urgency: "HOT", value: 42000, score: 88, status: "Inspection Booked", time: "Yesterday", phone: "083 444 5555", email: "dsmit@webmail.co.za", property: "House", roof: "Thatch", problem: "Main beam looks bent.", aiSummary: "Structural concern. Priority inspection scheduled." },
      { id: 4, name: "Aisha Patel", suburb: "Rosebank", type: "Waterproofing", urgency: "WARM", value: 12500, score: 68, status: "Qualified", time: "Yesterday", phone: "060 111 2222", email: "aisha.p@company.co.za", property: "Apartment", roof: "Flat", problem: "Damp spots on ceiling.", aiSummary: "Classic flat roof waterproofing candidate." },
      { id: 5, name: "Sipho Zulu", suburb: "Randburg", type: "Storm Damage", urgency: "HOT", value: 34000, score: 91, status: "Inspection Booked", time: "2 days ago", phone: "073 222 3344", email: "sipho@zulu.co.za", property: "House", roof: "Tile", problem: "Tree branch punctured roof tile.", aiSummary: "Urgent storm damage repair." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "5-min follow-up", message: "Hi Thabo, following up on your roof leak enquiry in Sandton. Did you manage to contain the water?", nextAction: "Send SMS reminder", status: "Completed" },
      { id: 2, lead: "Lerato Modise", stage: "24-hour follow-up", message: "Hi Lerato, checking in regarding your commercial roof quote estimate.", nextAction: "Automated Email Sent", status: "Pending" },
      { id: 3, lead: "David Smit", stage: "Inspection Reminder", message: "Hi David, your roof inspection is confirmed for tomorrow at 10:00 AM.", nextAction: "WhatsApp Reminder", status: "Scheduled" }
    ],
    sampleBookings: [
      { id: 1, customer: "David Smit", suburb: "Centurion", date: "2026-03-29", time: "10:00 AM", team: "Jaco V. (Senior Inspector)", value: "R42,000", status: "Confirmed", type: "Sagging Roof" },
      { id: 2, customer: "Sipho Zulu", suburb: "Randburg", date: "2026-03-29", time: "02:00 PM", team: "Mandla K. (Lead Tech)", value: "R34,000", status: "Confirmed", type: "Storm Damage" }
    ],
    benchmarks: {
      avgResponseTime: "42 seconds",
      industryAvgResponse: "4.2 hours",
      monthlyEnquiryVolume: "65 – 120 leads / mo",
      afterHoursEnquiryShare: "38% (storm & evening leaks)",
      avgDealValue: "R28,500 – R85,000",
      conversionLift: "+34% booked inspections",
      missedCallRate: "31% unanswered during storm surges",
      keyPitchPoint: "Homeowners with active leaks contact multiple contractors at once; the first contractor to confirm an inspection slot wins over 70% of high-ticket re-roofing and waterproofing deals."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. Need a roof repair or inspection?` },
      { id: 1, type: 'user', text: "Hi, we've got water coming through the ceiling in our main bedroom after last night's rain. Can someone come out?", action: "Send message" },
      { id: 2, type: 'ai', text: "Sorry to hear that! I can help get this assessed right away. Is the roof leak happening right now?" },
      { id: 3, type: 'user', text: "Yes, it's active right now.", action: "Yes, it's active" },
      { id: 4, type: 'ai', text: "Thanks for confirming. What suburb are you located in?" },
      { id: 5, type: 'user', text: "Fourways", action: "Enter Suburb: Fourways" },
      { id: 6, type: 'ai', text: "Got it. Is this a house, townhouse, commercial property, or apartment?" },
      { id: 7, type: 'user', text: "It's a standalone house with tiled roof.", action: "Select: House (Tiled)" },
      { id: 8, type: 'ai', text: "Do you have a photo of the ceiling or roof leak area? It helps our inspection team prepare." },
      { id: 9, type: 'user', text: "[Photo Uploaded: ceiling_leak_fourways.jpg]", action: "Upload Ceiling Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thanks! What is the best phone number for our team to contact you on?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "Perfect. When would you like an inspector to assess the damage? We have a team nearby in Fourways today." },
      { id: 13, type: 'user', text: "As soon as possible please.", action: "Request Immediate Inspection" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your enquiry for ${companyName} has been prioritised as HOT (Score 94/100). Our senior inspection team has received your details and photo.`, isFinal: true }
    ]
  },

  dentistry: {
    id: 'dentistry',
    name: 'Dentistry',
    category: 'Healthcare & Dental Practice',
    services: ['Emergency Dental', 'Cosmetic Dentistry', 'Root Canal Therapy', 'Teeth Whitening', 'Dental Implants', 'Routine Cleaning'],
    commonProblems: ['Severe toothache', 'Swollen jaw / abscess', 'Chipped or broken tooth', 'Lost crown', 'Bleeding gums'],
    qualificationQuestions: ['Are you experiencing acute pain or swelling?', 'What treatment do you need?', 'Are you an existing or new patient?', 'Preferred appointment time?'],
    urgencyRules: {
      hot: 'Severe throbbing pain, facial swelling, broken front tooth, knocked-out tooth',
      warm: 'Chipped molar, cosmetic smile makeover, lost filling',
      low: 'Routine 6-month checkup, teeth cleaning, general enquiry'
    },
    leadScoringRules: 'Severe dental pain and swelling score 92-98 for priority same-day chair placement.',
    conversionEvent: 'BOOK APPOINTMENT',
    leadTypeLabel: 'Dental Enquiries',
    bookingLabel: 'Appointments',
    bookingActionLabel: 'Book Appointment',
    valueLabel: 'Est. Treatment Value',
    teamLabel: 'Assigned Dentist / Specialist',
    serviceAreaLabel: 'Practice Locations',
    bookingModalTitle: 'Schedule Dental Appointment',
    greetingTemplate: "Welcome to {company}. How can we help your smile today? Tell us what you are experiencing and we will book you in.",
    brandSuffix: 'DentalLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Sandton",
      type: "Severe Tooth Pain",
      urgency: "HOT",
      value: 4500,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "Private Patient",
      roof: "Upper Molar",
      problem: "Severe throbbing tooth pain with noticeable facial swelling.",
      aiSummary: "HOT PATIENT: Acute dental pain & facial swelling. Allocated emergency same-day chair."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Rosebank", type: "Broken Molar", urgency: "HOT", value: 3800, score: 92, status: "Appointment Booked", time: "1 hour ago", phone: "082 123 4567", email: "thabo@example.com", property: "Discovery Health", roof: "Lower Premolar", problem: "Molar cracked during lunch. Nerve exposed.", aiSummary: "Emergency root canal assessment booked." },
      { id: 2, name: "Lerato Modise", suburb: "Sandton", type: "Smile Makeover", urgency: "WARM", value: 32000, score: 70, status: "Contacted", time: "3 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "Private", roof: "Veneers / Whitening", problem: "Interested in porcelain veneers consultation.", aiSummary: "High-value cosmetic inquiry. Consultation scheduled." },
      { id: 3, name: "David Smit", suburb: "Fourways", type: "Tooth Extraction", urgency: "HOT", value: 2900, score: 89, status: "Appointment Booked", time: "Yesterday", phone: "083 444 5555", email: "dsmit@webmail.co.za", property: "Momentum", roof: "Wisdom Tooth", problem: "Impacted wisdom tooth inflammation.", aiSummary: "Prescription and extraction session booked." },
      { id: 4, name: "Aisha Patel", suburb: "Midrand", type: "Routine Checkup", urgency: "LOW", value: 1200, score: 45, status: "New", time: "Yesterday", phone: "060 111 2222", email: "aisha.p@company.co.za", property: "Discovery", roof: "Routine Hygiene", problem: "Annual scale and polish.", aiSummary: "Routine preventative appointment." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Immediate SMS", message: "Hi Thabo, your emergency chair is reserved for 2:30 PM with Dr. Jaco.", nextAction: "Send WhatsApp Confirmation", status: "Completed" },
      { id: 2, lead: "Lerato Modise", stage: "24-hour follow-up", message: "Hi Lerato, here is our cosmetic smile makeover catalog and consultation slots.", nextAction: "Send Email Proposal", status: "Pending" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Rosebank", date: "2026-03-29", time: "02:30 PM", team: "Dr. Jaco V. (Principal Dentist)", value: "R3,800", status: "Confirmed", type: "Emergency Root Canal" },
      { id: 2, customer: "David Smit", suburb: "Fourways", date: "2026-03-30", time: "11:00 AM", team: "Dr. Mandla K. (Oral Surgeon)", value: "R2,900", status: "Confirmed", type: "Wisdom Tooth" }
    ],
    benchmarks: {
      avgResponseTime: "28 seconds",
      industryAvgResponse: "Next business day",
      monthlyEnquiryVolume: "140 – 260 enquiries / mo",
      afterHoursEnquiryShare: "47% (evening toothaches & weekends)",
      avgDealValue: "R4,200 – R35,000",
      conversionLift: "+41% chair occupancy",
      missedCallRate: "42% unanswered while staff treat patients",
      keyPitchPoint: "Patients with acute dental pain rarely leave voicemails. Instant 24/7 AI qualification secures emergency bookings and high-margin cosmetic consultations on first contact."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. How can we help with your dental health today?` },
      { id: 1, type: 'user', text: "Hi, I have severe throbbing pain in my upper molar and my jaw is starting to swell. Can someone see me today?", action: "Send message" },
      { id: 2, type: 'ai', text: "I'm so sorry you're in pain! Is the pain continuous, and are you having trouble sleeping or eating?" },
      { id: 3, type: 'user', text: "Yes, it's continuous and throbbing right now.", action: "Yes, acute pain" },
      { id: 4, type: 'ai', text: "Understood. Which suburb or practice location is most convenient for you?" },
      { id: 5, type: 'user', text: "Sandton", action: "Enter Suburb: Sandton" },
      { id: 6, type: 'ai', text: "Are you an existing patient or will this be your first appointment with us?" },
      { id: 7, type: 'user', text: "First-time patient with Discovery Health medical aid.", action: "First-time patient (Medical Aid)" },
      { id: 8, type: 'ai', text: "Do you have a photo or can you point to where the swelling is located?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: molar_swelling_sandton.jpg]", action: "Upload Symptom Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thank you. What is the best cell number for our reception team to confirm your chair time?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an emergency appointment slot open at 2:30 PM today with our lead dental practitioner. Shall we reserve it?" },
      { id: 13, type: 'user', text: "Yes please, book that slot.", action: "Book Emergency Appointment" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your appointment at ${companyName} has been prioritised as HOT (Score 94/100). Our practice has reserved your emergency slot.`, isFinal: true }
    ]
  },

  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    category: 'Plumbing & Drainage',
    services: ['Burst Pipe Repairs', 'Blocked Drains & Jetting', 'Geyser Replacement', 'Leak Detection', 'Bathroom Renovations'],
    commonProblems: ['Burst geyser flooding ceiling', 'Raw sewage backup', 'No hot water', 'Dripping tap', 'Low mains water pressure'],
    qualificationQuestions: ['Is water actively gushing or flooding?', 'Have you closed the main stopcock?', 'What property type?', 'Suburb?'],
    urgencyRules: {
      hot: 'Burst pipe, geyser burst flooding, active sewer backup',
      warm: 'Blocked toilet, geyser thermostat fault, pipe damp patch',
      low: 'Tap washer replacement, bathroom quote, water filter service'
    },
    leadScoringRules: 'Active flooding triggers emergency dispatch score 90-96.',
    conversionEvent: 'BOOK CALLOUT',
    leadTypeLabel: 'Plumbing Enquiries',
    bookingLabel: 'Callouts',
    bookingActionLabel: 'Book Callout',
    valueLabel: 'Est. Job Value',
    teamLabel: 'Assigned Plumber',
    serviceAreaLabel: 'Service Radius',
    bookingModalTitle: 'Schedule Plumbing Callout',
    greetingTemplate: "Welcome to {company}. Plumbing emergency or looking for a quote? Tell us what is happening.",
    brandSuffix: 'PlumbLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Fourways",
      type: "Burst Pipe Flooding",
      urgency: "HOT",
      value: 8500,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "House",
      roof: "Underfloor Copper Pipe",
      problem: "Water gushing from ruptured main pipe under kitchen floor.",
      aiSummary: "HOT CALLOUT: Active flooding in Fourways. Plumber dispatched with pipe freezing kit."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Geyser Burst", urgency: "HOT", value: 14500, score: 95, status: "Callout Booked", time: "45 mins ago", phone: "082 123 4567", email: "thabo@example.com", property: "Townhouse", roof: "Solar Geyser 200L", problem: "Geyser burst in ceiling space, water dripping down wall.", aiSummary: "Urgent geyser replacement." },
      { id: 2, name: "Lerato Modise", suburb: "Midrand", type: "Blocked Sewer", urgency: "WARM", value: 3200, score: 72, status: "Contacted", time: "2 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "Commercial", roof: "External Drain", problem: "Main driveway gully overflowing.", aiSummary: "High-pressure drain jetting needed." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Immediate Dispatch", message: "Hi Thabo, plumber Jaco is en route to Sandton with a 200L replacement geyser.", nextAction: "Track Van Location", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-29", time: "11:30 AM", team: "Jaco V. (Master Plumber)", value: "R14,500", status: "Confirmed", type: "Burst Geyser" }
    ],
    benchmarks: {
      avgResponseTime: "35 seconds",
      industryAvgResponse: "2.8 hours",
      monthlyEnquiryVolume: "110 – 210 callouts / mo",
      afterHoursEnquiryShare: "52% (burst geysers & night leaks)",
      avgDealValue: "R5,500 – R26,000",
      conversionLift: "+48% emergency callouts",
      missedCallRate: "39% calls missed while plumbers are under sinks",
      keyPitchPoint: "Burst pipes and cold geysers require immediate triage. Automated AI intake confirms van dispatch on first contact before callers ring a competing plumber."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. How can we assist with your plumbing today?` },
      { id: 1, type: 'user', text: "Hi! A pipe just burst in my kitchen and water is flooding across the tiles! Can someone come out?", action: "Send message" },
      { id: 2, type: 'ai', text: "Oh no! Please turn off your main water stopcock immediately. Is the water still gushing?" },
      { id: 3, type: 'user', text: "Yes, I managed to shut the valve, but water is everywhere.", action: "Water shut off, flooding present" },
      { id: 4, type: 'ai', text: "Well done shutting the valve. What suburb are you in so we can assign our nearest van?" },
      { id: 5, type: 'user', text: "Fourways", action: "Enter Suburb: Fourways" },
      { id: 6, type: 'ai', text: "Is this a house, townhouse, or apartment complex?" },
      { id: 7, type: 'user', text: "Standalone house.", action: "Standalone House" },
      { id: 8, type: 'ai', text: "Do you have a photo of where the pipe ruptured or the water damage?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: burst_kitchen_pipe.jpg]", action: "Upload Damage Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Got it! Best cell number for our technician to call you upon arrival?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an emergency vehicle 15 minutes away in Fourways. Shall we dispatch our plumber immediately?" },
      { id: 13, type: 'user', text: "Yes, please dispatch now!", action: "Request Immediate Callout" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your emergency callout for ${companyName} has been prioritised as HOT (Score 94/100). Our on-call plumber is rolling.`, isFinal: true }
    ]
  },

  electrical: {
    id: 'electrical',
    name: 'Electrical',
    category: 'Electrical Contractors',
    services: ['Emergency Power Restoration', 'DB Board Upgrades', 'Certificate of Compliance (COC)', 'Fault Finding', 'Generator & Inverter Connections'],
    commonProblems: ['Main breaker tripping', 'Burning smell from plug', 'Sparking light switch', 'Complete house blackout', 'Geyser electrical trip'],
    qualificationQuestions: ['Is there sparking or a burning smell?', 'Is power completely off?', 'Residential or commercial?', 'Location?'],
    urgencyRules: {
      hot: 'Sparking DB board, burning electrical smell, complete power loss',
      warm: 'Tripping circuit, plug point installation, COC inspection',
      low: 'Light fitting replacement, scheduled garden lighting quote'
    },
    leadScoringRules: 'Electrical safety hazards and burning smells score 95+ for instant emergency visit.',
    conversionEvent: 'BOOK ELECTRICIAN',
    leadTypeLabel: 'Electrical Enquiries',
    bookingLabel: 'Site Visits',
    bookingActionLabel: 'Book Electrician',
    valueLabel: 'Est. Job Value',
    teamLabel: 'Assigned Electrician',
    serviceAreaLabel: 'Service Radius',
    bookingModalTitle: 'Schedule Electrician Visit',
    greetingTemplate: "Welcome to {company}. Electrical fault or new installation? Tell us what you need help with.",
    brandSuffix: 'SparkLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Midrand",
      type: "Sparking DB Board",
      urgency: "HOT",
      value: 6200,
      score: 95,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "House",
      roof: "Single Phase DB",
      problem: "Main earth leakage tripping continuously with faint burning smell at DB board.",
      aiSummary: "HOT ELECTRICAL HAZARD: Earth leakage fault & burning odor. Certified wireman dispatched."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Power Blackout", urgency: "HOT", value: 4500, score: 92, status: "Site Visit Booked", time: "1 hour ago", phone: "082 123 4567", email: "thabo@example.com", property: "Townhouse", roof: "3-Phase", problem: "Two phases dropped out, lights flickering.", aiSummary: "Phase imbalance check required." },
      { id: 2, name: "Lerato Modise", suburb: "Centurion", type: "COC Certificate", urgency: "WARM", value: 3500, score: 70, status: "Contacted", time: "3 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "House", roof: "Full Property", problem: "Selling property, need electrical COC inspection.", aiSummary: "Standard compliance inspection." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Safety Warning", message: "Hi Thabo, please leave the main breaker turned off until our electrician arrives.", nextAction: "Safety SMS Dispatched", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-29", time: "01:00 PM", team: "Mandla K. (Master Electrician)", value: "R4,500", status: "Confirmed", type: "Power Fault" }
    ],
    benchmarks: {
      avgResponseTime: "30 seconds",
      industryAvgResponse: "3.5 hours",
      monthlyEnquiryVolume: "85 – 175 tickets / mo",
      afterHoursEnquiryShare: "41% (power trips & evening outages)",
      avgDealValue: "R6,800 – R32,000",
      conversionLift: "+36% scheduled callouts",
      missedCallRate: "35% missed during active installations",
      keyPitchPoint: "Tripping DB boards and burning plastic smells trigger immediate panic. AI instantly triages safety risks and books qualified wiremen with zero hold time."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. How can our licensed electricians assist today?` },
      { id: 1, type: 'user', text: "Hi, our main circuit breaker keeps tripping loudly and there is a burning plastic smell from the box!", action: "Send message" },
      { id: 2, type: 'ai', text: "Please do not touch the distribution board! Is there any active smoke or flame?" },
      { id: 3, type: 'user', text: "No visible flames, but strong burning smell and the breaker is warm.", action: "No flame, but burning smell" },
      { id: 4, type: 'ai', text: "Understood. Please keep the main switch OFF. What suburb is the property located in?" },
      { id: 5, type: 'user', text: "Midrand", action: "Enter Suburb: Midrand" },
      { id: 6, type: 'ai', text: "Is this a residential home or a business premise?" },
      { id: 7, type: 'user', text: "Residential house.", action: "Residential House" },
      { id: 8, type: 'ai', text: "Can you safely take a photo of the front of the electrical panel?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: db_board_midrand.jpg]", action: "Upload DB Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Received. Best contact number for the wireman to reach you immediately?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an emergency registered electrician in Midrand who can arrive within 30 minutes. Confirm booking?" },
      { id: 13, type: 'user', text: "Yes please, book the electrician.", action: "Book Electrician Now" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your urgent fault for ${companyName} has been prioritised as HOT (Score 95/100). A licensed electrician is on the way.`, isFinal: true }
    ]
  },

  solar: {
    id: 'solar',
    name: 'Solar',
    category: 'Renewable Solar & Storage',
    services: ['Hybrid Solar Systems', 'Off-Grid Systems', 'Lithium Battery Storage', 'Commercial Solar PV', 'System Maintenance & COC'],
    commonProblems: ['Load shedding protection needed', 'High Eskom electricity bills', 'Existing inverter fault', 'Battery capacity expansion'],
    qualificationQuestions: ['Average monthly electricity bill?', 'Residential or commercial?', 'Roof type (Tile/IBR/Concrete)?', 'Consultation time?'],
    urgencyRules: {
      hot: 'System failure, business backup urgent, immediate readiness to buy',
      warm: 'Home solar quote, monthly bill over R3,500, battery upgrade',
      low: 'General curiosity, rental property inquiry'
    },
    leadScoringRules: 'High monthly power bills with tile/IBR roofs score 80-92 for high-ticket project sales.',
    conversionEvent: 'BOOK SOLAR CONSULTATION',
    leadTypeLabel: 'Solar Enquiries',
    bookingLabel: 'Consultations',
    bookingActionLabel: 'Book Consultation',
    valueLabel: 'Est. Project Value',
    teamLabel: 'Assigned Solar Specialist',
    serviceAreaLabel: 'Service Radius',
    bookingModalTitle: 'Schedule Solar Consultation',
    greetingTemplate: "Welcome to {company}. Ready to beat load shedding and lower your power bill? Tell us about your home or business.",
    brandSuffix: 'SolarLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Centurion",
      type: "8kW Hybrid Solar Package",
      urgency: "HOT",
      value: 125000,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "House",
      roof: "North-Facing Tile",
      problem: "Monthly electricity bill R4,200. Seeking 8kW hybrid inverter with 10kWh lithium battery.",
      aiSummary: "HOT SOLAR OPPORTUNITY: High power bill in Centurion, ideal roof azimuth. Ready for site audit."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "12kW Commercial Solar", urgency: "HOT", value: 240000, score: 96, status: "Consultation Booked", time: "2 hours ago", phone: "082 123 4567", email: "thabo@example.com", property: "Office Park", roof: "IBR Sheeting", problem: "Need 99% uptime for medical practice server room.", aiSummary: "Commercial backup system. Site survey booked." },
      { id: 2, name: "Lerato Modise", suburb: "Fourways", type: "5kW Starter Solar", urgency: "WARM", value: 75000, score: 78, status: "Contacted", time: "4 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "Townhouse", roof: "Tile", problem: "Bill R2,800/month. Wants essential load backup.", aiSummary: "Standard 5kW hybrid package proposal sent." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Audit Preparation", message: "Hi Thabo, our solar engineer has pulled satellite azimuth maps for your Sandton property.", nextAction: "Send Roof Layout Plan", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-30", time: "09:30 AM", team: "Jaco V. (Senior Solar Engineer)", value: "R240,000", status: "Confirmed", type: "Commercial Solar Audit" }
    ],
    benchmarks: {
      avgResponseTime: "45 seconds",
      industryAvgResponse: "24 – 48 hours",
      monthlyEnquiryVolume: "70 – 150 leads / mo",
      afterHoursEnquiryShare: "44% (evening utility bill reviews)",
      avgDealValue: "R95,000 – R260,000",
      conversionLift: "+29% site audit bookings",
      missedCallRate: "28% abandon complex quote calculators",
      keyPitchPoint: "High-ticket solar buyers evaluate system sizes while reviewing utility bills after 7 PM; instant ROI qualification and bill intake prevents lead abandonment before competitors respond."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. Looking to transition to clean, reliable solar energy?` },
      { id: 1, type: 'user', text: "Hi! Our electricity bill has hit R4,500 and we want to install an 8kW solar system with batteries before winter.", action: "Send message" },
      { id: 2, type: 'ai', text: "Great decision! What is your main priority: completely eliminating load shedding, saving money, or both?" },
      { id: 3, type: 'user', text: "Both! We want uninterrupted power and lower monthly municipal bills.", action: "Both backup & bill savings" },
      { id: 4, type: 'ai', text: "Perfect. What suburb is your property located in?" },
      { id: 5, type: 'user', text: "Centurion", action: "Enter Suburb: Centurion" },
      { id: 6, type: 'ai', text: "What type of roof do you have (e.g. Tile, Corrugated IBR, Klip-Lok, Concrete slab)?" },
      { id: 7, type: 'user', text: "Standard concrete tile roof with north-facing exposure.", action: "North-Facing Tile" },
      { id: 8, type: 'ai', text: "Can you upload a photo of your latest electricity bill or roofline?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: power_bill_centurion.jpg]", action: "Upload Bill/Roof Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thank you! What is the best cell number for our technical solar advisor?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We can schedule a free engineering site consultation tomorrow at 10:00 AM. Shall we reserve that for you?" },
      { id: 13, type: 'user', text: "Yes, book the solar consultation.", action: "Book Solar Consultation" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your solar consultation for ${companyName} has been prioritised as HOT (Score 94/100). Our senior engineer will meet you on site.`, isFinal: true }
    ]
  },

  hvac: {
    id: 'hvac',
    name: 'HVAC / Air Conditioning',
    category: 'HVAC & Climate Control',
    services: ['Air Conditioning Repairs', 'New AC Installations', 'Commercial Chiller Maintenance', 'Refrigerant Regas', 'Duct Cleaning'],
    commonProblems: ['AC blowing warm air in summer', 'Water leaking from indoor unit', 'Loud compressor screeching', 'Thermostat unresponsive', 'Server room AC failure'],
    qualificationQuestions: ['Is the cooling system completely down?', 'Is this for a home or commercial building?', 'Unit brand/type?', 'Location?'],
    urgencyRules: {
      hot: 'Server room AC failure, complete business cooling loss during heatwave, indoor unit gushing water',
      warm: 'Unit blowing lukewarm air, annual servicing, quote for new split unit',
      low: 'Filter replacement, seasonal checkup'
    },
    leadScoringRules: 'Commercial outages and water leaking units score 88-95.',
    conversionEvent: 'BOOK SERVICE VISIT',
    leadTypeLabel: 'HVAC Enquiries',
    bookingLabel: 'Service Visits',
    bookingActionLabel: 'Book Service Visit',
    valueLabel: 'Est. Job Value',
    teamLabel: 'Assigned HVAC Tech',
    serviceAreaLabel: 'Service Radius',
    bookingModalTitle: 'Schedule HVAC Service Visit',
    greetingTemplate: "Welcome to {company}. Air conditioner not cooling or need a new installation? Let us know.",
    brandSuffix: 'HVACLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Rosebank",
      type: "AC Water Leak & Cooling Failure",
      urgency: "HOT",
      value: 18500,
      score: 93,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "Townhouse",
      roof: "Daikin Inverter 18000 BTU",
      problem: "Main split unit leaking water down drywall and blowing warm air.",
      aiSummary: "HOT HVAC CALLOUT: Condensate drain blocked and gas leak in Rosebank. Tech dispatched."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Server Room Cooling", urgency: "HOT", value: 45000, score: 98, status: "Service Visit Booked", time: "30 mins ago", phone: "082 123 4567", email: "thabo@example.com", property: "Commercial", roof: "24000 BTU Cassette", problem: "Server room temperatures rising past 30°C.", aiSummary: "Critical server room emergency callout." },
      { id: 2, name: "Lerato Modise", suburb: "Midrand", type: "New AC Installation", urgency: "WARM", value: 16500, score: 75, status: "Contacted", time: "3 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "House", roof: "Samsung Inverter", problem: "Looking to install 12000 BTU unit in master bedroom.", aiSummary: "Standard installation quotation." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Immediate Dispatch", message: "Hi Thabo, HVAC technician Mandla is equipped with R410A refrigerant and spare fan motors.", nextAction: "Confirm ETA on Site", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-29", time: "12:00 PM", team: "Mandla K. (HVAC Specialist)", value: "R45,000", status: "Confirmed", type: "Server Room Chiller" }
    ],
    benchmarks: {
      avgResponseTime: "38 seconds",
      industryAvgResponse: "3.1 hours",
      monthlyEnquiryVolume: "90 – 190 requests / mo",
      afterHoursEnquiryShare: "36% (heatwaves & winter cold snaps)",
      avgDealValue: "R8,500 – R45,000",
      conversionLift: "+39% technician bookings",
      missedCallRate: "46% missed calls during peak weather surges",
      keyPitchPoint: "During seasonal temperature spikes, inbound enquiry volume surges 400%. AI intake triages capacity and captures high-margin commercial chiller and split AC installs."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. How can our air conditioning specialists help?` },
      { id: 1, type: 'user', text: "Hi, our main aircon in the lounge is blowing warm air and water is dripping down the wall!", action: "Send message" },
      { id: 2, type: 'ai', text: "We can help fix that quickly. Is the indoor unit currently switched off to prevent drywall damage?" },
      { id: 3, type: 'user', text: "Yes, I turned it off at the isolator switch.", action: "Unit turned off" },
      { id: 4, type: 'ai', text: "What suburb is the property located in?" },
      { id: 5, type: 'user', text: "Rosebank", action: "Enter Suburb: Rosebank" },
      { id: 6, type: 'ai', text: "Do you know the approximate brand or unit capacity (e.g. Daikin, Samsung, 12k or 18k BTU)?" },
      { id: 7, type: 'user', text: "It's a Daikin 18000 BTU inverter unit.", action: "Daikin Inverter 18k BTU" },
      { id: 8, type: 'ai', text: "Could you snap a quick photo of the indoor unit or any error lights?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: daikin_leak_rosebank.jpg]", action: "Upload AC Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thank you. Best phone number for our lead technician to reach you?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an HVAC diagnostic slot available today at 1:30 PM. Would you like to confirm that?" },
      { id: 13, type: 'user', text: "Yes, please confirm the service visit.", action: "Book Service Visit" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your service visit for ${companyName} has been prioritised as HOT (Score 93/100). Our technician will arrive equipped to clear and regas.`, isFinal: true }
    ]
  },

  auto_repair: {
    id: 'auto_repair',
    name: 'Auto Repair',
    category: 'Automotive Repair & Workshop',
    services: ['Major & Minor Vehicle Servicing', 'Brake Pad & Disc Replacement', 'Clutch & Gearbox Repairs', 'Engine Diagnostics', 'Panel Beating & Spray Painting'],
    commonProblems: ['Brake grinding noise', 'Check engine light on', 'Overheating radiator', 'Accident dent repair', 'No start / dead battery'],
    qualificationQuestions: ['Vehicle make, model & year?', 'Is the vehicle safe to drive?', 'Accident damage or mechanical fault?', 'Location?'],
    urgencyRules: {
      hot: 'Car broken down on road, heavy brake failure, severe overheating',
      warm: 'Check engine light, scheduled major service, clutch slipping',
      low: 'Minor scratch repair, routine oil change'
    },
    leadScoringRules: 'Brake failures and non-drivable vehicles score 90-95 for priority workshop bay allocation.',
    conversionEvent: 'BOOK VEHICLE ASSESSMENT',
    leadTypeLabel: 'Vehicle Enquiries',
    bookingLabel: 'Assessments',
    bookingActionLabel: 'Book Assessment',
    valueLabel: 'Est. Repair Value',
    teamLabel: 'Assigned Mechanic / Estimator',
    serviceAreaLabel: 'Workshop Location',
    bookingModalTitle: 'Schedule Vehicle Assessment',
    greetingTemplate: "Welcome to {company}. Mechanical trouble, warning lights, or accident repair? Tell us your vehicle details.",
    brandSuffix: 'AutoLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Kempton Park",
      type: "Brake Grinding & Vibration",
      urgency: "HOT",
      value: 14500,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "Toyota Hilux 2.8 GD-6",
      roof: "Front & Rear Brakes",
      problem: "Severe metal-on-metal grinding when braking, vehicle pulling to the left.",
      aiSummary: "HOT SAFETY RISK: Severe brake pad and disc wear. Vehicle bay pre-booked for caliper assessment."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Clutch Failure", urgency: "HOT", value: 18000, score: 92, status: "Assessment Booked", time: "1 hour ago", phone: "082 123 4567", email: "thabo@example.com", property: "VW Golf 7 GTI", roof: "DSG Transmission", problem: "Gears slipping and transmission fault warning on dash.", aiSummary: "Diagnostic scanner bay reserved." },
      { id: 2, name: "Lerato Modise", suburb: "Boksburg", type: "Major 90,000km Service", urgency: "WARM", value: 6500, score: 70, status: "Contacted", time: "3 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "Ford Ranger 2.2", roof: "Full Service", problem: "Scheduled major logbook service.", aiSummary: "Service quote sent." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "Tow Truck Check", message: "Hi Thabo, do you need our flatbed recovery truck to transport your vehicle to the workshop?", nextAction: "Check Recovery Need", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-30", time: "08:30 AM", team: "Jaco V. (Master Mechanic)", value: "R18,000", status: "Confirmed", type: "Clutch & Flywheel" }
    ],
    benchmarks: {
      avgResponseTime: "32 seconds",
      industryAvgResponse: "4.6 hours",
      monthlyEnquiryVolume: "120 – 240 inquiries / mo",
      afterHoursEnquiryShare: "39% (commute breakdowns & warnings)",
      avgDealValue: "R4,800 – R38,000",
      conversionLift: "+43% workshop bay bookings",
      missedCallRate: "37% missed while mechanics are under hoods",
      keyPitchPoint: "Drivers with warning lights or brake noises demand fast reassurance. AI captures vehicle make, model and symptoms, booking them into open bays before other shops can respond."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. What vehicle issue can our workshop assist with today?` },
      { id: 1, type: 'user', text: "Hi, my 2021 Toyota Hilux has metal-on-metal grinding sound when I brake and the steering vibrates!", action: "Send message" },
      { id: 2, type: 'ai', text: "That sounds like worn brake pads and discs. Is the vehicle still drivable, or do you feel it's unsafe?" },
      { id: 3, type: 'user', text: "It's drivable at low speed, but feels unsafe on highways.", action: "Unsafe for highway driving" },
      { id: 4, type: 'ai', text: "Understood, safety first. What suburb or area are you located in?" },
      { id: 5, type: 'user', text: "Kempton Park", action: "Enter Area: Kempton Park" },
      { id: 6, type: 'ai', text: "Is this a diesel or petrol Hilux, and roughly what mileage is on the odometer?" },
      { id: 7, type: 'user', text: "2.8 GD-6 Diesel, approximately 85,000 km.", action: "2.8 GD-6 Diesel (85,000 km)" },
      { id: 8, type: 'ai', text: "Can you take a photo of the wheel / brake disc or dashboard lights?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: hilux_brake_disc.jpg]", action: "Upload Brake Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thank you. Best cell number for our service advisor to contact you?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an open inspection bay at 9:00 AM tomorrow morning. Shall we reserve that for your Hilux?" },
      { id: 13, type: 'user', text: "Yes, please book the vehicle assessment.", action: "Book Vehicle Assessment" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your booking for ${companyName} has been prioritised as HOT (Score 94/100). Our senior workshop technician has your bay reserved.`, isFinal: true }
    ]
  },

  general: {
    id: 'general',
    name: 'General Service Business',
    category: 'Professional & Trade Services',
    services: ['On-Site Consultation', 'Emergency Callouts', 'Repair & Maintenance', 'Custom Quotes', 'Project Delivery'],
    commonProblems: ['Urgent repair required', 'Inspection needed for quote', 'System malfunction', 'Scheduled maintenance'],
    qualificationQuestions: ['What service do you need?', 'How urgent is the requirement?', 'Where are you located?', 'Preferred appointment time?'],
    urgencyRules: {
      hot: 'Urgent breakdown, immediate safety risk, critical deadline',
      warm: 'Standard project request, quote review, renovation',
      low: 'General information, future planning'
    },
    leadScoringRules: 'Urgent service requests score 85-94 for prioritized team review.',
    conversionEvent: 'BOOK CONSULTATION / SERVICE',
    leadTypeLabel: 'Service Enquiries',
    bookingLabel: 'Consultations',
    bookingActionLabel: 'Book Consultation',
    valueLabel: 'Est. Job Value',
    teamLabel: 'Assigned Specialist',
    serviceAreaLabel: 'Service Areas',
    bookingModalTitle: 'Schedule Consultation / Service',
    greetingTemplate: "Welcome to {company}. How can we assist you with our services today? Tell us what you need.",
    brandSuffix: 'ServiceLead AI',
    heroLead: {
      id: 999,
      name: "Sarah Mokoena",
      suburb: "Fourways",
      type: "Urgent Service Request",
      urgency: "HOT",
      value: 12500,
      score: 94,
      status: "Qualified",
      time: "Just Now",
      phone: "082 555 0199",
      email: "sarah.mokoena@gmail.com",
      property: "Residential Property",
      roof: "Standard Service",
      problem: "Urgent on-site assistance needed for priority maintenance issue.",
      aiSummary: "HOT ENQUIRY: Urgent service request in Fourways. Priority specialist consultation reserved."
    },
    sampleLeads: [
      { id: 1, name: "Thabo Nkosi", suburb: "Sandton", type: "Site Assessment", urgency: "WARM", value: 16000, score: 78, status: "Contacted", time: "2 hours ago", phone: "082 123 4567", email: "thabo@example.com", property: "Commercial", roof: "Full Site", problem: "Requires professional assessment and quote.", aiSummary: "Consultation booked for site inspection." },
      { id: 2, name: "Lerato Modise", suburb: "Midrand", type: "Standard Package", urgency: "LOW", value: 8500, score: 50, status: "New", time: "4 hours ago", phone: "071 987 6543", email: "lerato.m@email.com", property: "House", roof: "Standard", problem: "Requesting pricing for upcoming project.", aiSummary: "Automated nurture quote sent." }
    ],
    sampleFollowups: [
      { id: 1, lead: "Thabo Nkosi", stage: "5-min follow-up", message: "Hi Thabo, following up on your service enquiry in Sandton.", nextAction: "Send WhatsApp Confirmation", status: "Completed" }
    ],
    sampleBookings: [
      { id: 1, customer: "Thabo Nkosi", suburb: "Sandton", date: "2026-03-30", time: "10:00 AM", team: "Jaco V. (Senior Specialist)", value: "R16,000", status: "Confirmed", type: "Site Assessment" }
    ],
    benchmarks: {
      avgResponseTime: "40 seconds",
      industryAvgResponse: "5.1 hours",
      monthlyEnquiryVolume: "80 – 180 enquiries / mo",
      afterHoursEnquiryShare: "42% outside standard office hours",
      avgDealValue: "R7,500 – R45,000",
      conversionLift: "+35% booked consultations",
      missedCallRate: "34% of after-hours web leads go cold",
      keyPitchPoint: "Over 40% of inbound web enquiries arrive when office phones are unstaffed. 24/7 automated intake captures and books high-intent buyers immediately before they leave for competitors."
    },
    getScript: (companyName, greeting) => [
      { id: 0, type: 'ai', text: greeting || `Welcome to ${companyName}. How can our team assist you today?` },
      { id: 1, type: 'user', text: "Hi, I have an urgent issue at my property and need an experienced team to come take a look!", action: "Send message" },
      { id: 2, type: 'ai', text: "We can help you get this resolved! How urgent is the situation right now?" },
      { id: 3, type: 'user', text: "It's an active issue and we need someone today if possible.", action: "Active issue - needed today" },
      { id: 4, type: 'ai', text: "Understood. What suburb or location are you in?" },
      { id: 5, type: 'user', text: "Fourways", action: "Enter Suburb: Fourways" },
      { id: 6, type: 'ai', text: "Is this for a residential home or a commercial property?" },
      { id: 7, type: 'user', text: "Residential home.", action: "Residential Home" },
      { id: 8, type: 'ai', text: "Do you have any photos or documents detailing the issue?" },
      { id: 9, type: 'user', text: "[Photo Uploaded: site_issue_fourways.jpg]", action: "Upload Site Photo", isUpload: true },
      { id: 10, type: 'ai', text: "Thank you. Best contact number for our team to call you?" },
      { id: 11, type: 'user', text: "082 555 0199", action: "Enter Phone: 082 555 0199" },
      { id: 12, type: 'ai', text: "We have an on-site specialist available today in Fourways. Would you like to schedule an assessment?" },
      { id: 13, type: 'user', text: "Yes please, book the consultation.", action: "Book Consultation / Service" },
      { id: 14, type: 'ai', text: `Thanks Sarah — your enquiry for ${companyName} has been prioritised as HOT (Score 94/100). Our senior specialist has received your details.`, isFinal: true }
    ]
  }
};

export function detectIndustryFromUrl(url: string, rawName: string): { industryId: IndustryId; confidence: 'High' | 'Medium' | 'Low' } {
  const combined = (url + ' ' + rawName).toLowerCase();

  if (/roof|roofing|roofcover|thatch|tiling|tile roof|gutter|waterproof/i.test(combined)) {
    return { industryId: 'roofing', confidence: 'High' };
  }
  if (/dental|dentist|dentistry|dentalcare|tooth|teeth|smile|ortho/i.test(combined)) {
    return { industryId: 'dentistry', confidence: 'High' };
  }
  if (/plumb|plumbing|plumber|drain|pipe|geyser|leak/i.test(combined)) {
    return { industryId: 'plumbing', confidence: 'High' };
  }
  if (/electric|electrical|electrician|power|wiring|spark|generator/i.test(combined)) {
    return { industryId: 'electrical', confidence: 'High' };
  }
  if (/solar|solarenergy|photovoltaic|sunpower|inverter|battery/i.test(combined)) {
    return { industryId: 'solar', confidence: 'High' };
  }
  if (/hvac|aircon|air-conditioning|airconditioning|cooling|ventilation|climate|fridge|refrigeration/i.test(combined)) {
    return { industryId: 'hvac', confidence: 'High' };
  }
  if (/auto|automotive|mechanic|motors|motor|panelbeater|carrepair|garage|brakes|tyres|tires|transmission/i.test(combined)) {
    return { industryId: 'auto_repair', confidence: 'High' };
  }

  return { industryId: 'general', confidence: 'Low' };
}
