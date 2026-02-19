export default function (app) {
  const endpoint = Bun.env.LLM_ENDPOINT;
  const apiKey = Bun.env.LLM_API_KEY;
  const auth = apiKey?.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey || ""}`;
  app.requiredEnvs = [...(app.requiredEnvs || []), "LLM_API_KEY", "LLM_ENDPOINT"];

  const k = "POST /llm/chat";
  const fn = async (req, ctx) => {
    if (!endpoint) return ctx.json({ error: "Missing LLM_ENDPOINT" }, 503);
    if (!apiKey) return ctx.json({ error: "Missing LLM_API_KEY" }, 503);
    const body = await req.json().catch(() => ({}));
    const model = Bun.env.USE_LLM_MODEL;
    if (model && !body.model) body.model = model;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return ctx.json(await res.json(), res.status);
  };
  app.routes[k] = app.routes[k] ? (Array.isArray(app.routes[k]) ? [...app.routes[k], fn] : [app.routes[k], fn]) : fn;
}
