import express from "express";
import pool from "../db.js";
import requireSession from "../middleware/requireSession.js";

const router = express.Router();

// Listar todos os locais
router.get("/", requireSession, async (req, res, next) => {
  try {
    const r = await pool.query(`SELECT location_id, name, ST_AsText(center) as center, radius_m, wifi_ids, created_by FROM locations`);
    res.json(r.rows);
  } catch (err) { next(err); }
});

// Criar local
router.post("/", requireSession, async (req, res, next) => {
  try {
    const { name, lat, lon, radius_m, wifi_ids } = req.body;
    if (!name || lat == null || lon == null) return res.status(400).json({ error: "name, lat, lon obrigatórios" });
    const q = `INSERT INTO locations (name, center, radius_m, wifi_ids, created_by)
               VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3),4326)::geography, $4, $5, $6) RETURNING location_id`;
    const vals = [name, lon, lat, radius_m || 20, wifi_ids || null, req.session.user_id];
    const r = await pool.query(q, vals);
    res.status(201).json({ location_id: r.rows[0].location_id });
  } catch (err) { next(err); }
});

// Remover local
router.delete("/:id", requireSession, async (req, res, next) => {
  try {
    const id = req.params.id;
    // opcional: checar if created_by == req.session.user_id ou permitir remover qualquer
    await pool.query(`DELETE FROM locations WHERE location_id = $1`, [id]);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

export default router;
