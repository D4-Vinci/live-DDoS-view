const ws = new WebSocket("ws://localhost:5000/live");

// Colors for attack types
const ATTACK_COLORS = {
  "DDoS": "#ff4d4f", "Phishing": "#ffa940", "Malware": "#40c9a2",
  "Ransomware": "#d32be6", "SQL Injection": "#1890ff", "Zero-Day Exploit": "#ff6bcb",
  "Botnet": "#7c4dff", "Trojan": "#ffd666", "Credential Stuffing": "#73d13d",
  "unknown": "#9e9e9e"
};

// Highlighted countries (from database)
const MARKED_COUNTRIES = ["US", "IN", "CN", "RU"];

// Populate legend
const legendContainer = document.querySelector(".legend-container");
for (const [type, color] of Object.entries(ATTACK_COLORS)) {
  const div = document.createElement("div");
  div.className = "legend-item";
  div.innerHTML = `<div class="legend-color" style="background:${color}"></div>${type}`;
  legendContainer.appendChild(div);
}

// Sidebar table
const tbody = document.querySelector("#attack-table tbody");

// Filters
const filterSource = document.getElementById("filter-source");
const filterVictim = document.getElementById("filter-victim");
const filterType = document.getElementById("filter-type");
const filterFrom = document.getElementById("filter-from");
const filterTo = document.getElementById("filter-to");

// Live control
let liveUpdates = true;
let attacksBuffer = [];

// Globe
const globe = Globe()
  .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
  .arcsData([])
  .arcColor("color")
  .arcDashLength(0.4)
  .arcDashGap(0.2)
  .arcDashInitialGap(() => Math.random())
  .arcDashAnimateTime(2000)
  .width(window.innerWidth * 0.75)
  .height(window.innerHeight)
  .polygonsData([])
  .polygonCapColor(f => {
    return f.glow ? f.glow : "rgba(0,0,0,0.2)";
  })
  .polygonSideColor(() => "rgba(0,0,0,0)")
  (document.getElementById("globe"));

let arcs = [];
let countries = {}; // store per country glow info

// Initialize globe polygons with marked countries
fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
  .then(r => r.json())
  .then(worldData => {
    const topo = topojson.feature(worldData, worldData.objects.countries);
    globe.polygonsData(topo.features);
    topo.features.forEach(f => {
      countries[f.id] = { glow: MARKED_COUNTRIES.includes(f.id) ? "yellow" : null };
    });
  });

// Add attack
function randomOffset(coord, maxKm = 50) {
  // ~1 deg latitude ≈ 111 km
  const deg = maxKm / 111;
  return coord + (Math.random() * 2 - 1) * deg;
}

function addAttack(a) {
  if (!liveUpdates) { attacksBuffer.push(a); return; }

  // Filter checks
  const now = new Date(a.timestamp);
  const from = filterFrom.value ? new Date(filterFrom.value) : null;
  const to = filterTo.value ? new Date(filterTo.value) : null;
  if ((filterSource.value && !a.attacker_country_code.toLowerCase().includes(filterSource.value.toLowerCase())) ||
      (filterVictim.value && !a.victim_country_code.toLowerCase().includes(filterVictim.value.toLowerCase())) ||
      (filterType.value && !a.attack_type.toLowerCase().includes(filterType.value.toLowerCase())) ||
      (from && now < from) ||
      (to && now > to)) return;

  // Determine color for arc and glow
  const arcColor = ATTACK_COLORS[a.attack_type] || "#ff4444";
  const victimGlow = MARKED_COUNTRIES.includes(a.victim_country_code) ? "yellow" : arcColor;

  // Add arc with random offsets
  arcs.push({
    startLat: randomOffset(a.attacker_lat),
    startLng: randomOffset(a.attacker_lon),
    endLat: randomOffset(a.victim_lat),
    endLng: randomOffset(a.victim_lon),
    color: arcColor,
    altitude: 0.1 + Math.random() * 0.05 // slight variation in height
  });
  globe.arcsData(arcs.slice(-100));

  // Flash polygon glow
  globe.polygonsData().forEach(f => {
    if (f.id === a.victim_country_code || f.id === a.attacker_country_code) {
      f.glow = victimGlow;
      setTimeout(() => { f.glow = MARKED_COUNTRIES.includes(f.id) ? "yellow" : null; }, 1500);
    }
  });

  // Add table row
  const row = document.createElement("tr");
  row.innerHTML = `<td>${a.attacker_country_code}</td><td>${a.victim_country_code}</td>
                   <td style="color:${arcColor}">${a.attack_type}</td>
                   <td>${new Date(a.timestamp).toLocaleString()}</td>`;
  tbody.prepend(row);
  if (tbody.children.length > 50) tbody.removeChild(tbody.lastChild);
}


// Apply filters to table
function applyFilters() {
  const trs = tbody.querySelectorAll("tr");
  trs.forEach(tr => {
    const src = tr.children[0].textContent.toLowerCase();
    const vic = tr.children[1].textContent.toLowerCase();
    const type = tr.children[2].textContent.toLowerCase();
    const time = new Date(tr.children[3].textContent);
    const from = filterFrom.value ? new Date(filterFrom.value) : null;
    const to = filterTo.value ? new Date(filterTo.value) : null;

    const show = (!filterSource.value || src.includes(filterSource.value.toLowerCase())) &&
                 (!filterVictim.value || vic.includes(filterVictim.value.toLowerCase())) &&
                 (!filterType.value || type.includes(filterType.value.toLowerCase())) &&
                 (!from || time >= from) &&
                 (!to || time <= to);
    tr.style.display = show ? "" : "none";
  });
}

// Fetch initial attacks
fetch("http://localhost:5000/api/attacks")
  .then(r => r.json())
  .then(data => data.reverse().forEach(addAttack));

// WebSocket updates
ws.onmessage = e => addAttack(JSON.parse(e.data));

// Pause/resume button
document.getElementById("toggle-live").addEventListener("click", () => {
  liveUpdates = !liveUpdates;
  document.getElementById("toggle-live").textContent = liveUpdates ? "Pause" : "Resume";
  if (liveUpdates) attacksBuffer.forEach(addAttack);
  attacksBuffer = [];
});

// Filters event listeners
[filterSource, filterVictim, filterType, filterFrom, filterTo].forEach(inp => inp.addEventListener("input", applyFilters));

// Resize globe
window.addEventListener("resize", () => {
  globe.width(window.innerWidth * 0.75).height(window.innerHeight);
});
