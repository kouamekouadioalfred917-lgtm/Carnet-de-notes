const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;
const SECRET = "mon_secret_jwt_2026";

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "alfredkouame",
  host: "localhost",
  database: "carnet_notes",
  password: "",
  port: 5432,
});

// Middleware pour vérifier le token
function verifierToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Non autorisé" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
}

// INSCRIPTION
app.post("/inscription", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hash]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(400).json({ message: "Email déjà utilisé" });
  }
});

// CONNEXION
app.post("/connexion", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0)
    return res.status(400).json({ message: "Email introuvable" });
  const user = result.rows[0];
  const valide = await bcrypt.compare(password, user.password);
  if (!valide)
    return res.status(400).json({ message: "Mot de passe incorrect" });
  const token = jwt.sign({ id: user.id }, SECRET);
  res.json({ token });
});

// GET - Récupérer les notes de l'utilisateur connecté
app.get("/notes", verifierToken, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE user_id = $1 ORDER BY id",
    [req.userId]
  );
  res.json(result.rows);
});

// POST - Ajouter une note
app.post("/notes", verifierToken, async (req, res) => {
  const { matiere, note, coefficient } = req.body;
  const result = await pool.query(
    "INSERT INTO notes (matiere, note, coefficient, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [matiere, note, coefficient, req.userId]
  );
  res.json(result.rows[0]);
});

// DELETE - Supprimer une note
app.delete("/notes/:id", verifierToken, async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  res.json({ message: "Note supprimée" });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});