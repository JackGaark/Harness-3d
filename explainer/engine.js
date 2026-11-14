// Deterministic timeline: the whole video is a pure function of time, seek(t).
// Opened normally the page plays in real time (click to pause, arrow keys to skip);
// render.mjs drives seek() frame by frame.

import { PAGES } from './pages.js';

const INTRO = 1.0, OUTRO = 1.2, RATE = 6, HOLD = 0.9, SWEEP = 7.5, FADE = 0.45;
const SYSTEMS = /\b(Mini-SWE-Agent|Claude Code|Gemini CLI|Mistral Vibe|OpenHands|OpenCode|OpenClaw|Omnigent|Codex|Aider|Hermes|Pi)\b/g;

const stage = document.getElementById('stage');
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1 - Math.pow(1 - clamp(x), 3);

function para(src) {
  let cls = '', lead = '';
  const m = src.match(/^O(\d+):/);
  if (m) { cls = 'obs'; lead = `<b>Observation ${m[1]}.</b> `; src = src.slice(m[0].length); }
  const body = src.split(/(<[^>]+>)/).map(s => s.startsWith('<') ? s : s.replace(SYSTEMS, '<span class="sc">$1</span>')).join('');
  return `<p class="${cls}">${lead}${body}</p>`;
}

// The seven subsystems stay on screen as a map; the one a page dissects is filled in.
const STAGES = [['6', 'loop', '#f8d9d6'], ['7', 'LLM', '#dbe2f6'], ['8', 'tools', '#d9ecd2'], ['9', 'memory', '#f8d9d6'], ['10', 'safety', '#d9ecd2'], ['11', 'orchestration', '#f6e2a4'], ['12', 'extensibility', '#d9ecd2']];

// The frame is 16:9. The paper page (PW wide) sits inside it on a camera that pans and zooms to
// whatever is being read, between a fixed header (the map) and footer (progress).
const VW = 1920, VH = 1080, PW = 1200, PH = 1680, TOP = 64, BOT = 44, ZOOM = 1.6, MINZOOM = 1.25, PAN = 0.9;
const cam = document.createElement('div');
cam.id = 'cam';
const hud = document.createElement('div');
hud.id = 'hud';
hud.innerHTML = `<div class="hudtop"><span>Harness Engineering</span><div class="strip">${STAGES.map(([, l, c]) => `<i style="--c:${c}">${l}</i>`).join('')}</div><b></b></div>
  <div class="hudbot"><div class="ticks">${PAGES.map(() => '<i></i>').join('')}</div></div>`;
stage.append(cam, hud);
const hudSec = hud.querySelector('b'), hudStages = [...hud.querySelectorAll('.strip i')], hudTicks = [...hud.querySelectorAll('.ticks i')];

function build(pg, i) {
  const el = document.createElement('section');
  el.className = 'page ' + (pg.kind || '');
  if (pg.kind === 'end') { el.innerHTML = pg.html; return el; }
  const cols = `<div class="cols"><div class="text">${pg.kind === 'title' ? '<div class="abs">Abstract, in brief</div>' : ''}${pg.paras.map(para).join('')}</div><div class="figs">${pg.figs.join('')}</div></div>`;
  const band = pg.band.length ? `<div class="band">${pg.band.join('')}</div>` : '';
  el.innerHTML = pg.kind === 'title'
    ? `<div class="stamp">arXiv:2609.00006v1 [cs.SE] 15 Jul 2026</div>
       <h1>Harness Engineering:<br>Anatomy, Architecture, and Evolution<br>of Coding Agents</h1>
       <div class="sub">A Source-Code Study of Eleven Systems</div>
       <div class="auth">Paul Barbaste, Tristan Darrigol, Germain Vu, and Tom Wiltberger<small>Inclusive Brains · Wavestone AI Lab · July 2026</small></div>
       ${cols}${band}`
    : `<h2><span class="n">${pg.n}</span>${pg.title}</h2>${cols}${band}`;
  return el;
}

// Wrap every word of a passage in a span so the highlight can sweep at reading pace.
function wrapWords(p) {
  const words = [];
  const walk = node => {
    for (const c of [...node.childNodes]) {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const tok of c.textContent.match(/^\s+|\S+\s*/g) || []) {
          const s = document.createElement('span');
          s.className = 'w'; s.textContent = tok;
          words.push(s); frag.appendChild(s);
        }
        c.replaceWith(frag);
      } else walk(c);
    }
  };
  walk(p);
  return words;
}

