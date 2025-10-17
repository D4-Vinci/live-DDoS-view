<div align="center">

# 🌍⚡ **CyberGlobe: The Live View of Digital Warfare** ⚡🌍

<img src="https://raw.githubusercontent.com/D4-Vinci/live-DDoS-view/main/assets/banner-space.gif" alt="CyberGlobe Banner" width="100%" />

### 🔓 _An open-source visualization of global cyberattacks in real time!_

</div>

---

## 🛰️ Overview

**CyberGlobe** is a stunning, real-time **3D visualization** of cyberattacks taking place across the world.  
Using **WebGL**, **MySQL**, and a touch of chaos, it renders live attack data as glowing arcs leaping between nations on a rotating globe.  
Each arc is a digital battle, a spark of information, and a story in motion.

<div align="center">

> “The digital war is invisible — until now.”  
> _– CyberGlobe Team_

</div>

---

## 🚀 Features

✅ Real-time cyberattack rendering using **Globe.gl + Three.js**  
✅ Live data stream via **WebSockets**  
✅ Dynamic **MySQL backend** with auto-generated global attacks  
✅ **Filtering panel** – by attack type, country, and timestamp  
✅ **Attack legends** with unique color codes  
✅ Beautiful, responsive **UI with CSS starfield background**  
✅ 100% **Open Source** — because the digital sky belongs to everyone 🌐  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| 🌐 Frontend | HTML, CSS, Vanilla JS, [Globe.gl](https://globe.gl/) |
| 🧰 Backend | Node.js (Express + WebSocket) |
| 💾 Database | MySQL |
| 🛰️ Live Updates | WebSocket real-time streams |
| 🧩 Data Schema | Country, Victim, Attack Type, Timestamp |
| 🪄 Visualization | Dynamic 3D arcs + Night sky globe |

---

## 🗺️ System Architecture

[ MySQL DB ]
↑
| (attack generator)
[ Node.js Backend ]
↓
(WebSocket)
↓
[ HTML / Globe.gl Frontend ]
↓
🌍 Live visualization


---

## ⚙️ Installation Guide

### 🧩 1. Clone this Repository
```bash
git clone https://github.com/D4-Vinci/live-DDoS-view.git
cd live-DDoS-view
```

### 🧱 2. Setup the Database
```
sudo mysql -u root -p < cyberglobe_schema.sql
```

### 💡 3. Install Dependencies
```
npm install
```

### 🌐 4. Run Backend Server
```
node server/server.js
```

### 🧭 5. Open the Frontend
Open `index.html` in your browser,
or use a simple static server:
```
npx serve
```

| Attack Type             | Color     |
| ----------------------- | --------- |
| 🧨 DDoS                 | 🔴 Red    |
| 🎣 Phishing             | 🟠 Orange |
| 🦠 Malware              | 🟢 Green  |
| 💣 Ransomware           | 🟣 Purple |
| 💉 SQL Injection        | 🔵 Blue   |
| 🌑 Zero-Day             | 🌸 Pink   |
| 🤖 Botnet               | 🟪 Violet |
| 🧟 Trojan               | 🟡 Yellow |
| 🗝️ Credential Stuffing | 🟩 Lime   |

## 🪐 Preview

✨ Your screen becomes a living map of the cyber realm.

### 👨‍🚀 Contribute

1) Fork the repo

2) Create your feature branch:
```
git checkout -b feature/amazing-feature
```

3) Commit your changes

4) Push to your fork and open a Pull Request 🚀

<div align="center">  

## 🌌Open Source Space

We believe knowledge and defense should orbit freely.
Made with ❤️ by D4-Vinci
and powered by curiosity, caffeine, and chaos.
</div> 
