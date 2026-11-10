import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(ROOT, '.cache');
fs.mkdirSync(path.join(CACHE, 'ne'), { recursive: true });

async function ensure(url, name) {
  const file = path.join(CACHE, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) return file;
  process.stdout.write('fetch ' + name + ' ... ');
  const r = await fetch(url);
  if (!r.ok) throw new Error('Fetch failed ' + r.status + ': ' + url);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log((fs.statSync(file).size / 1024 / 1024).toFixed(1) + ' MB');
  return file;
}

const ATLAS_RAW = 'https://raw.githubusercontent.com/DeanChensj/jiangshan-map/main/js/';
const NE_RAW = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const mapDataPath = await ensure(ATLAS_RAW + 'map_data.js', 'map_data.js');
const snapshotsPath = await ensure(ATLAS_RAW + 'atlas_snapshots.js', 'atlas_snapshots.js');
const landPath = await ensure(NE_RAW + 'ne_50m_land.geojson', 'ne/ne_50m_land.geojson');
const coastPath = await ensure(NE_RAW + 'ne_50m_coastline.geojson', 'ne/ne_50m_coastline.geojson');
const riverPath = await ensure(NE_RAW + 'ne_50m_rivers_lake_centerlines.geojson', 'ne/ne_50m_rivers_lake_centerlines.geojson');
const lakePath = await ensure(NE_RAW + 'ne_50m_lakes.geojson', 'ne/ne_50m_lakes.geojson');

function loadGlobals(file, key) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { timeout: 120000 });
  return ctx.window[key];
}

const dynastiesRaw = loadGlobals(mapDataPath, 'DYNASTY_DATA');
const snapshots = loadGlobals(snapshotsPath, 'ATLAS_SNAPSHOTS');

const BOUNDS = { x0: 55, x1: 152, y0: 6, y1: 58 };
const MIN_AREA = 0.012;

function ringArea(ring) {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    s += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(s / 2);
}

function distToSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function rdp(points, tol) {
  if (points.length <= 3) return points;
  let maxD = 0, idx = 0;
  const a = points[0], b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSeg(points[i], a, b);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > tol) {
    const left = rdp(points.slice(0, idx + 1), tol);
    const right = rdp(points.slice(idx), tol);
    return left.slice(0, -1).concat(right);
  }
  return [a, b];
}

function simplifyRing(ring, tol = 0.045) {
  let pts = ring.map(([x, y]) => [x, y]);
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
  if (ringArea(pts) < MIN_AREA) return null;
  // split at extreme point to preserve closed shape better
  let far = 1, farD = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > farD) { farD = d; far = i; }
  }
  const a = rdp(pts.slice(0, far + 1), tol);
  const b = rdp(pts.slice(far).concat([pts[0]]), tol);
  const out = a.slice(0, -1).concat(b.slice(0, -1));
  if (out.length < 4) return null;
  return out.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
}

function simplifyGeometry(geom, tol = 0.045) {
  if (!geom) return null;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  const out = [];
  for (const poly of polys) {
    const rings = [];
    for (let r = 0; r < poly.length; r++) {
      const ring = simplifyRing(poly[r], tol);
      if (!ring) continue;
      // preserve holes when the outer ring survives; tiny holes get dropped
      if (r > 0 && Math.abs(ringArea(poly[r])) < 0.08) continue;
      rings.push(ring);
    }
    if (rings.length) out.push(rings);
  }
  return out.length ? out : null;
}

function geometryBBox(geom) {
  let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
  const walk = (a) => {
    if (typeof a?.[0] === 'number') {
      x0 = Math.min(x0, a[0]); x1 = Math.max(x1, a[0]);
      y0 = Math.min(y0, a[1]); y1 = Math.max(y1, a[1]);
    } else if (a) a.forEach(walk);
  };
  walk(geom?.coordinates);
  return [x0, y0, x1, y1];
}

const shapes = [];
const shapeMap = new Map();
function internShape(simplified) {
  const key = crypto.createHash('sha1').update(JSON.stringify(simplified)).digest('base64url');
  if (shapeMap.has(key)) return shapeMap.get(key);
  const id = shapes.length;
  shapes.push(simplified);
  shapeMap.set(key, id);
  return id;
}

function intersects([x0, y0, x1, y1]) {
  return !(x1 < BOUNDS.x0 || x0 > BOUNDS.x1 || y1 < BOUNDS.y0 || y0 > BOUNDS.y1);
}

function convertSnapshot(snap, dynKey) {
  const polities = [];
  const source = Array.isArray(snap?.polities) ? snap.polities : [];
  for (const p of source) {
    if (!p?.title || !p?.shape) continue;
    const role = p.role || 'neighbor';
    if (!['main', 'rival', 'protectorate', 'neighbor'].includes(role)) continue;
    const bb = geometryBBox(p.shape);
    if (!intersects(bb)) continue;
    if (role === 'neighbor' && (bb[2] - bb[0]) * (bb[3] - bb[1]) < 2.2) continue;
    const s = simplifyGeometry(p.shape, role === 'neighbor' ? 0.12 : 0.055);
    if (!s) continue;
    const a = Array.isArray(p.anchor) ? p.anchor.map(v => Math.round(v * 100) / 100) : null;
    if (!a) continue;
    polities.push({ n: p.title, r: role, a, s: internShape(s), t: p.tint || null });
  }
  // main first, then rivals, protectorates, neighbors
  const order = { main: 0, rival: 1, protectorate: 2, neighbor: 3 };
  polities.sort((a, b) => order[a.r] - order[b.r]);
  return {
    caption: snap?.caption || '',
    polities,
  };
}

