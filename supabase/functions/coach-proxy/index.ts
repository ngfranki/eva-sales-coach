// coach-proxy：代理 OpenRouter，key 收埋喺 server。
// 平台 verify_jwt 會放行 publishable key（只係 apikey，唔係用戶 JWT），
// 所以 handler 再確認 Authorization 係登入用戶嘅 session access token。
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function bearerToken(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match ? match[1] : "";
}

// User access tokens are JWTs. Publishable and secret keys are not.
function isUserAccessToken(token: string): boolean {
  return token.length > 0 && !token.startsWith("sb_") && token.split(".").length === 3;
}

async function requireSignedInUser(req: Request): Promise<Response | null> {
  const token = bearerToken(req);
  const apikey = (req.headers.get("apikey") ?? "").trim();
  if (!isUserAccessToken(token) || !apikey || apikey === token) {
    return json(401, { error: "login required" });
  }
  const base = (Deno.env.get("SUPABASE_URL") ?? "https://lvwspnjysfyomuszzjay.supabase.co").replace(/\/$/, "");
  let userRes: Response;
  try {
    userRes = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey, Authorization: `Bearer ${token}` },
    });
  } catch {
    return json(401, { error: "login required" });
  }
  if (!userRes.ok) {
    await userRes.body?.cancel();
    return json(401, { error: "login required" });
  }
  await userRes.body?.cancel();
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const denied = await requireSignedInUser(req);
  if (denied) return denied;
  try {
    const { messages, max_tokens } = await req.json();
    if (!Array.isArray(messages) || messages.length > 200) {
      return json(400, { error: "bad request" });
    }
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("COACH_MODEL") ?? "anthropic/claude-sonnet-4.5",
        messages,
        max_tokens: Math.min(max_tokens ?? 500, 3000),
        temperature: 0.8,
      }),
    });
    const j = await r.json();
    return json(r.status, j);
  } catch (e) {
    return json(500, { error: String(e) });
  }
});
