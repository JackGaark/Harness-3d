// Small helpers for building figure markup. Everything returns an HTML/SVG string.
// Timing attributes: data-at = index of the passage that triggers the element,
// data-d = extra delay in seconds after that passage starts.

export const INK = '#222', PINK = '#f8d9d6', BLUE = '#dbe2f6', GREEN = '#d9ecd2', YEL = '#f6e2a4', CREAM = '#fbf3cf', RED = '#c9463d', WHITE = '#fff';

export const at = (i, d = 0, x = '') => `data-at="${i}" data-d="${d}" ${x}`;

export function B(x, y, w, h, label, fill = WHITE, a = '', o = {}) {
  const [l1, l2] = label.split('|');
  const rect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 5}" fill="${fill}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 1.3}" ${o.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
  const fs = o.fs ? `style="font-size:${o.fs}px"` : '';
  const txt = l2
    ? `<text x="${x + w / 2}" y="${y + h / 2 - 2}" class="bl" ${fs}>${l1}</text><text x="${x + w / 2}" y="${y + h / 2 + 14}" class="bs">${l2}</text>`
    : `<text x="${x + w / 2}" y="${y + h / 2 + 5.5}" class="bl" ${fs}>${l1}</text>`;
  return `<g ${a}>${rect}${txt}</g>`;
}

export function A(x1, y1, x2, y2, a = '', o = {}) {
  const m = o.red ? 'arr' : 'ar';
  return `<line ${a} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.red ? RED : INK}" stroke-width="1.3" marker-end="url(#${m})" ${o.both ? `marker-start="url(#${m})"` : ''} ${o.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
}

export function PA(d, a = '', o = {}) {
  return `<path ${a} d="${d}" fill="none" stroke="${o.red ? RED : INK}" stroke-width="${o.sw || 1.3}" ${o.noHead ? '' : `marker-end="url(#${o.red ? 'arr' : 'ar'})"`} ${o.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
}

export function T(x, y, s, a = '', o = {}) {
  const st = `font-size:${o.fs || 14}px;${o.i ? 'font-style:italic;' : ''}${o.b ? 'font-weight:700;' : ''}${o.fill ? `fill:${o.fill};` : ''}${o.mono ? 'font-family:Menlo,monospace;' : ''}`;
  return `<text ${a} x="${x}" y="${y}" text-anchor="${o.anchor || 'start'}" style="${st}">${s}</text>`;
}

export const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}">${inner}</svg>`;

// o.at: passage that reveals the whole figure; o.cur: passages during which the caption is marked
export function fig(inner, cap, o = {}) {
  const cur = o.cur ?? (o.at != null ? [o.at] : []);
  const a = (o.at != null ? at(o.at, o.d || 0) : '') + (cur.length ? ` data-cur="${cur.join(',')}"` : '') + (o.style ? ` style="${o.style}"` : '');
  const h4 = o.h4 ? `<h4>${o.h4}</h4>` : '';
  const c = cap ? `<div class="cap"><b class="fn"></b> ${cap}</div>` : '';
  return `<div class="fig" ${a}>${h4}${inner}${c}</div>`;
}

export function dots(label, k, n, a = '', cls = '') {
  let d = '';
  for (let i = 0; i < n; i++) d += `<span class="dot ${i < k ? 'f' : ''}"></span>`;
  return `<div class="dr ${cls}" ${a}><span class="dl">${label}</span><span class="dd">${d}</span><span class="dn">${k}/${n}</span></div>`;
}

export function bar(label, val, px, a = '', cls = '') {
  return `<div class="br"><div class="lab">${label}</div><div class="row"><div class="bar ${cls}" style="width:${px}px" ${a} data-anim="grow"></div><div class="val" ${a}>${val}</div></div></div>`;
}

export function chips(list, a = '', cls = '', stagger = 0.08) {
  return `<div class="chips" ${a} data-stagger="${stagger}">${list.map(c => `<span class="chip ${cls}">${c}</span>`).join('')}</div>`;
}

// rows: arrays of cells; a trailing string starting with "@" is taken as row attributes
export function table(head, rows, a = '', stagger = 0.12) {
  const tr = rows.map(r => {
    let ra = '';
    if (typeof r[r.length - 1] === 'string' && r[r.length - 1].startsWith('@')) ra = r.pop().slice(1);
    return `<tr ${ra}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="tb"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody ${a} data-stagger="${stagger}">${tr}</tbody></table>`;
}

export function code(lines, a = '', stagger = 0.16) {
  const hl = s => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/(#.*)$/, '<span class="c">$1</span>')
    .replace(/\b(async|await|def|while|if|not|return|for|in|True)\b/g, '<span class="k">$1</span>');
  return `<pre class="ls" ${a} data-stagger="${stagger}">${lines.map((l, i) => `<span class="l"><span class="ln">${i + 1}</span>${hl(l)}</span>`).join('')}</pre>`;
}

// A filled band between two vertical extents, the way a flow diagram joins stages.
export function ribbon(x1, a1, b1, x2, a2, b2, fill, a = '') {
  const m = (x1 + x2) / 2;
  return `<path ${a} data-anim="grow" data-dur="0.7" d="M${x1},${a1} C${m},${a1} ${m},${a2} ${x2},${a2} L${x2},${b2} C${m},${b2} ${m},${b1} ${x1},${b1} Z" fill="${fill}" opacity="0.75"/>`;
}

// A dot that rides along the path with the given id.
export const rider = (id, a, dur = 1.1) => `<circle r="5.5" fill="#3257b8" ${a} data-anim="travel" data-path="${id}" data-dur="${dur}"/>`;

export const sc = s => `<span class="sc">${s}</span>`;
