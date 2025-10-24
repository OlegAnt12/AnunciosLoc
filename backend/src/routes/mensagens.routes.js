import express from "express";
import pool from "../db.js";
import requireSession from "../middleware/requireSession.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Criar mensagem (publicar)
router.post("/", requireSession, async (req, res, next) => {
  try {
    const { title, body, location_id, policy_type, policy_kv, start_ts, end_ts, mode } = req.body;
    if (!title || !location_id) return res.status(400).json({ error: "title e location_id obrigatórios" });

    const q = `INSERT INTO messages (message_id, author_id, location_id, title, body, policy_type, policy_kv, start_ts, end_ts, mode)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING message_id`;
    const message_id = uuidv4();
    const vals = [message_id, req.session.user_id, location_id, title, body || null, policy_type || null, policy_kv || null, start_ts || null, end_ts || null, mode || 'central'];
    const r = await pool.query(q, vals);
    res.status(201).json({ message_id: r.rows[0].message_id });
  } catch (err) { next(err); }
});

// O cliente reporta localização periodicamente (modo centralizado)
// O servidor responde com mensagens candidatas para esse cliente
router.post("/report-location", requireSession, async (req, res, next) => {
  try {
    const { lat, lon, wifi_ids } = req.body;
    if (lat == null || lon == null) return res.status(400).json({ error: "lat e lon obrigatórios" });

    // consulta: localizar locais cujo centro esteja a menos de radius_m
    const q = `
      SELECT m.*
      FROM locations l
      JOIN messages m ON m.location_id = l.location_id
      WHERE ST_DWithin(l.center, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, l.radius_m)
        AND (m.start_ts IS NULL OR m.start_ts <= NOW())
        AND (m.end_ts IS NULL OR m.end_ts >= NOW())
    `;
    const r = await pool.query(q, [lon, lat]);
    // opcional: aplicar policy_kv filtragem no servidor (ver se user tem as chaves)
    res.json({ candidates: r.rows });
  } catch (err) { next(err); }
});

// Marcar entrega quando o cliente "recebe" a mensagem
router.post("/:messageId/receive", requireSession, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const q = `INSERT INTO deliveries (message_id, receiver_id, source, status, received_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING delivery_id`;
    const r = await pool.query(q, [messageId, req.session.user_id, 'server', 'delivered']);
    res.json({ delivery_id: r.rows[0].delivery_id });
  } catch (err) { next(err); }
});

export default router;
