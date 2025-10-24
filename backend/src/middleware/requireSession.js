import { validateSession } from "../auth.js";

export default async function requireSession(req, res, next) {
  try {
    const session_id = req.header("x-session-id") || req.body.session_id || req.query.session_id;
    const s = await validateSession(session_id);
    if (!s) return res.status(401).json({ error: "Sessão inválida" });
    // anexar user info
    req.session = s;
    next();
  } catch (err) {
    next(err);
  }
}
