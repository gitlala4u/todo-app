const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'example',
  database: process.env.DB_NAME || 'testdb'
};

let pool;
(async () => {
  pool = await mysql.createPool(dbConfig);
  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(255) NOT NULL,
      done BOOLEAN DEFAULT FALSE
    )
  `);
})();

// API Endpoints

// Get all Todos
app.get('/todos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM todos');
  res.json(rows);
});

// Add a Todo
app.post('/todos', async (req, res) => {
  const text = req.body.text;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Todo text required" });
  }
  const [result] = await pool.query(
    'INSERT INTO todos (text, done) VALUES (?, ?)',
    [text.trim(), false]
  );
  const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// Update Todo (text/done)
app.put('/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { text, done } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Todo text required" });
  }
  const [result] = await pool.query(
    'UPDATE todos SET text = ?, done = ? WHERE id = ?',
    [text.trim(), done, id]
  );
  const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// Delete Todo
app.delete('/todos/:id', async (req, res) => {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM todos WHERE id = ?', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Todo API running on http://localhost:${PORT}`));
