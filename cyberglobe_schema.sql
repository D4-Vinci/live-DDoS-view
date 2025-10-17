-- -----------------------------------------------------
-- Database: cyberglobe
-- Description: Stores live global cyberattack data
-- -----------------------------------------------------

CREATE DATABASE IF NOT EXISTS cyberglobe;
USE cyberglobe;

-- -----------------------------------------------------
-- Table: attack_types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS attack_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(10) DEFAULT '#ffffff'
);

INSERT INTO attack_types (name, color) VALUES
('DDoS', '#ff4d4f'),
('Phishing', '#ffa940'),
('Malware', '#40c9a2'),
('Ransomware', '#d32be6'),
('SQL Injection', '#1890ff'),
('Zero-Day Exploit', '#ff6bcb'),
('Botnet', '#7c4dff'),
('Trojan', '#ffd666'),
('Credential Stuffing', '#73d13d');

-- -----------------------------------------------------
-- Table: victims
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS victims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6)
);

INSERT INTO victims (country_code, country_name, latitude, longitude) VALUES
('US', 'United States', 37.0902, -95.7129),
('IN', 'India', 20.5937, 78.9629),
('CN', 'China', 35.8617, 104.1954),
('RU', 'Russia', 61.5240, 105.3188),
('DE', 'Germany', 51.1657, 10.4515),
('GB', 'United Kingdom', 55.3781, -3.4360),
('BR', 'Brazil', -14.2350, -51.9253),
('JP', 'Japan', 36.2048, 138.2529),
('FR', 'France', 46.2276, 2.2137);

-- -----------------------------------------------------
-- Table: attacks
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS attacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attacker_country_code CHAR(2) NOT NULL,
  victim_country_code CHAR(2) NOT NULL,
  attack_type_id INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attack_type_id) REFERENCES attack_types(id)
);

-- Seed example attacks
INSERT INTO attacks (attacker_country_code, victim_country_code, attack_type_id)
VALUES
('RU', 'US', 1),
('CN', 'IN', 3),
('US', 'RU', 2),
('IN', 'JP', 4),
('BR', 'FR', 5);

-- -----------------------------------------------------
-- View: attack_overview (optional helper for frontend)
-- -----------------------------------------------------
CREATE OR REPLACE VIEW attack_overview AS
SELECT 
  a.id,
  a.attacker_country_code,
  a.victim_country_code,
  t.name AS attack_type,
  t.color AS color,
  a.timestamp
FROM attacks a
JOIN attack_types t ON a.attack_type_id = t.id
ORDER BY a.timestamp DESC;
