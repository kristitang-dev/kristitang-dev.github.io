// Time & Space — live readout of the clock's time and Earth's place in its orbit.
// sketch.js calls updateHud() every frame with the same angles it draws with,
// so the numbers always match the 3D scene.

const AU_KM = 149597870.7;
const AXIAL_TILT = 23.44;

const hud = {
  time: document.getElementById('hud-time'),
  date: document.getElementById('hud-date'),
  zone: document.getElementById('hud-zone'),
  progress: document.getElementById('hud-progress'),
  day: document.getElementById('hud-day'),
  angle: document.getElementById('hud-angle'),
  longitude: document.getElementById('hud-longitude'),
  distance: document.getElementById('hud-distance'),
  speed: document.getElementById('hud-speed'),
  spin: document.getElementById('hud-spin'),
  season: document.getElementById('hud-season'),
  earth: document.getElementById('hud-orbit-earth'),
  sweep: document.getElementById('hud-orbit-sweep'),
};

const pad = (n) => String(n).padStart(2, '0');
const set = (el, text) => {
  if (el && el.textContent !== text) el.textContent = text;
};

// Time zone label, e.g. "America/New_York · UTC−05:00". Fixed for the session.
(function setZone() {
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '−';
  const abs = Math.abs(offset);
  set(hud.zone, `${name.replace(/_/g, ' ')} · UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`);
})();

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

// Low-precision solar position (Astronomical Almanac), good to ~0.01° and
// ~0.0001 AU for 1950–2050. d = days since J2000.0 (2000-01-01 12:00 UT).
function daysSinceJ2000(now) {
  return now / 86400000 - 10957.5;
}

function solar(now) {
  const d = daysSinceJ2000(now);
  const rad = Math.PI / 180;
  const g = (357.529 + 0.98560028 * d) * rad; // mean anomaly
  const L = 280.459 + 0.98564736 * d; // mean longitude of the Sun
  const sunLongitude = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return {
    // Earth sits opposite the Sun as seen from Earth.
    earthLongitude: (((sunLongitude + 180) % 360) + 360) % 360,
    distanceAU: 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g),
  };
}

// Earth Rotation Angle (IAU 2000): how far Earth has turned against the stars.
// One full turn every ~23 h 56 m, not 24 h.
function earthRotationAngle(now) {
  const turns = 0.779057273264 + 1.00273781191135448 * daysSinceJ2000(now);
  return (((turns % 1) + 1) % 1) * 360;
}

// Northern-hemisphere season from approximate solstice/equinox days.
function seasonFor(dayOfYear) {
  if (dayOfYear < 79 || dayOfYear >= 355) return 'Winter';
  if (dayOfYear < 172) return 'Spring';
  if (dayOfYear < 265) return 'Summer';
  return 'Autumn';
}

function setOrbitDot(angleDeg, progress) {
  // Matches the sketch: angle 0 sits at the top of the orbit and runs clockwise.
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const r = 26;
  if (hud.earth) {
    hud.earth.setAttribute('cx', (32 + Math.cos(rad) * r).toFixed(2));
    hud.earth.setAttribute('cy', (32 + Math.sin(rad) * r).toFixed(2));
  }
  if (hud.sweep) {
    const length = 2 * Math.PI * r;
    hud.sweep.setAttribute('stroke-dasharray', `${(length * progress).toFixed(2)} ${length.toFixed(2)}`);
  }
}

let lastSecond = -1;

function updateHud({ orbitAngle, dayOfYear, daysInYear, fractionalDay }) {
  const now = new Date();

  set(hud.time, `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);

  // Everything else changes slowly; refresh once a second.
  if (now.getSeconds() === lastSecond) return;
  lastSecond = now.getSeconds();

  const progress = fractionalDay / daysInYear;
  const { earthLongitude, distanceAU: au } = solar(now.getTime());
  // Vis-viva: orbital speed from distance, with a = 1 AU and mean speed 29.78 km/s.
  const speed = 29.78 * Math.sqrt(2 / au - 1);

  set(hud.date, dateFormat.format(now));
  set(hud.progress, `${(progress * 100).toFixed(2)}%`);
  set(hud.day, `Day ${dayOfYear} / ${daysInYear}`);
  // Calendar angle: the year's share of 360°, which is what the scene draws.
  set(hud.angle, `${(((orbitAngle % 360) + 360) % 360).toFixed(2)}°`);
  set(hud.longitude, `${earthLongitude.toFixed(2)}°`);
  set(hud.distance, `${au.toFixed(4)} AU · ${(au * AU_KM / 1e6).toFixed(2)}M km`);
  set(hud.speed, `${speed.toFixed(2)} km/s`);
  set(hud.spin, `${earthRotationAngle(now.getTime()).toFixed(2)}° · tilt ${AXIAL_TILT}°`);
  set(hud.season, `${seasonFor(dayOfYear)} · northern hemisphere`);
  setOrbitDot(orbitAngle, progress);
}

window.updateHud = updateHud;
