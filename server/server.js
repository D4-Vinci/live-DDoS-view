import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = await mysql.createPool({
  host: "localhost",
  user: "cyber_user",
  password: "StrongPassword123",
  database: "cyberglobe",
  waitForConnections: true,
  connectionLimit: 10,
});

await db.query(`
CREATE TABLE IF NOT EXISTS attacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attacker_country_code VARCHAR(10),
  attacker_country_name VARCHAR(100),
  victim_country_code VARCHAR(10),
  victim_country_name VARCHAR(100),
  attack_type VARCHAR(100),
  intensity FLOAT,
  packet_size INT,
  success BOOLEAN,
  attacker_lat DOUBLE,
  attacker_lon DOUBLE,
  victim_lat DOUBLE,
  victim_lon DOUBLE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`);

app.get("/api/attacks", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM attacks ORDER BY timestamp DESC LIMIT 200"
  );
  res.json(rows);
});

const PORT = 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Running at http://localhost:${PORT}`)
);

const wss = new WebSocketServer({ server, path: "/live" });
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of wss.clients)
    if (client.readyState === 1) client.send(msg);
}

const countries = [
  { code: "US", name: "United States", lat: 38, lon: -97 },
  { code: "IN", name: "India", lat: 21, lon: 78 },
  { code: "CN", name: "China", lat: 35, lon: 104 },
  { code: "RU", name: "Russia", lat: 61, lon: 105 },
  { code: "BR", name: "Brazil", lat: -10, lon: -55 },
  { code: "DE", name: "Germany", lat: 51, lon: 10 },
  { code: "FR", name: "France", lat: 46, lon: 2 },
  { code: "GB", name: "UK", lat: 55, lon: -3 },
  { code: "JP", name: "Japan", lat: 36, lon: 138 },
  { code: "AU", name: "Australia", lat: -25, lon: 133 },
  { code: "ZA", name: "South Africa", lat: -30, lon: 25 },
  { code: "CA", name: "Canada", lat: 56, lon: -106 },
];
const attackTypes = [
  "DDoS",
  "Phishing",
  "Malware",
  "Ransomware",
  "SQL Injection",
  "Botnet",
  "Trojan",
];
const colors = {
  DDoS: "#ff4444",
  Phishing: "#ffaa00",
  Malware: "#00ffcc",
  Ransomware: "#ff00ff",
  "SQL Injection": "#00aaff",
  Botnet: "#ffcc00",
  Trojan: "#33ff33",
};

function jitter(c) {
  const d = 2;
  return { lat: c.lat + (Math.random() - 0.5) * d, lon: c.lon + (Math.random() - 0.5) * d };
}

async function generateAttack() {
  const a = countries[Math.floor(Math.random() * countries.length)];
  let v;
  do v = countries[Math.floor(Math.random() * countries.length)];
  while (v.code === a.code);

  const attack_type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const payload = {
    attacker_country_code: a.code,
    attacker_country_name: a.name,
    victim_country_code: v.code,
    victim_country_name: v.name,
    attack_type,
    intensity: Number((Math.random() * 100).toFixed(2)),
    packet_size: Math.floor(Math.random() * 1500),
    success: Math.random() > 0.5,
    attacker_lat: jitter(a).lat,
    attacker_lon: jitter(a).lon,
    victim_lat: jitter(v).lat,
    victim_lon: jitter(v).lon,
    timestamp: new Date(),
    color: colors[attack_type],
  };

  await db.query(
    `INSERT INTO attacks
     (attacker_country_code, attacker_country_name, victim_country_code, victim_country_name,
      attack_type, intensity, packet_size, success,
      attacker_lat, attacker_lon, victim_lat, victim_lon, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.attacker_country_code,
      payload.attacker_country_name,
      payload.victim_country_code,
      payload.victim_country_name,
      payload.attack_type,
      payload.intensity,
      payload.packet_size,
      payload.success,
      payload.attacker_lat,
      payload.attacker_lon,
      payload.victim_lat,
      payload.victim_lon,
      payload.timestamp,
    ]
  );

  broadcast(payload);
  console.log(`📡 ${payload.attacker_country_code} → ${payload.victim_country_code} (${attack_type})`);
}

// generate attack every 2s
setInterval(generateAttack, 2000);

// delete old attacks (>15 min)
setInterval(async () => {
  await db.query("DELETE FROM attacks WHERE timestamp < NOW() - INTERVAL 15 MINUTE");
}, 60000);
