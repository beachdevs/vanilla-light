export default function (app) {
  app.requiredEnvs = [...(app.requiredEnvs || []), "LLM_API_KEY", "LLM_ENDPOINT"];

  function resolveChatEndpoint(raw) {
    const endpoint = String(raw || "").trim();
    if (!endpoint) return "";
    if (/\/chat\/completions\/?$/.test(endpoint)) return endpoint;
    return endpoint.replace(/\/+$/, "") + "/chat/completions";
  }

  const k = "POST /llm/chat";
  const fn = async (req, ctx) => {
    const endpoint = resolveChatEndpoint(Bun.env.LLM_ENDPOINT);
    const apiKey = Bun.env.LLM_API_KEY;
    const auth = apiKey?.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey || ""}`;

    if (!endpoint) return ctx.json({ error: "Missing LLM_ENDPOINT" }, 503);
    if (!apiKey) return ctx.json({ error: "Missing LLM_API_KEY" }, 503);
    const body = await req.json().catch(() => ({}));
    const model = Bun.env.LLM_USE_MODEL;
    if (model && !body.model) body.model = model;

    const res = await fetch(endpoint, {
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