const dynasties = [];
for (const d of dynastiesRaw) {
  let phases = [];
  if (d.key === 'prc') {
    const snap = snapshots['s_roc_d'];
    const conv = convertSnapshot(snap, d.key);
    conv.polities = conv.polities.map(p => p.r === 'main' ? { ...p, n: '中华人民共和国' } : p);
    phases = [{ start: 1949, until: 2025, caption: '1949 — 今 · 中华人民共和国成立，改革开放与香港、澳门回归', overview: '', snapshot: conv }];
  } else {
    let cursor = d.fromYear;
    for (const ph of (d.phases || [])) {
      const until = ph.until;
      const snap = snapshots[ph.snap];
      if (!snap) continue;
      const conv = convertSnapshot(snap, d.key);
      phases.push({
        start: cursor,
        until,
        caption: snap.caption || '',
        overview: ph.overview || '',
        snapshot: conv,
      });
      cursor = until;
    }
    if (!phases.length) {
      const fallback = snapshots[`s_${d.key}`];
      if (fallback) {
        phases.push({ start: d.fromYear, until: d.toYear, caption: fallback.caption || '', overview: '', snapshot: convertSnapshot(fallback, d.key) });
      }
    }
  }
  if (!phases.length) continue;

  const milestones = (d.milestones || [])
    .filter(m => Number.isFinite(m.year) && Array.isArray(m.coord))
    .map(m => ({
      y: m.year,
      t: String(m.headline || '').slice(0, 180),
      s: String(m.site || '').slice(0, 60),
      c: m.coord.map(v => Math.round(v * 100) / 100),
      m: !!m.isMapChange,
    }));

  dynasties.push({
    key: d.key,
    title: d.title,
    badge: d.badge,
    from: d.fromYear,
    to: d.key === 'prc' ? 2025 : d.toYear,
    focus: d.focusYear,
    tint: d.tint,
    seat: d.seat,
    summary: d.summary,
    phases,
    milestones,
  });
}

// ---- Base map ----
function convertLineString(geom, tol = 0.04) {
  const lines = geom.type === 'LineString' ? [geom.coordinates] : geom.type === 'MultiLineString' ? geom.coordinates : [];
  const out = [];
  for (const line of lines) {
    if (line.length < 2) continue;
    const bb = geometryBBox({ coordinates: [line] });
    if (!intersects(bb)) continue;
    const simp = rdp(line, tol);
    if (simp.length < 2) continue;
    out.push(simp.flatMap(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]));
  }
  return out;
}

const land = [];
const coast = [];
const rivers = [];
const lakes = [];

const landSrc = JSON.parse(fs.readFileSync(landPath, 'utf8'));
for (const f of landSrc.features) {
  const bb = geometryBBox(f.geometry);
  if (!intersects(bb)) continue;
  const s = simplifyGeometry(f.geometry, 0.10);
  if (s) land.push(...s);
}

const coastSrc = JSON.parse(fs.readFileSync(coastPath, 'utf8'));
for (const f of coastSrc.features) {
  for (const line of convertLineString(f.geometry, 0.05)) coast.push(line);
}

const riverSrc = JSON.parse(fs.readFileSync(riverPath, 'utf8'));
const riverSeen = new Set();
for (const f of riverSrc.features) {
  const name = f.properties?.name || '';
  const rank = Number(f.properties?.scalerank ?? 6);
  if (rank > 6) continue;
  const key = name + '|' + rank;
  if (riverSeen.has(key)) continue;
  const lines = convertLineString(f.geometry, 0.045);
  if (!lines.length) continue;
  riverSeen.add(key);
  rivers.push({ n: name, r: rank, d: lines });
}

const lakeSrc = JSON.parse(fs.readFileSync(lakePath, 'utf8'));
for (const f of lakeSrc.features) {
  const bb = geometryBBox(f.geometry);
  if (!intersects(bb)) continue;
  const s = simplifyGeometry(f.geometry, 0.06);
  if (s) lakes.push({ n: f.properties?.name || '', d: s });
}

const data = {
  meta: {
    from: dynasties[0].from,
    to: 2025,
    source: 'Adapted from 江山时序 (DeanChensj, GPL-3.0); base map Natural Earth (public domain)',
    generated: new Date().toISOString().slice(0, 10),
  },
  dynasties,
  shapes,
  base: { land, coast, rivers, lakes },
};

fs.writeFileSync(`${ROOT}/atlas-data.json`, JSON.stringify(data));
const mb = n => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log('dynasties', dynasties.length, 'phases', dynasties.reduce((a, d) => a + d.phases.length, 0));
console.log('shapes', shapes.length, 'land', land.length, 'coast', coast.length, 'rivers', rivers.length, 'lakes', lakes.length);
console.log('size', mb(fs.statSync(`${ROOT}/atlas-data.json`).size));
for (const d of dynasties) {
  const p = d.phases;
  console.log(d.key, d.from, '-', d.to, 'phases', p.length, 'polities', p[0]?.snapshot.polities.length, 'miles', d.milestones.length);
}
