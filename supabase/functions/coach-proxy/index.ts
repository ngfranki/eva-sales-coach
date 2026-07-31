// coach-proxy：代理 OpenRouter，key 收埋喺 server；只有登入用戶（帶 JWT）先call到
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { messages, max_tokens } = await req.json();
    if (!Array.isArray(messages) || messages.length > 200) {
      return new Response(JSON.stringify({ error: "bad request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
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
    return new Response(JSON.stringify(j), { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