let T_END = 0, figN = 0;
PAGES.forEach((pg, i) => {
  const el = build(pg, i);
  cam.appendChild(el);
  pg.el = el;
  el.querySelectorAll('.fn').forEach(b => { b.textContent = `Fig. ${++figN}.`; });

  el.querySelectorAll('[data-stagger]').forEach(par => {
    const step = +par.dataset.stagger, d0 = +par.dataset.d || 0;
    [...par.children].forEach((c, j) => { c.dataset.at = par.dataset.at; c.dataset.d = d0 + j * step; });
    par.removeAttribute('data-at');
  });

  // A table arrives with its first row, so its header never sits over an empty body.
  el.querySelectorAll('table.tb').forEach(tb => {
    const r = tb.querySelector('tbody [data-at]');
    if (r) { tb.dataset.at = r.dataset.at; tb.dataset.d = Math.max(0, r.dataset.d - 0.2); }
  });
  // A figure with no reveal time of its own appears with its earliest element, caption and all.
  el.querySelectorAll('.fig:not([data-at])').forEach(f => {
    const kids = [...f.querySelectorAll('[data-at]')].map(e => [+e.dataset.at, +e.dataset.d || 0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (kids.length) { f.dataset.at = kids[0][0]; f.dataset.d = Math.max(0, kids[0][1] - 0.2); }
  });

  pg.anims = [...el.querySelectorAll('[data-at]')].map(e => ({
    e, i: +e.dataset.at, d: +e.dataset.d || 0, dur: +e.dataset.dur || 0.5,
    kind: e.dataset.anim || 'fade', svg: e instanceof SVGElement,
    len: e.dataset.anim === 'draw' ? e.getTotalLength() : 0,
    path: e.dataset.path ? document.getElementById(e.dataset.path) : null,
  }));
  const idx = (e, key) => e.dataset[key].split(',').map(Number);
  pg.focus = [...el.querySelectorAll('[data-focus]')].map(e => ({ e, on: idx(e, 'focus') }));
  pg.cur = [...el.querySelectorAll('[data-cur]')].map(e => ({ e, on: idx(e, 'cur') }));

  // Camera framing. A frame is the vertical extent of some elements, zoomed as far as ZOOM allows.
  const top = el.getBoundingClientRect().top, VIEW = VH - TOP - BOT;
  const extent = e => { const r = e.getBoundingClientRect(); return r.width || r.height ? [r.top - top, r.bottom - top] : null; };
  const frame = ([a, b]) => {
    const s = Math.min(ZOOM, VIEW / (b - a + 52)), half = VIEW / (2 * s);
    return { s, cy: Math.max(half, Math.min(PH - half, (a + b) / 2)) };
  };
  const union = (x, y) => [Math.min(x[0], y[0]), Math.max(x[1], y[1])];

  pg.t0 = T_END;
  pg.keys = [];
  let c = pg.t0 + INTRO;
  pg.pass = [...el.querySelectorAll('.text p')].map((p, k) => {
    const words = wrapWords(p), sweep = words.length / SWEEP;
    const mine = pg.anims.filter(a => a.i === k);
    const shown = mine.filter(a => a.kind !== 'travel').map(a => a.e);
    const marked = pg.focus.filter(f => f.on.includes(k)).map(f => f.e);
    const figs = pg.cur.filter(f => f.on.includes(k) && ![...shown, ...marked].some(e => f.e.contains(e))).map(f => f.e);

    // Keep with the passage whatever fits beside it at a readable zoom. Anything further away
    // (usually the figure strip below) gets its own framing: the camera reads first, then pans
    // there, and those reveals wait for it.
    let near = [p, ...(k ? [] : el.querySelectorAll('h1, h2, .sub, .auth'))].map(extent).reduce(union);
    const far = [];
    for (const e of [...shown, ...marked, ...figs]) {
      const x = extent(e);
      if (!x) continue;
      const u = union(near, x);
      if (u[1] - u[0] + 52 <= VIEW / MINZOOM) near = u; else far.push([e, x]);
    }
    const wait = far.length ? sweep + 0.4 : 0;
    if (far.length) {
      const late = new Set(far.map(([e]) => e));
      mine.forEach(a => { if ([...late].some(e => e === a.e || e.contains(a.e))) a.d += wait + PAN * 0.6; });
    }
    const lastDelay = Math.max(0, ...mine.map(a => a.d + a.dur));
    const dur = Math.max(3.6, words.length / RATE + HOLD, lastDelay + 1.2, wait + PAN + 2);
    pg.keys.push({ t: c, cam: frame(near) });
    if (far.length) pg.keys.push({ t: c + wait, cam: frame(far.map(([, x]) => x).reduce(union)) });
    const ps = { p, words, s: c, e: c + dur, sweep };
    c += dur;
    return ps;
  });
  if (!pg.keys.length) pg.keys.push({ t: pg.t0, cam: frame([...el.children].map(extent).filter(Boolean).reduce(union)) });
  if (pg.hold) c += pg.hold;
  pg.t1 = c + OUTRO;
  T_END = pg.t1;

  pg.anims.forEach(a => { a.t = (pg.pass[a.i] ? pg.pass[a.i].s : pg.t0 + INTRO) + a.d; });
});

function camAt(pg, t) {
  let k = 0;
  pg.keys.forEach((key, i) => { if (t >= key.t) k = i; });
  const to = pg.keys[k].cam;
  if (!k) return to;
  const from = pg.keys[k - 1].cam, x = clamp((t - pg.keys[k].t) / PAN), u = x * x * (3 - 2 * x);
  return { s: from.s + (to.s - from.s) * u, cy: from.cy + (to.cy - from.cy) * u };
}

function seek(t) {
  for (const pg of PAGES) {
    const el = pg.el;
    if (t < pg.t0 || t >= pg.t1) { el.style.display = 'none'; continue; }
    const last = pg === PAGES[PAGES.length - 1];
    const pin = ease((t - pg.t0) / FADE), pout = last ? 0 : ease((t - (pg.t1 - FADE)) / FADE);
    el.style.display = '';
    el.style.opacity = pin * (1 - pout);
    el.style.transform = `translateX(${(1 - pin) * 26 - pout * 26}px)`;

    const c = camAt(pg, t), n = PAGES.indexOf(pg);
    cam.style.transform = `translate(${VW / 2 - PW / 2 * c.s}px, ${TOP + (VH - TOP - BOT) / 2 - c.cy * c.s}px) scale(${c.s})`;
    hudSec.textContent = pg.n ? `§${pg.n}` : '';
    hudStages.forEach((e, j) => e.classList.toggle('now', STAGES[j][0] === pg.n));
    hudTicks.forEach((e, j) => { e.className = j < n ? 'done' : j === n ? 'now' : ''; });

    for (const a of pg.anims) {
      const p = ease((t - a.t) / a.dur), s = a.e.style;
      if (a.kind === 'grow') {
        s.opacity = t >= a.t ? 1 : 0;
        s.transformBox = 'fill-box';
        s.transformOrigin = a.e.dataset.origin === 'right' ? 'right center' : 'left center';
        s.transform = `scaleX(${p})`;
      } else if (a.kind === 'travel') {
        const raw = clamp((t - a.t) / a.dur), pt = a.path.getPointAtLength(raw * a.path.getTotalLength());
        a.e.setAttribute('cx', pt.x); a.e.setAttribute('cy', pt.y);
        s.opacity = raw > 0 && raw < 1 ? 1 : 0;
      } else if (a.kind === 'draw') {
        s.strokeDasharray = a.len;
        s.strokeDashoffset = a.len * (1 - p);
      } else {
        s.opacity = p;
        if (!a.svg) s.transform = `translateY(${(1 - p) * 8}px)`;
      }
    }

    const active = new Set();
    pg.pass.forEach((ps, k) => {
      const live = t >= ps.s && t < ps.e;
      if (live) active.add(k);
      const alpha = t < ps.s ? 0 : live ? 1 : 1 - clamp((t - ps.e) / 0.4);
      const lit = alpha <= 0 ? 0 : live ? Math.ceil(clamp((t - ps.s) / ps.sweep) * ps.words.length) : ps.words.length;
      ps.p.style.setProperty('--a', alpha);
      ps.words.forEach((w, j) => w.classList.toggle('on', j < lit));
    });
    for (const f of pg.focus) f.e.classList.toggle('focus', f.on.some(k => active.has(k)));
    for (const f of pg.cur) f.e.classList.toggle('cur', f.on.some(k => active.has(k)));
  }
}

// The stage is authored at VW x VH; scale it to whatever window it is shown in.
function fit() {
  const k = Math.min(innerWidth / VW, innerHeight / VH);
  stage.style.transform = `translate(${(innerWidth - VW * k) / 2}px, ${(innerHeight - VH * k) / 2}px) scale(${k})`;
}
fit();
addEventListener('resize', fit);

window.PAGES = PAGES;
window.seek = seek;
window.DURATION = T_END;
window.ready = document.fonts.ready.then(() => { seek(0); return T_END; });

if (location.hash !== '#render') {
  let t = +new URLSearchParams(location.search).get('t') || 0, playing = true, prev = performance.now();
  const tick = now => {
    if (playing) t = (t + (now - prev) / 1000) % T_END;
    prev = now; seek(t); requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  addEventListener('click', () => { playing = !playing; });
  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') t = Math.min(T_END - 0.01, t + 5);
    if (e.key === 'ArrowLeft') t = Math.max(0, t - 5);
    if (e.key === ' ') playing = !playing;
  });
}
