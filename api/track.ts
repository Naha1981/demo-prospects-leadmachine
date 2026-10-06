export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const body = typeof req.body === "string" ? (() => {
    try { return JSON.parse(req.body); } catch { return {}; }
  })() : (req.body || {});

  console.log(JSON.stringify({
    ...body,
    timestamp: body.timestamp || new Date().toISOString(),
    user_agent: String(req.headers?.["user-agent"] || "").slice(0, 180),
    referrer: String(req.headers?.referer || req.headers?.referrer || "").slice(0, 300)
  }));

  res.status(204).end();
}
