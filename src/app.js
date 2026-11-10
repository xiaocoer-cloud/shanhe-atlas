(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     山河卷 · 中国历史疆域图
     Territory outlines adapted from 江山时序 (GPL-3.0).
     Base map: Natural Earth (public domain).
     ───────────────────────────────────────────────────────────── */

  const D = window.__ATLAS_DATA__;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1440, H = 900;
  const LON0 = 58, LON1 = 150, LAT0 = 7, LAT1 = 58;
  const START_YEAR = D.meta.from;
  const END_YEAR = 2025;
  const N_ERAS = D.dynasties.length;

  const ERA_EN = {
    zhanguo: 'WARING STATES', qin: 'QIN', xihan: 'WESTERN HAN', donghan: 'EASTERN HAN',
    sanguo: 'THREE KINGDOMS', xijin: 'WESTERN JIN', dongjin: 'EASTERN JIN', nanbei: 'NORTH & SOUTH',
    sui: 'SUI', tang: 'TANG', wudai: 'FIVE DYNASTIES', beisong: 'NORTHERN SONG',
    nansong: 'SOUTHERN SONG', yuan: 'YUAN', ming: 'MING', qing: 'QING', roc: 'REPUBLIC', prc: 'PRC'
  };
  ERA_EN.zhanguo = 'WARRING STATES';

  const CAPITALS = {
    zhanguo: [{ n: '洛阳', s: '周王城', c: [112.45, 34.62] }],
    qin: [{ n: '咸阳', s: '秦都', c: [108.71, 34.33] }],
    xihan: [{ n: '长安', s: '汉都', c: [108.94, 34.34] }],
    donghan: [{ n: '洛阳', s: '汉都', c: [112.45, 34.62] }],
    sanguo: [
      { n: '洛阳', s: '魏都', c: [112.45, 34.62] },
      { n: '成都', s: '蜀都', c: [104.07, 30.67] },
      { n: '建业', s: '吴都', c: [118.80, 32.06] }
    ],
    xijin: [{ n: '洛阳', s: '晋都', c: [112.45, 34.62] }],
    dongjin: [{ n: '建康', s: '晋都', c: [118.80, 32.06] }],
    nanbei: [
      { n: '洛阳', s: '北魏', c: [112.45, 34.62] },
      { n: '建康', s: '南朝', c: [118.80, 32.06] }
    ],
    sui: [{ n: '大兴', s: '隋都', c: [108.94, 34.34] }],
    tang: [{ n: '长安', s: '唐都', c: [108.94, 34.34] }],
    wudai: [{ n: '开封', s: '后周', c: [114.31, 34.80] }],
    beisong: [{ n: '开封', s: '宋都', c: [114.31, 34.80] }],
    nansong: [{ n: '临安', s: '宋行在', c: [120.15, 30.27] }],
    yuan: [{ n: '大都', s: '元都', c: [116.40, 39.90] }],
    ming: [{ n: '北京', s: '明都', c: [116.40, 39.90] }],
    qing: [{ n: '北京', s: '清都', c: [116.40, 39.90] }],
    roc: [{ n: '南京', s: '民国', c: [118.80, 32.06] }],
    prc: [{ n: '北京', s: '首都', c: [116.40, 39.90] }]
  };

  const WALLS = {
    qin: [
      [98.3, 39.7], [100.6, 40.2], [102.8, 39.4], [104.8, 40.2], [106.9, 40.4],
      [109.1, 40.6], [111.1, 40.5], [113.0, 40.7], [115.0, 40.6], [117.0, 40.4],
      [119.0, 40.2], [121.0, 40.0], [123.0, 40.2], [125.0, 41.0]
    ],
    xihan: [
      [97.0, 39.9], [99.5, 40.5], [101.8, 39.8], [104.2, 40.6], [106.5, 40.9],
      [108.8, 41.0], [111.0, 40.8], [113.0, 41.0], [115.0, 40.9], [117.2, 40.7],
      [119.2, 40.5], [121.0, 40.2], [123.0, 40.4], [125.2, 41.2]
    ],
    ming: [
      [97.5, 39.8], [100.0, 40.4], [102.5, 39.7], [104.8, 40.4], [106.8, 40.6],
      [109.0, 40.7], [111.0, 40.5], [113.0, 40.7], [115.0, 40.6], [117.0, 40.4],
      [119.0, 40.1], [120.9, 39.9], [122.5, 40.1], [124.0, 40.4]
    ]
  };

  const GEO_LABELS = [
    { t: '黄　海', c: [123.4, 34.6], cls: 'sea' },
    { t: '东　海', c: [126.5, 27.6], cls: 'sea' },
    { t: '南　海', c: [114.2, 16.1], cls: 'sea' },
    { t: '日 本 海', c: [135.4, 40.4], cls: 'sea' },
    { t: '渤　海', c: [119.7, 38.9], cls: 'sea' },
    { t: '青藏高原', c: [88.5, 33.2], cls: 'terrain' },
    { t: '塔克拉玛干沙漠', c: [82.4, 39.4], cls: 'terrain' },
    { t: '蒙古高原', c: [105.0, 46.4], cls: 'terrain' },
    { t: '黄土高原', c: [108.8, 36.7], cls: 'terrain' },
    { t: '云贵高原', c: [104.5, 25.2], cls: 'terrain' },
    { t: '东北平原', c: [125.4, 46.2], cls: 'terrain' },
    { t: '黄河', c: [110.2, 37.9], cls: 'river-label' },
    { t: '长江', c: [112.6, 30.6], cls: 'river-label' }
  ];

  const ROLE_LABEL = { main: '主政权', rival: '并立政权', protectorate: '都护 / 羁縻', neighbor: '四邻' };
  const BAND_NAME = { zhanguo: '战国', qin: '秦', xihan: '西汉', donghan: '东汉', sanguo: '三国', xijin: '西晋', dongjin: '东晋', nanbei: '南北朝', sui: '隋', tang: '唐', wudai: '五代', beisong: '北宋', nansong: '南宋', yuan: '元', ming: '明', qing: '清', roc: '民国', prc: '现代' };

  /* ── projection ─────────────────────────────────────────────── */
  function merc(lat) {
    return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  }
  const MY0 = merc(LAT1), MY1 = merc(LAT0);
  function project(lon, lat) {
    return [
      ((lon - LON0) / (LON1 - LON0)) * W,
      ((MY0 - merc(lat)) / (MY0 - MY1)) * H
    ];
  }
  function projectPair(c) { return project(c[0], c[1]); }

  function ringPath(ring) {
    let d = '';
    for (let i = 0; i < ring.length; i += 2) {
      const p = project(ring[i], ring[i + 1]);
      d += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    return d ? d + 'Z' : '';
  }
  function polygonPath(poly) {
    let d = '';
    for (const ring of poly) d += ringPath(ring);
    return d;
  }
  function shapePath(shape) {
    let d = '';
    for (const poly of shape) for (const ring of poly) d += ringPath(ring);
    return d;
  }
  function linePath(line) {
    let d = '';
    for (let i = 0; i < line.length; i += 2) {
      const p = project(line[i], line[i + 1]);
      d += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    return d;
  }

  const shapePathCache = new Map();
  const shapeBBoxCache = new Map();
  function getShapePath(id) {
    if (!shapePathCache.has(id)) shapePathCache.set(id, shapePath(D.shapes[id] || []));
    return shapePathCache.get(id);
  }
  function getShapeBBox(id) {
    if (shapeBBoxCache.has(id)) return shapeBBoxCache.get(id);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const shape = D.shapes[id] || [];
    for (const poly of shape) for (const ring of poly) {
      for (let i = 0; i < ring.length; i += 2) {
        const p = project(ring[i], ring[i + 1]);
        if (p[0] < x0) x0 = p[0];
        if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[1] > y1) y1 = p[1];
      }
    }
    const b = { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
    shapeBBoxCache.set(id, b);
    return b;
  }

  /* ── utils ──────────────────────────────────────────────────── */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function fmtShort(y) { return y < 0 ? '前' + (-y) : String(y); }
  function fmtFull(y) { return y < 0 ? '公元前 ' + (-y) + ' 年' : '公元 ' + y + ' 年'; }
  function fmtSpan(a, b) { return fmtShort(a) + ' — ' + fmtShort(b); }
  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return [140, 106, 78];
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbString(hex) { return hexToRgb(hex).join(','); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ── DOM ────────────────────────────────────────────────────── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app');
  const mapPanel = $('#map-panel');
  const svg = $('#map-svg');
  const mapRoot = $('#map-root');
  const polityLayer = $('#polity-layer');
  const labelLayer = $('#label-layer');
  const capitalLayer = $('#capital-layer');
  const eventLayer = $('#event-layer');
  const wallLayer = $('#wall-layer');
  const track = $('#track');
  const trackBands = $('#track-bands');
  const trackTicks = $('#track-ticks');
  const trackHit = $('#track-hit');
  const trackHover = $('#track-hover');
  const hoverBubble = $('#hover-bubble');
  const playhead = $('#playhead');
  const playheadBubble = $('#playhead-bubble');
  const tooltip = $('#map-tooltip');
  const mapHint = $('#map-hint');
  const playBtn = $('#play-btn');
  const layerPop = $('#layers-pop');
  const layersBtn = $('#layers-btn');
  const aboutModal = $('#about-modal');

  /* ── state ──────────────────────────────────────────────────── */
  const state = {
    year: 1000,
    dynIndex: -1,
    phaseIndex: -1,
    phase: null,
    polities: [],
    baseView: { x: 0, y: 0, w: W, h: H },
    view: { x: 0, y: 0, w: W, h: H },
    zoom: 1,
    scaleMode: 'era',
    playing: false,
    playPct: 0,
    layers: { rivers: true, neighbors: true, events: true, wall: true },
    pan: null,
    flyRaf: 0,
    hintGone: false,
    labelTimer: 0
  };

  /* ── base map ───────────────────────────────────────────────── */
  function buildBase() {
    const land = $('#land');
    const d = D.base.land.map(polygonPath).join('');
    const landPath = svgEl('path', { d });
    land.appendChild(landPath);

    const coastD = D.base.coast.map(linePath).join('');
    land.appendChild(svgEl('path', { d: coastD, class: 'land-outline', fill: 'none' }));

    const lakeD = D.base.lakes.map(x => shapePath(x.d)).join('');
    $('#lakes').appendChild(svgEl('path', { d: lakeD, 'fill-rule': 'evenodd' }));

    const groups = { r1: [], r2: [], r3: [] };
    for (const r of D.base.rivers) {
      const dstr = r.d.map(linePath).join('');
      if (!dstr) continue;
      (r.r <= 2 ? groups.r1 : r.r <= 4 ? groups.r2 : groups.r3).push(dstr);
    }
    const rivers = $('#rivers');
    for (const k of ['r1', 'r2', 'r3']) {
      if (!groups[k].length) continue;
      rivers.appendChild(svgEl('path', { d: groups[k].join(''), class: k }));
    }

    buildGraticule();
    buildGeoLabels();
  }

  function buildGraticule() {
    const g = $('#graticule');
    for (let lon = 60; lon <= 150; lon += 10) {
      const a = project(lon, LAT1), b = project(lon, LAT0);
      g.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
    }
    for (let lat = 10; lat <= 50; lat += 10) {
      const a = project(LON0, lat), b = project(LON1, lat);
      g.appendChild(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
    }
  }

  function buildGeoLabels() {
    const g = $('#geo-labels');
    for (const item of GEO_LABELS) {
      const p = projectPair(item.c);
      const t = svgEl('text', { x: p[0], y: p[1], class: item.cls, 'text-anchor': 'middle' });
      t.textContent = item.t;
      g.appendChild(t);
    }
  }

  /* ── view / zoom / pan ──────────────────────────────────────── */
  function computeBaseView() {
    const cw = mapPanel.clientWidth || 1000;
    const ch = mapPanel.clientHeight || 650;
    const aspect = cw / ch;
    let vw, vh;
    if (aspect >= W / H) { vw = W; vh = W / aspect; }
    else { vh = H; vw = H * aspect; }
    const focus = 1;
    vw *= focus; vh *= focus;
    let x = 745 - vw / 2;
    let y = 442 - vh / 2;
    x = clamp(x, 0, W - vw);
    y = clamp(y, 0, H - vh);
    return { x, y, w: vw, h: vh };
  }

  function clampView(v) {
    const nw = clamp(v.w, state.baseView.w * 0.30, state.baseView.w * 1.04);
    const nh = nw * (state.baseView.h / state.baseView.w);
    let x = clamp(v.x, 0, W - nw);
    let y = clamp(v.y, 0, H - nh);
    return { x, y, w: nw, h: nh };
  }

  function applyView() {
    svg.setAttribute('viewBox', `${state.view.x.toFixed(2)} ${state.view.y.toFixed(2)} ${state.view.w.toFixed(2)} ${state.view.h.toFixed(2)}`);
    state.zoom = state.baseView.w / state.view.w;
    scheduleLabels();
  }

  function resetView(animate) {
    if (state.flyRaf) cancelAnimationFrame(state.flyRaf);
    const target = { ...state.baseView };
    if (!animate) { state.view = target; applyView(); return; }
    flyTo(target);
  }

  function flyTo(target, duration = 480) {
    if (state.flyRaf) cancelAnimationFrame(state.flyRaf);
    const from = { ...state.view };
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      const k = Math.min(1, (now - t0) / duration);
      const e = ease(k);
      state.view = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e
      };
      applyView();
      if (k < 1) state.flyRaf = requestAnimationFrame(frame);
      else { state.flyRaf = 0; scheduleLabels(0); }
    }
    state.flyRaf = requestAnimationFrame(frame);
  }

  function zoomAt(factor, cx, cy) {
    const rect = svg.getBoundingClientRect();
    const px = clamp((cx - rect.left) / rect.width, 0, 1);
    const py = clamp((cy - rect.top) / rect.height, 0, 1);
    const mx = state.view.x + px * state.view.w;
    const my = state.view.y + py * state.view.h;
    const nw = clamp(state.view.w * factor, state.baseView.w * 0.30, state.baseView.w * 1.04);
    const nh = nw * (state.baseView.h / state.baseView.w);
    const next = { x: mx - px * nw, y: my - py * nh, w: nw, h: nh };
    state.view = clampView(next);
    applyView();
  }

  function scheduleLabels(delay = 90) {
    clearTimeout(state.labelTimer);
    state.labelTimer = setTimeout(() => renderLabels(), delay);
  }

  function fitMap() {
    state.baseView = computeBaseView();
    state.view = { ...state.baseView };
    applyView();
  }

  /* ── history lookup ─────────────────────────────────────────── */
  function findDynastyIndex(year) {
    let idx = 0;
    for (let i = 0; i < N_ERAS; i++) {
      if (year >= D.dynasties[i].from) idx = i;
    }
    return idx;
  }

  function findPhaseIndex(dyn, year) {
    const ps = dyn.phases;
    for (let i = 0; i < ps.length; i++) {
      if (year < ps[i].until || i === ps.length - 1) return i;
    }
    return ps.length - 1;
  }

  function yearToPct(year) {
    if (state.scaleMode === 'era') {
      const i = findDynastyIndex(year);
      const d = D.dynasties[i];
      const end = i === N_ERAS - 1 ? END_YEAR : d.to;
      const frac = clamp((year - d.from) / Math.max(1, end - d.from), 0, 1);
      return ((i + frac) / N_ERAS) * 100;
    }
    return ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
  }

  function pctToYear(pct) {
    pct = clamp(pct, 0, 100);
    if (state.scaleMode === 'era') {
      const p = (pct / 100) * N_ERAS;
      let i = Math.floor(p);
      if (i >= N_ERAS) { i = N_ERAS - 1; }
      const d = D.dynasties[i];
      const frac = clamp(p - i, 0, 1);
      const end = i === N_ERAS - 1 ? END_YEAR : d.to;
      return Math.round(d.from + frac * (end - d.from));
    }
    return Math.round(START_YEAR + (pct / 100) * (END_YEAR - START_YEAR));
  }

  /* ── main selection ─────────────────────────────────────────── */
  function selectYear(rawYear, options) {
    options = options || {};
    const year = clamp(Math.round(rawYear), START_YEAR, END_YEAR);
    const di = findDynastyIndex(year);
    const d = D.dynasties[di];
    const pi = findPhaseIndex(d, year);
    const ph = d.phases[pi];
    const eraChanged = di !== state.dynIndex;
    const phaseChanged = eraChanged || pi !== state.phaseIndex || !state.phase;

    state.year = year;
    state.dynIndex = di;
    state.phaseIndex = pi;
    state.phase = ph;

    if (eraChanged) applyEra(d);
    if (phaseChanged || options.force) {
      state.polities = ph.snapshot.polities || [];
      renderPolities();
      renderLabels();
      renderCapitals();
      renderWall(d);
      renderLegend();
      updatePhaseCard(d, pi);
    }

    updateYearReadout(d, ph);
    updateEvents(d);
    updatePlayhead();
    updateActiveBand();
    updateEventPins();
  }

  function applyEra(d) {
    const idx = state.dynIndex;
    const rgb = hexToRgb(d.tint);
    app.style.setProperty('--accent', d.tint);
    app.style.setProperty('--accent-rgb', rgb.join(','));

    $('#era-index').textContent = 'ERA ' + pad2(idx + 1) + ' / ' + pad2(N_ERAS);
    $('#era-span').textContent = fmtSpan(d.from, d.to);
    const title = $('#era-title');
    title.textContent = d.title;
    title.classList.toggle('long', d.title.length > 4);
    title.classList.toggle('xlong', d.title.length > 5);
    $('#era-badge').textContent = d.badge;
    $('#era-en').textContent = ERA_EN[d.key] || '';
    $('#era-summary').textContent = String(d.summary || '')
      .replace(/（拖动滑块[^）]*）/g, '')
      .replace(/（拖动底部时间轴[^）]*）/g, '')
      .replace(/拖动底部时间轴[^。]*。/g, '')
      .replace(/拖动滑块[^。]*。/g, '')
      .trim();
    $('#meta-capital').textContent = d.key === 'zhanguo' ? '洛阳 · 咸阳' : ((CAPITALS[d.key] || []).map(c => c.n).join(' · ') || d.seat || '—');
    $('#cartouche-title').textContent = d.title + ' · ' + (d.key === 'zhanguo' ? '天下形势' : d.key === 'sanguo' ? '三分天下' : '疆域图');
    $('#watermark').innerHTML = '';
    const ch = d.badge === '现代' ? '今' : (d.badge && d.badge.length <= 3 ? d.badge : d.title.charAt(0));
    const watermarkText = svgEl('text', { x: 1268, y: 836, 'text-anchor': 'end' });
    watermarkText.textContent = ch;
    $('#watermark').appendChild(watermarkText);
    document.title = '山河卷 · ' + d.title + ' · 中国历史疆域图';
  }

  function updatePhaseCard(d, pi) {
    const ph = d.phases[pi];
    const powers = state.polities.filter(p => p.r !== 'neighbor').length;
    $('#phase-count').textContent = pad2(pi + 1) + ' / ' + pad2(d.phases.length);
    $('#phase-caption').textContent = ph.overview || ph.caption || '—';
    $('#phase-bar-fill').style.width = (((pi + 1) / d.phases.length) * 100).toFixed(1) + '%';
    $('#meta-powers').textContent = String(powers);
    $('#meta-capital').textContent = d.key === 'zhanguo' ? '洛阳 · 咸阳' : ((CAPITALS[d.key] || []).map(c => c.n).join(' · ') || d.seat || '—');
  }

  function updateYearReadout(d, ph) {
    const y = state.year;
    $('#year-prefix').textContent = y < 0 ? '公元前' : '公元';
    $('#year-big').textContent = String(Math.abs(y));
    $('#year-era').textContent = d.title.length > 5 ? d.badge : d.title;
    $('#track-start').textContent = fmtShort(START_YEAR);
    $('#track-end').textContent = fmtShort(END_YEAR);
    $('#track-foot-mid').textContent = fmtFull(START_YEAR) + ' — ' + fmtFull(END_YEAR) + ' · ' + N_ERAS + ' 个历史时期 · ' + totalStages() + ' 幅疆域';
    $('#cartouche-sub').textContent = fmtFull(y);
    trackHit.setAttribute('aria-valuenow', String(y));
    trackHit.setAttribute('aria-valuetext', fmtFull(y));
    const pct = yearToPct(y);
    playhead.style.left = pct.toFixed(4) + '%';
    playheadBubble.textContent = fmtShort(y);
    playhead.classList.toggle('bubble-left', pct < 4);
    playhead.classList.toggle('bubble-right', pct > 96);
  }

  function totalStages() {
    return D.dynasties.reduce((a, d) => a + d.phases.length, 0);
  }

  function updatePlayhead() {
    const pct = yearToPct(state.year);
    playhead.style.left = pct.toFixed(4) + '%';
    playheadBubble.textContent = fmtShort(state.year);
    playhead.classList.toggle('bubble-left', pct < 4);
    playhead.classList.toggle('bubble-right', pct > 96);
  }

  /* ── map rendering ──────────────────────────────────────────── */
  function renderPolities() {
    if (!state.polities.length) return;

    const old = polityLayer.cloneNode(true);
    if (old.childNodes.length) {
      old.removeAttribute('id');
      old.classList.add('polity-ghost');
      old.style.pointerEvents = 'none';
      mapRoot.insertBefore(old, polityLayer);
      setTimeout(() => old.remove(), 560);
    }

    polityLayer.innerHTML = '';
    const order = { neighbor: 0, protectorate: 1, rival: 2, main: 3 };
    const list = state.polities.slice().sort((a, b) => (order[a.r] || 0) - (order[b.r] || 0));

    for (const p of list) {
      const path = svgEl('path', {
        d: getShapePath(p.s),
        class: 'polity polity-' + p.r,
        'fill-rule': 'evenodd'
      });
      path.style.setProperty('--tint', p.t || '#8b6a4a');
      path.dataset.name = p.n;
      path.dataset.role = p.r;
      polityLayer.appendChild(path);
    }
  }

  function shortName(name) {
    return String(name || '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace('中华人民共和国', '中国').trim();
  }

  function renderLabels() {
    labelLayer.innerHTML = '';
    const placed = [];
    const v = state.view;
    const zoomScale = clamp(state.baseView.w / state.view.w, 0.6, 3.2);
    const sizeScale = clamp(1 / zoomScale, 0.45, 1.15);

    const roleWeight = { main: 0, rival: 1, protectorate: 2, neighbor: 3 };
    const list = state.polities.slice().sort((a, b) => {
      const rw = (roleWeight[a.r] || 0) - (roleWeight[b.r] || 0);
      if (rw) return rw;
      const ba = getShapeBBox(a.s), bb = getShapeBBox(b.s);
      return (bb.w * bb.h) - (ba.w * ba.h);
    });

    for (const p of list) {
      if (p.r === 'neighbor' && (!state.layers.neighbors || state.zoom < 1.55)) continue;
      const anchor = projectPair(p.a);
      if (anchor[0] < v.x - 40 || anchor[0] > v.x + v.w + 40 || anchor[1] < v.y - 30 || anchor[1] > v.y + v.h + 30) continue;

      const baseSize = p.r === 'main' ? 29 : p.r === 'rival' ? 14.5 : p.r === 'protectorate' ? 10.5 : 9.5;
      const fs = Math.max(7, baseSize * sizeScale);
      let text = shortName(p.n);
      if (!text) continue;
      if (text.length > 12) text = text.slice(0, 11) + '…';

      const charW = p.r === 'main' ? 1.18 : 1.05;
      const tw = text.length * fs * charW;
      const th = fs * 1.5;
      const candidates = [
        [0, 0], [0, -th * 1.35], [0, th * 1.35],
        [-tw * 0.45, 0], [tw * 0.45, 0],
        [-tw * 0.35, -th * 1.3], [tw * 0.35, -th * 1.3],
        [-tw * 0.35, th * 1.3], [tw * 0.35, th * 1.3]
      ];

      let chosen = null;
      for (const [dx, dy] of candidates) {
        const x = anchor[0] + dx, y = anchor[1] + dy;
        const box = { x0: x - tw / 2 - 3, y0: y - th / 2 - 2, x1: x + tw / 2 + 3, y1: y + th / 2 + 2 };
        if (box.x0 < v.x + 5 || box.x1 > v.x + v.w - 5 || box.y0 < v.y + 4 || box.y1 > v.y + v.h - 4) continue;
        if (placed.some(q => !(box.x1 < q.x0 || box.x0 > q.x1 || box.y1 < q.y0 || box.y0 > q.y1))) continue;
        chosen = { x, y, box, dx, dy };
        break;
      }
      if (!chosen) {
        if (p.r === 'main' || p.r === 'rival') {
          const x = clamp(anchor[0], v.x + tw / 2 + 6, v.x + v.w - tw / 2 - 6);
          const y = clamp(anchor[1], v.y + th, v.y + v.h - th);
          chosen = { x, y, box: { x0: x - tw / 2, y0: y - th / 2, x1: x + tw / 2, y1: y + th / 2 }, dx: 0, dy: 0, forced: true };
        } else continue;
      }
      placed.push(chosen.box);

      const g = svgEl('g', { class: 'map-label role-' + p.r });
      g.dataset.name = p.n;
      if (!chosen.forced && Math.hypot(chosen.dx || 0, chosen.dy || 0) > fs * 0.6 && p.r !== 'main') {
        g.appendChild(svgEl('line', {
          x1: anchor[0].toFixed(1), y1: anchor[1].toFixed(1),
          x2: chosen.x.toFixed(1), y2: (chosen.y + fs * 0.55).toFixed(1),
          class: 'label-leader'
        }));
      }
      if (p.r === 'main') {
        g.appendChild(svgEl('line', {
          x1: chosen.x - Math.min(tw * 0.34, 24), y1: chosen.y - fs * 0.78,
          x2: chosen.x + Math.min(tw * 0.34, 24), y2: chosen.y - fs * 0.78,
          class: 'label-rule'
        }));
      }
      const t = svgEl('text', { x: chosen.x, y: chosen.y });
      t.textContent = text;
      g.appendChild(t);
      labelLayer.appendChild(g);
    }
  }

  function renderCapitals() {
    capitalLayer.innerHTML = '';
    const dyn = D.dynasties[state.dynIndex];
    if (!dyn || dyn.key === 'zhanguo') return;
    const caps = CAPITALS[dyn.key] || [];
    const v = state.view;
    for (const cap of caps) {
      const p = projectPair(cap.c);
      if (p[0] < v.x - 30 || p[0] > v.x + v.w + 30 || p[1] < v.y - 30 || p[1] > v.y + v.h + 30) continue;
      const g = svgEl('g', { class: 'capital', transform: `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})` });
      g.appendChild(svgEl('circle', { class: 'ring', r: 10 }));
      g.appendChild(svgEl('circle', { class: 'dot', r: 4.6 }));
      g.appendChild(svgEl('circle', { class: 'core', r: 1.8 }));
      const east = cap.c[0] > 118;
      const tx = east ? -12 : 12;
      const text = svgEl('text', { x: tx, y: -7, 'text-anchor': east ? 'end' : 'start' });
      text.textContent = cap.n;
      g.appendChild(text);
      const kicker = svgEl('text', { x: tx, y: 7, 'text-anchor': east ? 'end' : 'start', class: 'cap-kicker' });
      kicker.textContent = cap.s;
      g.appendChild(kicker);
      capitalLayer.appendChild(g);
    }
  }

  function renderWall(d) {
    wallLayer.innerHTML = '';
    if (!state.layers.wall || !WALLS[d.key]) return;
    const pts = WALLS[d.key].map(c => projectPair(c));
    let line = '';
    pts.forEach((p, i) => { line += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); });
    wallLayer.appendChild(svgEl('path', { d: line, class: 'halo' }));
    wallLayer.appendChild(svgEl('path', { d: line }));
    const last = pts[pts.length - 1];
    const t = svgEl('text', { x: last[0] - 18, y: last[1] + 18, 'text-anchor': 'end' });
    t.textContent = '长 城';
    wallLayer.appendChild(t);
  }

  function eventCandidates() {
    const d = D.dynasties[state.dynIndex];
    const y = state.year;
    return d.milestones.filter(m => Math.abs(m.y - y) <= 55)
      .sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))
      .slice(0, 4);
  }

  function renderEvents() {
    eventLayer.innerHTML = '';
    if (state.dynIndex < 0 || !state.layers.events) return;
    const v = state.view;
    const evs = eventCandidates().filter(e => e.c).slice(0, 4);
    let evIndex = -1;
    for (const ev of evs) {
      evIndex += 1;
      const p = projectPair(ev.c);
      if (p[0] < v.x - 20 || p[0] > v.x + v.w + 20 || p[1] < v.y - 20 || p[1] > v.y + v.h + 20) continue;
      const active = evIndex === 0 && Math.abs(ev.y - state.year) <= 25;
      const g = svgEl('g', {
        class: 'event-pin' + (active ? ' active' : ''),
        transform: `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`
      });
      g.dataset.year = ev.y;
      g.dataset.headline = ev.t;
      g.dataset.site = ev.s;
      g.appendChild(svgEl('circle', { class: 'halo', r: 10 }));
      g.appendChild(svgEl('path', { class: 'cross', d: 'M-6 0h12M0 -6v12', fill: 'none' }));
      g.appendChild(svgEl('circle', { class: 'dot', r: 2.8 }));
      const label = svgEl('text', { x: 10, y: -8 });
      label.textContent = fmtShort(ev.y) + (ev.s ? ' · ' + ev.s.split('·')[0].trim().slice(0, 8) : '');
      g.appendChild(label);
      eventLayer.appendChild(g);
    }
  }

  function updateEventPins() {
    renderEvents();
  }

  /* ── sidebar events & legend ────────────────────────────────── */
  function updateEvents(d) {
    const evs = d.milestones.slice().sort((a, b) => a.y - b.y);
    const year = state.year;
    const before = evs.filter(e => e.y <= year).slice(-2);
    const after = evs.filter(e => e.y > year).slice(0, 2);
    let pick = before.concat(after);
    if (pick.length < 4) {
      pick = evs.slice().sort((a, b) => Math.abs(a.y - year) - Math.abs(b.y - year)).slice(0, 4).sort((a, b) => a.y - b.y);
    }
    $('#events').innerHTML = '';
    if (!pick.length) {
      $('#events').innerHTML = '<div class="event-empty">暂未收录此期纪事</div>';
      return;
    }
    for (const ev of pick) {
      const btn = document.createElement('button');
      btn.className = 'event' + (Math.abs(ev.y - year) <= 1 ? ' active' : '');
      btn.dataset.year = ev.y;
      btn.innerHTML = '<span class="event-year">' + esc(fmtShort(ev.y)) + '</span>' +
        '<span class="event-body"><span class="event-head">' + esc(ev.t) + '</span>' +
        (ev.s ? '<span class="event-site">' + esc(ev.s) + '</span>' : '') + '</span>';
      btn.addEventListener('click', () => {
        stopPlay();
        selectYear(ev.y);
      });
      $('#events').appendChild(btn);
    }
  }

  function renderLegend() {
    const box = $('#legend');
    box.innerHTML = '';
    const list = state.polities.filter(p => p.r !== 'neighbor');
    const block = box.closest('.legend-block');
    if (block) block.style.display = list.length <= 1 ? 'none' : '';
    if (!list.length) {
      box.innerHTML = '<div class="event-empty">此期无并立政权记录</div>';
      return;
    }
    list.forEach((p, i) => {
      const row = document.createElement('button');
      row.className = 'legend-row ' + p.r;
      const color = p.r === 'main' || p.r === 'protectorate' ? 'var(--accent)' : (p.t || '#8b6a4a');
      row.innerHTML = '<span class="legend-swatch" style="background:' + esc(color) + ';color:' + esc(color) + '"></span>' +
        '<span class="legend-name">' + esc(shortName(p.n)) + '</span>' +
        '<span class="legend-role">' + esc(ROLE_LABEL[p.r] || '') + '</span>';
      row.addEventListener('pointerenter', () => highlightPolity(p.n));
      row.addEventListener('pointerleave', () => highlightPolity(null));
      row.addEventListener('click', () => {
        const idx = state.polities.indexOf(p);
        focusPolity(idx);
      });
      box.appendChild(row);
    });
    const neighbors = state.polities.filter(p => p.r === 'neighbor').length;
    $('#legend-note').textContent = neighbors ? '四邻 ' + neighbors + ' 部 · 悬停高亮 · 点击聚焦' : '悬停高亮 · 点击聚焦';
  }

  function highlightPolity(name) {
    for (const path of polityLayer.children) {
      if (!name) path.classList.remove('dim');
      else path.classList.toggle('dim', path.dataset.name !== name);
    }
  }

  function focusPolity(index) {
    const p = state.polities[index];
    if (!p) return;
    const b = getShapeBBox(p.s);
    if (!Number.isFinite(b.x0)) return;
    const aspect = state.baseView.w / state.baseView.h;
    let w = Math.max(b.w * 1.9, state.baseView.w * 0.24);
    let h = w / aspect;
    if (b.h * 1.8 > h) { h = b.h * 1.8; w = h * aspect; }
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    const next = clampView({ x: cx - w / 2, y: cy - h / 2, w, h });
    flyTo(next);
    showTip('<b>' + esc(p.n) + '</b><span>' + esc(ROLE_LABEL[p.r] || '') + ' · 已聚焦</span>', window.innerWidth / 2, 120, 1500);
  }

  /* ── tooltip ────────────────────────────────────────────────── */
  let tipTimer = 0;
  function showTip(html, x, y, timeout) {
    tooltip.innerHTML = html;
    tooltip.style.transform = 'translate3d(' + Math.min(x + 14, window.innerWidth - 280) + 'px,' + Math.min(y + 18, window.innerHeight - 90) + 'px,0)';
    tooltip.classList.add('show');
    clearTimeout(tipTimer);
    if (timeout) tipTimer = setTimeout(() => tooltip.classList.remove('show'), timeout);
  }
  function hideTip() {
    clearTimeout(tipTimer);
    tooltip.classList.remove('show');
  }

  /* ── timeline ───────────────────────────────────────────────── */
  function buildTimeline() {
    trackBands.innerHTML = '';
    trackTicks.innerHTML = '';
    const totalSpan = END_YEAR - START_YEAR;

    D.dynasties.forEach((d, i) => {
      let left, width;
      if (state.scaleMode === 'era') {
        left = (i / N_ERAS) * 100;
        width = (1 / N_ERAS) * 100;
      } else {
        left = ((d.from - START_YEAR) / totalSpan) * 100;
        width = ((d.to - d.from) / totalSpan) * 100;
      }
      const band = document.createElement('div');
      band.className = 'era-band';
      if (width < 3.6) band.classList.add('narrow');
      if (width < 1.7) band.classList.add('tiny');
      band.dataset.index = i;
      band.style.left = left.toFixed(4) + '%';
      band.style.width = width.toFixed(4) + '%';
      band.style.setProperty('--band-rgb', rgbString(d.tint));
      band.title = d.title + ' · ' + fmtSpan(d.from, d.to);
      band.innerHTML = '<span class="era-band-name">' + esc(BAND_NAME[d.key] || d.title) + '</span>';
      trackBands.appendChild(band);
    });

    // phase boundaries
    for (const d of D.dynasties) {
      for (const ph of d.phases) {
        const tick = document.createElement('i');
        tick.className = 'phase-tick';
        tick.style.left = yearToPct(ph.start).toFixed(4) + '%';
        trackTicks.appendChild(tick);
      }
    }

    // events
    for (const d of D.dynasties) {
      for (const m of d.milestones) {
        if (!m.m) continue;
        const tick = document.createElement('i');
        tick.className = 'tick big';
        tick.style.left = yearToPct(m.y).toFixed(4) + '%';
        tick.title = fmtShort(m.y) + ' · ' + m.t;
        trackTicks.appendChild(tick);
      }
    }

    $('#track-start').textContent = fmtShort(START_YEAR);
    $('#track-end').textContent = fmtShort(END_YEAR);
    $('#track-foot-mid').textContent = fmtFull(START_YEAR) + ' — ' + fmtFull(END_YEAR) + ' · ' + N_ERAS + ' 个历史时期 · ' + totalStages() + ' 幅疆域';
    updateActiveBand();
  }

  function updateActiveBand() {
    for (const b of trackBands.children) {
      b.classList.toggle('active', Number(b.dataset.index) === state.dynIndex);
    }
  }

  function pctFromClientX(clientX) {
    const r = track.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * 100, 0, 100);
  }

  function setFromClientX(clientX) {
    const pct = pctFromClientX(clientX);
    selectYear(pctToYear(pct));
  }

  let draggingTrack = false;
  function bindTimeline() {
    trackHit.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      stopPlay();
      draggingTrack = true;
      $('#timeline').classList.add('dragging');
      trackHit.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
      hideHover();
      hideHint();
      e.preventDefault();
    });
    trackHit.addEventListener('pointermove', e => {
      if (draggingTrack) { setFromClientX(e.clientX); return; }
      if (e.pointerType === 'touch') return;
      const pct = pctFromClientX(e.clientX);
      const y = pctToYear(pct);
      trackHover.hidden = false;
      trackHover.style.left = pct.toFixed(3) + '%';
      hoverBubble.textContent = fmtShort(y) + ' 年';
    });
    const endDrag = e => {
      if (!draggingTrack) return;
      draggingTrack = false;
      $('#timeline').classList.remove('dragging');
      try { trackHit.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    trackHit.addEventListener('pointerup', endDrag);
    trackHit.addEventListener('pointercancel', endDrag);
    trackHit.addEventListener('pointerleave', () => { if (!draggingTrack) hideHover(); });

    $$('.scale-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        state.scaleMode = btn.dataset.scale;
        $$('.scale-switch button').forEach(b => b.classList.toggle('active', b === btn));
        buildTimeline();
        updatePlayhead();
      });
    });

    playBtn.addEventListener('click', togglePlay);
    $('#step-prev').addEventListener('click', () => { stopPlay(); stepYear(-1); });
    $('#step-next').addEventListener('click', () => { stopPlay(); stepYear(1); });
  }

  function hideHover() { trackHover.hidden = true; }

  function stepYear(delta) {
    selectYear(state.year + delta);
    hideHint();
  }

  /* ── playback ───────────────────────────────────────────────── */
  let rafId = 0, lastTs = 0;
  function togglePlay() {
    if (state.playing) stopPlay();
    else startPlay();
  }
  function startPlay() {
    if (state.year >= END_YEAR) selectYear(START_YEAR);
    state.playing = true;
    state.playPct = yearToPct(state.year);
    playBtn.classList.add('playing');
    playBtn.setAttribute('aria-label', '暂停历史演进');
    lastTs = 0;
    rafId = requestAnimationFrame(playFrame);
    hideHint();
  }
  function stopPlay() {
    if (!state.playing) return;
    state.playing = false;
    cancelAnimationFrame(rafId);
    playBtn.classList.remove('playing');
    playBtn.setAttribute('aria-label', '播放历史演进');
  }
  function playFrame(ts) {
    if (!state.playing) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.06, (ts - lastTs) / 1000);
    lastTs = ts;
    state.playPct += dt * 1.65; // ~60 seconds end to end
    if (state.playPct >= 100) {
      state.playPct = 100;
      selectYear(END_YEAR);
      stopPlay();
      return;
    }
    const y = pctToYear(state.playPct);
    if (y !== state.year) selectYear(y);
    else updatePlayhead();
    rafId = requestAnimationFrame(playFrame);
  }

  /* ── map interaction ────────────────────────────────────────── */
  function bindMap() {
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.0016);
      zoomAt(factor, e.clientX, e.clientY);
      hideHint();
    }, { passive: false });

    svg.addEventListener('pointerdown', e => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (state.flyRaf) { cancelAnimationFrame(state.flyRaf); state.flyRaf = 0; }
      state.pan = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        view: { ...state.view },
        moved: false,
        target: e.target
      };
      svg.setPointerCapture(e.pointerId);
      svg.classList.add('dragging');
    });

    svg.addEventListener('pointermove', e => {
      if (state.pan) {
        const dx = e.clientX - state.pan.x;
        const dy = e.clientY - state.pan.y;
        if (!state.pan.moved && Math.hypot(dx, dy) < 4) return;
        state.pan.moved = true;
        hideTip();
        const rect = svg.getBoundingClientRect();
        const scale = state.view.w / rect.width;
        const next = {
          x: state.pan.view.x - dx * scale,
          y: state.pan.view.y - dy * scale,
          w: state.pan.view.w,
          h: state.pan.view.h
        };
        state.view = clampView(next);
        applyView();
        return;
      }
      const polity = e.target.closest && e.target.closest('.polity');
      if (polity) {
        showTip('<b>' + esc(polity.dataset.name) + '</b><span>' + esc(ROLE_LABEL[polity.dataset.role] || '') + '</span>', e.clientX, e.clientY);
        return;
      }
      const pin = e.target.closest && e.target.closest('.event-pin');
      if (pin) {
        showTip('<b>' + esc(fmtShort(Number(pin.dataset.year))) + '</b><span>' + esc(pin.dataset.headline) + '</span>', e.clientX, e.clientY);
        return;
      }
      const label = e.target.closest && e.target.closest('.map-label');
      if (label) {
        showTip('<b>' + esc(label.dataset.name) + '</b><span>点击聚焦政权</span>', e.clientX, e.clientY);
        return;
      }
      hideTip();
    });

    const endPan = e => {
      if (!state.pan) return;
      const pan = state.pan;
      state.pan = null;
      svg.classList.remove('dragging');
      try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
      if (!pan.moved) {
        const polity = pan.target.closest && pan.target.closest('.polity');
        if (polity) {
          const idx = state.polities.findIndex(p => p.n === polity.dataset.name);
          if (idx >= 0) focusPolity(idx);
          return;
        }
        const label = pan.target.closest && pan.target.closest('.map-label');
        if (label) {
          const idx = state.polities.findIndex(p => p.n === label.dataset.name);
          if (idx >= 0) focusPolity(idx);
          return;
        }
        const pin = pan.target.closest && pan.target.closest('.event-pin');
        if (pin) {
          stopPlay();
          selectYear(Number(pin.dataset.year));
          return;
        }
      }
      scheduleLabels(60);
    };
    svg.addEventListener('pointerup', endPan);
    svg.addEventListener('pointercancel', endPan);
    svg.addEventListener('pointerleave', hideTip);

    $('#zoom-in').addEventListener('click', () => {
      const r = svg.getBoundingClientRect();
      zoomAt(0.78, r.left + r.width / 2, r.top + r.height / 2);
    });
    $('#zoom-out').addEventListener('click', () => {
      const r = svg.getBoundingClientRect();
      zoomAt(1.28, r.left + r.width / 2, r.top + r.height / 2);
    });
    $('#zoom-reset').addEventListener('click', () => resetView(true));
  }

  /* ── layers / modal / misc ──────────────────────────────────── */
  function applyLayers() {
    document.body.classList.toggle('hide-rivers', !state.layers.rivers);
    document.body.classList.toggle('hide-neighbors', !state.layers.neighbors);
    document.body.classList.toggle('hide-events', !state.layers.events);
    document.body.classList.toggle('hide-wall', !state.layers.wall);
    renderEvents();
    if (state.dynIndex >= 0) renderWall(D.dynasties[state.dynIndex]);
    renderLabels();
  }

  function bindLayers() {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem('shanhe.layers') || 'null'); } catch (_) { return null; }
    })();
    if (saved) state.layers = Object.assign(state.layers, saved);
    $$('#layers-pop input[data-layer]').forEach(inp => {
      inp.checked = !!state.layers[inp.dataset.layer];
      inp.addEventListener('change', () => {
        state.layers[inp.dataset.layer] = inp.checked;
        try { localStorage.setItem('shanhe.layers', JSON.stringify(state.layers)); } catch (_) {}
        applyLayers();
      });
    });
    applyLayers();

    layersBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = layerPop.hidden;
      layerPop.hidden = !open;
      layersBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (!layerPop.hidden && !layerPop.contains(e.target) && !layersBtn.contains(e.target)) {
        layerPop.hidden = true;
        layersBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function openAbout() {
    aboutModal.hidden = false;
    document.body.classList.add('no-scroll');
    const close = aboutModal.querySelector('[data-close-about]');
    if (close) close.focus();
  }
  function closeAbout() {
    aboutModal.hidden = true;
    document.body.classList.remove('no-scroll');
  }
  function bindModal() {
    $$('[data-open-about]').forEach(b => b.addEventListener('click', openAbout));
    $$('[data-close-about]').forEach(b => b.addEventListener('click', closeAbout));
    aboutModal.addEventListener('click', e => { if (e.target === aboutModal) closeAbout(); });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (!aboutModal.hidden) {
        if (e.key === 'Escape') { closeAbout(); return; }
        return;
      }
      if (e.key === 'Escape') {
        if (!layerPop.hidden) { layerPop.hidden = true; layersBtn.setAttribute('aria-expanded', 'false'); return; }
        hideTip();
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        if (e.target && e.target.closest && e.target.closest('button, a, [role="slider"]')) return;
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault(); stopPlay(); stepYear(e.shiftKey ? -10 : -1); return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault(); stopPlay(); stepYear(e.shiftKey ? 10 : 1); return;
      }
      if (e.key === 'Home') { e.preventDefault(); stopPlay(); selectYear(START_YEAR); return; }
      if (e.key === 'End') { e.preventDefault(); stopPlay(); selectYear(END_YEAR); return; }
      if (e.key === '+' || e.key === '=') { const r = svg.getBoundingClientRect(); zoomAt(0.8, r.left + r.width / 2, r.top + r.height / 2); return; }
      if (e.key === '-' || e.key === '_') { const r = svg.getBoundingClientRect(); zoomAt(1.25, r.left + r.width / 2, r.top + r.height / 2); return; }
      if (e.key === '0') { resetView(true); }
    });
  }

  function bindMobile() {
    const btn = $('#mobile-collapse');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sidebar = $('#sidebar');
      sidebar.classList.toggle('collapsed');
      const collapsed = sidebar.classList.contains('collapsed');
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      setTimeout(fitMap, 260);
    });
  }

  function hideHint() {
    if (state.hintGone) return;
    state.hintGone = true;
    mapHint.classList.add('gone');
  }

  function bindMisc() {
    mapHint.addEventListener('transitionend', () => { mapHint.style.display = 'none'; });
    setTimeout(hideHint, 9000);
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitMap();
        scheduleLabels(60);
      }, 160);
    };
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { fitMap(); }, 180);
      });
      ro.observe(mapPanel);
    }
  }

  /* ── boot ───────────────────────────────────────────────────── */
  function boot() {
    if (window.innerWidth <= 800) {
      $('#sidebar').classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }
    buildBase();
    fitMap();
    buildTimeline();
    bindTimeline();
    bindMap();
    bindLayers();
    bindModal();
    bindKeyboard();
    bindMobile();
    bindMisc();
    selectYear(1000, { force: true });
    // initial reveal
    requestAnimationFrame(() => document.body.classList.add('ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
