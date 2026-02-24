export default function (app) {
  app.requiredEnvs = [...(app.requiredEnvs || []), "OPENAI_BASE_URL", "OPENAI_API_KEY", "OPENAI_MODEL"];

  function resolveChatEndpoint(raw) {
    const endpoint = String(raw || "").trim();
    if (!endpoint) return "";
    if (/\/chat\/completions\/?$/.test(endpoint)) return endpoint;
    return endpoint.replace(/\/+$/, "") + "/chat/completions";
  }

  const k = "POST /llm/chat";
  const fn = async (req, ctx) => 
  {
    const {OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL} = Bun.env;

    const res = await fetch(OPENAI_BASE_URL, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    try {
      return ctx.json(text ? JSON.parse(text) : {}, res.status);
    } catch {
      return ctx.json({ error: text || `Upstream returned ${res.status}` }, res.status);
    }
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
