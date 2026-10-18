// Servidor que imita os endpoints do Supabase usados pelo app — APENAS PARA TESTES E2E.
// Permite validar no navegador cookies de sessão, redirecionamentos, proxy e logout
// sem depender de um projeto Supabase real. Não é usado em produção.
import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_SUPABASE_PORT ?? 54331);
const users = new Map(); // email -> { id, email, password, meta }
const tokens = new Map(); // access_token -> user id
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

function session(user) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const access_token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: user.id, email: user.email, role: "authenticated", aud: "authenticated", exp, iat: exp - 3600, session_id: randomUUID() })}.sig`;
  tokens.set(access_token, user.id);
  const refresh_token = randomUUID();
  tokens.set(`r:${refresh_token}`, user.id);
  return { access_token, refresh_token, token_type: "bearer", expires_in: 3600, expires_at: exp, user: publicUser(user) };
}

function publicUser(u) {
  return { id: u.id, aud: "authenticated", role: "authenticated", email: u.email, email_confirmed_at: new Date().toISOString(), user_metadata: u.meta, app_metadata: { provider: "email" }, created_at: u.created_at, identities: [{ id: u.id }] };
}

const byId = (id) => [...users.values()].find((u) => u.id === id);

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

const authErr = (res, status, error_code, msg) => send(res, status, { code: status, error_code, msg });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let body = {};
    if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString() || "{}") : {};
    }
    const bearer = (req.headers.authorization ?? "").replace("Bearer ", "");
    const current = byId(tokens.get(bearer));
    const p = url.pathname;

    if (p === "/auth/v1/signup" && req.method === "POST") {
      if (users.has(body.email)) return send(res, 200, { ...publicUser(users.get(body.email)), identities: [] });
      const u = { id: randomUUID(), email: body.email, password: body.password, meta: body.data ?? {}, created_at: new Date().toISOString() };
      users.set(u.email, u);
      return send(res, 200, session(u)); // "confirmação de e-mail desativada" → sessão imediata
    }
    if (p === "/auth/v1/token") {
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const u = users.get(body.email);
        if (!u || u.password !== body.password) return authErr(res, 400, "invalid_credentials", "Invalid login credentials");
        return send(res, 200, session(u));
      }
      if (grant === "refresh_token") {
        const u = byId(tokens.get(`r:${body.refresh_token}`));
        return u ? send(res, 200, session(u)) : authErr(res, 400, "refresh_token_not_found", "Invalid Refresh Token");
      }
    }
    if (p === "/auth/v1/user" && req.method === "GET") {
      return current ? send(res, 200, publicUser(current)) : authErr(res, 401, "bad_jwt", "invalid JWT");
    }
    if (p === "/auth/v1/user" && req.method === "PUT") {
      if (!current) return authErr(res, 401, "bad_jwt", "invalid JWT");
      if (body.password) current.password = body.password;
      return send(res, 200, publicUser(current));
    }
    if (p === "/auth/v1/logout") {
      tokens.delete(bearer);
      return send(res, 204);
    }
    if (p === "/auth/v1/recover") return send(res, 200, {});

    if (p === "/rest/v1/rpc/is_username_available") {
      const taken = [...users.values()].some((u) => u.meta.username === String(body.p_username).toLowerCase());
      return send(res, 200, !taken);
    }
    if (p === "/rest/v1/profiles") {
      const id = (url.searchParams.get("id") ?? "").replace("eq.", "");
      const u = byId(id);
      const rows = u && current?.id === id
        ? [{ id: u.id, full_name: u.meta.full_name, username: u.meta.username, avatar_url: null, bio: null, role: "member", created_at: u.created_at }]
        : [];
      const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object");
      return wantsObject ? (rows[0] ? send(res, 200, rows[0]) : send(res, 406, { code: "PGRST116" })) : send(res, 200, rows);
    }
    if (p === "/rest/v1/articles") return send(res, 200, []);

    send(res, 404, { msg: `mock: rota não implementada ${req.method} ${p}` });
  })
  .listen(PORT, () => console.log(`mock-supabase em http://localhost:${PORT}`));
