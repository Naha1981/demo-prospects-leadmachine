export default function handler(req: any, res: any) {
  const code = Array.isArray(req.query?.code) ? req.query.code[0] : req.query?.code;
  const routes: Record<string, string> = {"1yphi9z1g3":"NL-0001","1km79gw0ip":"NL-0002","1iyz21m096":"NL-0003","1tdjv261su":"NL-0004","0va13qs1q6":"NL-0005","1lxcn2d1ys":"NL-0006","1y27tou1m5":"NL-0007","0uwv6qp0cx":"NL-0008","1ir98vh1eo":"NL-0009","1la3d2j1bi":"NL-0010","13cwal60hm":"NL-0011","03w7fb30vt":"NL-0012","1ot6v310nq":"NL-0013","03h578v1tg":"NL-0014","1pd62bj0tv":"NL-0015","0n72wvo1on":"NL-0016","0jqfyrb095":"NL-0017","0dnm8al1j7":"NL-0018","0x0igz20fo":"NL-0019","1twszz309l":"NL-0020","1gt2j74103":"NL-0021","01fmo8i123":"NL-0022","07ph1qq1kk":"NL-0023","1ss5lyd1l9":"NL-0024","1umhmvt0d4":"NL-0025","0pghzjj0a5":"NL-0026","16u7bv60ih":"NL-0027","0mbcpg4091":"NL-0029","0zvfy8v1rp":"NL-0030","039tbv0087":"NL-0031","03pjthc0zk":"NL-0032","1byp8960eu":"NL-0033","0j5wp40089":"NL-0034","1j0g6w00zs":"NL-0035","1c8teoe04z":"NL-0036","12k2wbf0wu":"NL-0037","1tr0v7z1xz":"NL-0038","19el2dp00j":"NL-0039","0xa0puf0i5":"NL-0040","0mw5vou1nd":"NL-0041","1n1jv3b0y4":"NL-0042","0u158071px":"NL-0043","1mpal4s1fl":"NL-0044","151pi7z1yh":"NL-0045"};
  const prospectId = code ? routes[code] : undefined;
  if (!prospectId) {
    res.status(404).json({ error: "Tracking link not found" });
    return;
  }

  const q = req.query || {};
  const source = String(q.utm_source || "nahalabs");
  const medium = String(q.utm_medium || "email");
  const campaign = String(q.utm_campaign || "prospect-outreach-2026-10");
  const content = String(q.utm_content || code);

  console.log(JSON.stringify({
    event_type: "link_opened",
    tracking_id: code,
    prospect_id: prospectId,
    source,
    medium,
    campaign,
    content,
    timestamp: new Date().toISOString(),
    user_agent: String(req.headers?.["user-agent"] || "").slice(0, 180),
    referrer: String(req.headers?.referer || req.headers?.referrer || "").slice(0, 300)
  }));

  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
    tracking_id: code
  });

  res.status(302).setHeader("Location", `/p/${encodeURIComponent(prospectId)}?${params.toString()}`).end();
}
