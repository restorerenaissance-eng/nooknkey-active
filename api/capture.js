// Vercel Serverless Function — /api/capture
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://thenooknkey.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  const { firstName, email, phone, room, ts } = body || {};
  if (!email || !firstName) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          SMS: phone || "",
          ROOM: room || "unknown",
          PROPERTY: "NooknKey",
          CHECKIN_TS: ts || new Date().toISOString()
        },
        listIds: [3],
        updateEnabled: true
      })
    });
    if (brevoRes.status !== 201 && brevoRes.status !== 204) {
      const errText = await brevoRes.text();
      console.error("Brevo error:", brevoRes.status, errText);
    }
  } catch (err) {
    console.error("Brevo fetch failed:", err);
  }

  return res.status(200).json({
    ok: true,
    wifiNetwork: process.env.WIFI_NETWORK || "TMobile-44C8",
    wifiPassword: process.env.WIFI_PASSWORD || "",
    guideUrl: process.env.GUIDE_URL || "https://thenooknkey.com/guide.html"
  });
}
