import { useEffect, useMemo, useState } from "react";
import { getProspect, prospects, Prospect } from "./prospects";

const solutionLabels: Record<string,string> = {
  "Lead Machine": "Lead recovery & qualification",
  "Flavourly": "Restaurant revenue intelligence",
  "CargoIQ / ImpactTrace": "Evidence & dispute intelligence",
  "AI Employee": "Operational AI employee",
  "Control Centre": "Executive operational control"
};

function money(v:number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(v);
}

function track(prospect: Prospect, eventType: string, extra: Record<string, unknown> = {}) {
  const params = new URLSearchParams(window.location.search);
  const payload = {
    event_type: eventType,
    tracking_id: prospect.trackingCode,
    prospect_id: prospect.id,
    company: prospect.company,
    product: prospect.solution,
    source: params.get("utm_source") || "nahalabs",
    medium: params.get("utm_medium") || "direct",
    campaign: params.get("utm_campaign") || "prospect-outreach-2026-10",
    ...extra
  };
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function Pill({children, tone="neutral"}:{children:React.ReactNode;tone?:string}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function LeadMachine({p}:{p:Prospect}) {
  const [step,setStep] = useState(0);
  const stages = ["New enquiry","Clarify intent","Qualify","Next action"];
  const score = [58,72,88,94][step];
  const intent = ["Needs triage","High purchase intent","Quote-ready signal","Ready for human follow-up"][step];
  const next = ["Ask two fast questions","Confirm scope and urgency","Route to the right person","Book / quote / follow up"][step];
  return <section className="workspace">
    <div className="panel hero-panel">
      <div className="eyebrow">LEAD MACHINE · DEMO</div>
      <h2>{p.company}</h2>
      <p className="muted">{p.businessProblem}</p>
      <div className="signal-grid">
        <div><span>Lead score</span><strong>{score}</strong><small>/ 100</small></div>
        <div><span>Intent</span><strong>{intent}</strong></div>
        <div><span>Urgency</span><strong>{step >= 2 ? "High" : "Medium"}</strong></div>
        <div><span>Next action</span><strong>{next}</strong></div>
      </div>
    </div>
    <div className="two-col">
      <div className="panel">
        <div className="section-title">Simulated enquiry</div>
        <div className="message-bubble">
          <div className="message-head">Demo customer · synthetic data</div>
          <p>{p.painSignal}</p>
          <div className="chip-row">
            <Pill>Service: {p.industry.split("/")[0].trim()}</Pill>
            <Pill>Channel: WhatsApp</Pill>
            <Pill tone="warning">{step < 2 ? "Missing detail" : "Qualified"}</Pill>
          </div>
        </div>
        <div className="stepper">
          {stages.map((s,i)=><button key={s} onClick={()=>{setStep(i);track(p,"key_action",{action:"lead_stage",stage:s});}} className={`step ${i===step?"active":""}`}><span>{i+1}</span>{s}</button>)}
        </div>
      </div>
      <div className="panel">
        <div className="section-title">Qualification checklist</div>
        {[
          ["Customer intent", step>=1 ? "Captured" : "Open", step>=1],
          ["Scope / location", step>=1 ? "Captured" : "Missing", step>=1],
          ["Urgency", step>=2 ? "Confirmed" : "Needs confirmation", step>=2],
          ["Human handoff", step>=3 ? "Prepared" : "Pending", step>=3]
        ].map(([label,status,ok])=><div className="check-row" key={String(label)}><span>{label}</span><strong className={ok?"ok":""}>{status}</strong></div>)}
        <button className="primary" onClick={()=>{setStep(Math.min(3,step+1));track(p,"key_action",{action:"advance_lead"});}}>{step<3?"Advance enquiry":"Prepare follow-up"}</button>
      </div>
    </div>
  </section>;
}

function Flavourly({p}:{p:Prospect}) {
  const [ran,setRan] = useState(false);
  const [selected,setSelected] = useState(0);
  const leaks = [
    ["Abandoned orders", money(14800), "8 high-intent carts need recovery"],
    ["Repeat-customer gap", money(9200), "Recent diners not re-engaged"],
    ["Promotion drift", money(5600), "Low-margin promo mix needs review"]
  ];
  return <section className="workspace">
    <div className="panel hero-panel">
      <div className="eyebrow">FLAVOURLY · DEMO</div>
      <h2>{p.company}</h2>
      <p className="muted">{p.businessProblem}</p>
      <div className="metric-grid">
        <div><span>Demo revenue at risk</span><strong>{money(29600)}</strong><small>Synthetic estimate</small></div>
        <div><span>Orders needing action</span><strong>23</strong><small>Demo sample</small></div>
        <div><span>Repeat opportunity</span><strong>11</strong><small>Customers</small></div>
        <div><span>Priority</span><strong>Today</strong><small>Retention window</small></div>
      </div>
    </div>
    <div className="two-col">
      <div className="panel">
        <div className="section-title">Revenue leaks</div>
        {leaks.map((l,i)=><button key={l[0]} onClick={()=>{setSelected(i);track(p,"key_action",{action:"select_leak",leak:l[0]});}} className={`list-row ${selected===i?"selected":""}`}><div><strong>{l[0]}</strong><span>{l[2]}</span></div><b>{l[1]}</b></button>)}
      </div>
      <div className="panel">
        <div className="section-title">Recommended action</div>
        <div className="action-card">
          <Pill tone="success">WhatsApp re-engagement</Pill>
          <h3>{leaks[selected][0]}</h3>
          <p>Send a focused recovery message to the highest-intent segment, then hand qualified replies into the restaurant workflow.</p>
          <button className="primary" onClick={()=>{setRan(true);track(p,"key_action",{action:"run_reengagement",segment:leaks[selected][0]});}}>{ran?"Demo action prepared":"Prepare action"}</button>
          {ran && <div className="notice">Demo workflow prepared. No message has been sent.</div>}
        </div>
      </div>
    </div>
  </section>;
}

function EvidenceRoom({p}:{p:Prospect}) {
  const [summary,setSummary] = useState(false);
  const timeline = [
    ["09:14","Operational signal","An exception is recorded in the demo case."],
    ["10:02","External evidence","A supporting timestamp is attached to the case."],
    ["11:26","Contradiction","The evidence sequence does not fully agree."],
    ["12:08","Decision point","A human review is required before closure."]
  ];
  const evidence = [
    ["Internal record","Operational log","High"],
    ["External source","Timestamped reference","Medium"],
    ["Document","Synthetic case document","Medium"],
    ["Derived finding","Sequence comparison","Review"]
  ];
  return <section className="workspace">
    <div className="panel hero-panel">
      <div className="eyebrow">EVIDENCE ROOM · DEMO</div>
      <h2>{p.company}</h2>
      <p className="muted">{p.businessProblem}</p>
      <div className="case-banner">
        <div><span>CASE</span><strong>{p.trackingCode.slice(0,8).toUpperCase()} · Demo exception</strong></div>
        <Pill tone="warning">Human review recommended</Pill>
      </div>
    </div>
    <div className="three-col">
      <div className="panel span-2">
        <div className="section-title">Chronological evidence</div>
        <div className="timeline">
          {timeline.map(([time,title,desc])=><div className="timeline-row" key={time}><div className="time">{time}</div><div><strong>{title}</strong><p>{desc}</p></div></div>)}
        </div>
      </div>
      <div className="panel">
        <div className="section-title">Decision signal</div>
        <div className="big-number">82<span>%</span></div>
        <p className="muted">Evidence confidence, synthetic demo</p>
        <div className="meter"><span style={{width:"82%"}} /></div>
        <div className="stat-line"><span>Gaps</span><b>2</b></div>
        <div className="stat-line"><span>Contradictions</span><b>1</b></div>
        <div className="stat-line"><span>Impact</span><b>Material</b></div>
      </div>
    </div>
    <div className="panel">
      <div className="section-title">Evidence register</div>
      <div className="evidence-grid">
        {evidence.map(([a,b,c])=><div key={a} className="evidence-card"><div><span>{a}</span><strong>{b}</strong></div><Pill tone={c==="High"?"success":c==="Review"?"warning":"neutral"}>{c}</Pill></div>)}
      </div>
      <div className="actions">
        <button className="primary" onClick={()=>{setSummary(true);track(p,"key_action",{action:"generate_evidence_summary"});}}>{summary?"Evidence summary prepared":"Prepare evidence summary"}</button>
        <span className="muted tiny">All case data shown here is synthetic demonstration data.</span>
      </div>
    </div>
  </section>;
}

function AIEmployee({p}:{p:Prospect}) {
  const [run,setRun] = useState(false);
  const steps = [
    ["1","Incoming task","Request received"],
    ["2","Extraction","Key fields identified"],
    ["3","AI action","Workflow prepared"],
    ["4","Escalation","Human review if required"],
    ["5","Completion","Audit record created"]
  ];
  return <section className="workspace">
    <div className="panel hero-panel">
      <div className="eyebrow">AI EMPLOYEE · DEMO</div>
      <h2>{p.company}</h2>
      <p className="muted">A narrow AI employee for: {p.businessProblem}</p>
      <div className="employee-card">
        <div className="avatar">NL</div>
        <div><span>Role</span><strong>{p.jobTitle || "Operations workflow assistant"}</strong><small>Works on the repetitive hand-offs behind the role.</small></div>
        <Pill tone="success">Ready</Pill>
      </div>
    </div>
    <div className="two-col">
      <div className="panel">
        <div className="section-title">Workflow</div>
        {steps.map(([n,title,desc],i)=><div key={n} className={`workflow-row ${run && i<=3?"done":""}`}><div className="node">{run && i<4?"✓":n}</div><div><strong>{title}</strong><span>{desc}</span></div></div>)}
      </div>
      <div className="panel">
        <div className="section-title">Demo task</div>
        <div className="task-box"><span>Incoming request</span><strong>{p.painSignal}</strong></div>
        <div className="task-box"><span>AI output</span><strong>{run?"Structured action + escalation decision prepared":"Waiting to run"}</strong></div>
        <button className="primary" onClick={()=>{setRun(true);track(p,"key_action",{action:"run_ai_employee"});}}>{run?"Workflow completed":"Run AI employee"}</button>
        {run && <div className="notice">Human approval remains the control point. Nothing is sent or changed in a real system.</div>}
      </div>
    </div>
  </section>;
}

function ControlCentre({p}:{p:Prospect}) {
  const [focus,setFocus] = useState(0);
  const exceptions = [
    ["Priority 1","Response / hand-off risk","Immediate"],
    ["Priority 2","Evidence / revenue signal","Today"],
    ["Priority 3","Workflow backlog","Monitor"]
  ];
  return <section className="workspace">
    <div className="panel hero-panel">
      <div className="eyebrow">CONTROL CENTRE · DEMO</div>
      <h2>{p.company}</h2>
      <p className="muted">A calm operating view answering: <b>what needs attention now, why, and what should happen next?</b></p>
      <div className="metric-grid">
        <div><span>Open exceptions</span><strong>7</strong><small>Demo sample</small></div>
        <div><span>Priority items</span><strong>3</strong><small>Ranked for attention</small></div>
        <div><span>Impact at risk</span><strong>{money(38400)}</strong><small>Synthetic estimate</small></div>
        <div><span>Next review</span><strong>15 min</strong><small>Suggested cadence</small></div>
      </div>
    </div>
    <div className="two-col">
      <div className="panel">
        <div className="section-title">What needs attention</div>
        {exceptions.map((e,i)=><button key={e[0]} onClick={()=>{setFocus(i);track(p,"key_action",{action:"focus_exception",priority:e[0]});}} className={`list-row ${focus===i?"selected":""}`}><div><strong>{e[0]} · {e[1]}</strong><span>{i===0?p.painSignal:"Drill down to see evidence and action path."}</span></div><b>{e[2]}</b></button>)}
      </div>
      <div className="panel">
        <div className="section-title">Drill-down</div>
        <div className="drill"><Pill tone="warning">{exceptions[focus][0]}</Pill><h3>{exceptions[focus][1]}</h3><p>{focus===0?p.latestActivity:p.personalisation}</p><div className="stat-line"><span>Recommended action</span><b>{focus===0?"Assign owner":"Review supporting evidence"}</b></div><div className="stat-line"><span>Confidence</span><b>Medium</b></div></div>
      </div>
    </div>
  </section>;
}

function Prototype({p}:{p:Prospect}) {
  useEffect(()=>{
    track(p,"session_started");
    const t=window.setTimeout(()=>track(p,"demo_started"),700);
    if (window.location.pathname.startsWith("/api/r/") || new URLSearchParams(window.location.search).has("tracking_id")) {
      const params = new URLSearchParams(window.location.search);
      params.set("prospect", p.id);
      params.set("tracking_id", p.trackingCode);
      window.history.replaceState({}, "", `/p/${encodeURIComponent(p.id)}?${params.toString()}`);
    }
    return ()=>window.clearTimeout(t);
  },[p.id]);
  const isCore=p.solution;
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand">NahaLabs <span>· Prospect Demo</span></div>
      <div className="top-meta"><Pill>{solutionLabels[isCore] || isCore}</Pill><span className="demo-dot"></span><span>Demo data</span></div>
    </header>
    <main>
      <div className="prospect-strip">
        <div>
          <span className="eyebrow">PERSONALISED PROTOTYPE</span>
          <h1>{p.prototypeName}</h1>
          <p>{p.company} · {p.industry}</p>
        </div>
        <div className="context">
          <div><span>Designed around</span><strong>{p.businessProblem}</strong></div>
          <div><span>Research hook</span><strong>{p.personalisation}</strong></div>
        </div>
      </div>
      {isCore==="Lead Machine" && <LeadMachine p={p}/>}
      {isCore==="Flavourly" && <Flavourly p={p}/>}
      {isCore==="CargoIQ / ImpactTrace" && <EvidenceRoom p={p}/>}
      {isCore==="AI Employee" && <AIEmployee p={p}/>}
      {isCore==="Control Centre" && <ControlCentre p={p}/>}
      <div className="footer-note">
        <span>Built for {p.company}. This is a synthetic demonstration, not a live integration.</span>
        <span>© NahaLabs · Intelligent Systems Engineering</span>
      </div>
    </main>
  </div>;
}

export default function App() {
  const path = window.location.pathname.split("/").filter(Boolean);
  const search = new URLSearchParams(window.location.search);
  const directId = path[0] === "p" ? path[1] : search.get("prospect") || "";
  const trackingCode = path[0] === "api" && path[1] === "r" ? path[2] : search.get("tracking_id") || "";
  const prospect = useMemo(
    ()=>getProspect(directId || "") || prospects.find((p)=>p.trackingCode === trackingCode),
    [directId, trackingCode]
  );

  if (!prospect) {
    return <div className="landing"><div className="landing-card"><div className="brand">NahaLabs <span>· Prospect Demo</span></div><h1>Personalised operational prototype</h1><p>Open the prospect-specific link from NahaLabs outreach to load the correct demonstration.</p><div className="muted">This demo environment is not a generic SaaS dashboard. Each tracked link resolves to a prospect-specific experience.</div></div></div>;
  }

  return <Prototype p={prospect}/>;
}
