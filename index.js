
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

dotenv.config();
const app = express();
const db = new sqlite3.Database('./bookings.db');
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  service_type TEXT,
  date TEXT,
  time TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS blocked_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  time TEXT
)`);

app.post('/api/book', (req, res) => {
  const { name, phone, service_type, date, time } = req.body;
  db.run(
    `INSERT INTO bookings (name, phone, service_type, date, time) VALUES (?, ?, ?, ?, ?)`,
    [name, phone, service_type, date, time],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false });
});

app.get('/api/bookings', (req, res) => {
  db.all(`SELECT * FROM bookings ORDER BY date, time`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/blocked', (req, res) => {
  db.all(`SELECT * FROM blocked_times`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/block', (req, res) => {
  const { date, time, block } = req.body;
  if (block) {
    db.run(`INSERT INTO blocked_times (date, time) VALUES (?, ?)`, [date, time], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    db.run(`DELETE FROM blocked_times WHERE date = ? AND time = ?`, [date, time], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
