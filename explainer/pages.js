// Page content. Each page: { n, title, paras, figs (right column), band (bottom strip) }.
// A passage starting with "O<n>:" is typeset as the paper's framed Observation box.

import { INK, PINK, BLUE, GREEN, YEL, CREAM, RED, WHITE, at, B, A, PA, T, svg, fig, dots, bar, chips, table, code, ribbon, rider, sc } from './figures.js';

export const PAGES = [];

/* ---------- 0. Title page ---------- */
PAGES.push({
  kind: 'title',
  paras: [
    `An agent is a model plus a harness: the runtime that couples an LLM to the world through a loop, tools, context management, safety controls, orchestration, and extension surfaces.`,
    `This paper is a source-code anatomy of eleven production coding harnesses, plus one meta-harness as a contrast point. It does not benchmark or rank; it describes and compares how the systems are built.`,
    `The audit yields 13 cross-cutting observations, a catalog of 29 recurring design patterns, and 18 design recommendations.`,
    `Its thesis: in the first half of 2026 the coding harness completed a turn from tool to <i>platform</i>.`,
  ],
  figs: [
    fig(svg(492, 290, (() => {
      const cx = 246, cy = 148, r1 = 56, r2 = 96, n = 7, step = 360 / n, gap = 7;
      const labs = [['loop', PINK], ['tools', GREEN], ['context', PINK], ['safety', GREEN], ['orchestration', YEL], ['extensions', GREEN], ['LLM integration', BLUE]];
      const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      let s = `<g ${at(0, 0.1)}><circle cx="${cx}" cy="${cy}" r="43" fill="${BLUE}" stroke="${INK}" stroke-width="1.3"/>${T(cx, cy + 3, 'LLM', '', { fs: 23, b: 1, anchor: 'middle' })}${T(cx, cy + 20, 'the model', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#555' })}</g>`;
      labs.forEach(([l, f], i) => {
        const a0 = (-90 - step / 2 + i * step + gap / 2) * Math.PI / 180, a1 = (-90 - step / 2 + (i + 1) * step - gap / 2) * Math.PI / 180;
        const [x0, y0] = p(r2, a0), [x1, y1] = p(r2, a1), [x2, y2] = p(r1, a1), [x3, y3] = p(r1, a0);
        const am = (a0 + a1) / 2, [lx, ly] = p(r2 + 15, am), c = Math.cos(am);
        s += `<g ${at(0, 0.6 + i * 0.3)}><path d="M${x0},${y0} A${r2},${r2} 0 0 1 ${x1},${y1} L${x2},${y2} A${r1},${r1} 0 0 0 ${x3},${y3} Z" fill="${f}" stroke="${INK}" stroke-width="1.3"/>${T(lx, ly + 5, l, '', { fs: 15.5, anchor: c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle' })}</g>`;
      });
      return s;
    })()), 'An agent is a model plus a harness of seven subsystems.', { cur: [0] }),
    fig(chips(['Claude Code', 'Codex CLI', 'Gemini CLI', 'Mistral Vibe'], at(1, 0.3), 'p') + '<div style="height:7px"></div>' +
      chips(['OpenHands', 'Aider', 'Mini-SWE-Agent', 'Hermes', 'Pi', 'OpenCode', 'OpenClaw'], at(1, 0.8), 'g') + '<div style="height:7px"></div>' +
      chips(['Omnigent (meta-harness)'], at(1, 1.6), 'y'),
      'Four provider-native systems, seven open-source ones, one contrast point.', { cur: [1], h4: 'The corpus' }),
  ],
  band: [
    fig(svg(600, 250,
      B(8, 104, 78, 40, 'client', WHITE, at(3, 0.2)) + A(86, 124, 118, 124, at(3, 0.4)) +
      `<g ${at(3, 0.4)}><line x1="126" y1="40" x2="126" y2="214" stroke="${INK}" stroke-width="1.6"/>${T(126, 30, 'one API', '', { fs: 12.5, i: 1, anchor: 'middle' })}</g>` +
      A(126, 124, 150, 124, at(3, 0.5)) +
      B(150, 90, 124, 68, 'meta-harness|Omnigent', YEL, at(3, 0.6), { fs: 17 }) +
      Array.from({ length: 11 }, (_, i) => `<g ${at(3, 0.9 + i * 0.05)}><line x1="274" y1="124" x2="318" y2="${36 + i * 17}" stroke="#777" stroke-width="0.9"/><rect x="318" y="${30 + i * 17}" width="28" height="12" rx="2" fill="${i % 4 === 3 ? YEL : '#eee'}" stroke="${INK}"/></g>`).join('') +
      T(332, 236, 'eleven vendor harnesses', at(3, 1.2), { fs: 12.5, i: 1, anchor: 'middle', fill: '#555' }) +
      ['importable SDKs', 'marketplaces', 'switching-cost tooling', 'enterprise governance', 'agent addressable as a model'].map((l, i) => B(372, 26 + i * 40, 222, 31, l, GREEN, at(3, 1.6 + i * 0.25), { fs: 15 })).join('')
    ), 'From tool to platform: a meta-harness orchestrates eleven vendor harnesses behind one API.', { cur: [3], h4: 'From tool to platform, first half of 2026' }),
    fig(bar('cross-cutting observations', '13', 125, at(2, 0.3)) + bar('recurring design patterns', '29', 280, at(2, 0.7)) + bar('design recommendations', '18', 174, at(2, 1.1)),
      'Counts stated in the abstract.', { cur: [2], h4: 'What the study yields', style: 'flex:0 0 380px' }),
  ],
});

/* ---------- 1. What is a harness ---------- */
PAGES.push({
  n: '2', title: 'What Is a Harness?',
  paras: [
    `<b>Agent = Model + Harness.</b> The model supplies the intelligence. The harness is everything except the model: the layer that wraps a language model and turns it into an agent able to act on a repository.`,
    `The term is used loosely, so the paper fixes four boundaries. A harness is not quite a scaffold, not an agentic framework, not an evaluation harness, and not an orchestrator.`,
    `Every system in the corpus must take a position on the same seven subsystems, even when that position is deliberate absence.`,
    `The floor is low. Mini-SWE-Agent implements all seven in roughly 100 lines, and reports SWE-bench Verified results in the same range as systems three orders of magnitude larger.`,
  ],
  figs: [
    fig(svg(492, 96,
      B(6, 18, 120, 56, 'Agent', WHITE, at(0, 0.2), { fs: 20 }) + T(152, 54, '=', at(0, 0.5), { fs: 28, anchor: 'middle' }) +
      B(178, 18, 130, 56, 'Model|the intelligence', BLUE, at(0, 0.8), { fs: 20 }) + T(334, 54, '+', at(0, 1.1), { fs: 28, anchor: 'middle' }) +
      B(360, 18, 126, 56, 'Harness|everything else', GREEN, at(0, 1.4), { fs: 20 })
    ), 'The one-line algebra that names the discipline.', { cur: [0] }),
    fig(table(['A harness is not…', 'because'], [
      ['a scaffold (quite)', 'scaffold is the structural code; harness is the shipped runtime that embeds it'],
      ['an agentic framework', 'a library you import, versus a runtime you work <i>inside of</i>'],
      ['an evaluation harness', 'that wraps an agent to test it; this wraps a model to make it act'],
      ['an orchestrator', 'it coordinates harnesses from above and has no editing loop'],
    ], at(1, 0.4), 0.9), 'Four boundary cases account for most of the confusion.', { cur: [1] }),
  ],
  band: [
    fig(svg(500, 262,
      `<rect ${at(2, 0)} x="3" y="3" width="494" height="256" rx="8" fill="none" stroke="#aaa" stroke-dasharray="5 4"/>` + T(14, 22, 'Harness', at(2, 0), { fs: 13, i: 1, fill: '#666' }) +
      B(196, 110, 116, 44, 'Agent loop', PINK, at(2, 0.3)) +
      B(196, 22, 116, 44, 'LLM integration', PINK, at(2, 0.7), { fs: 14.5 }) + A(254, 66, 254, 110, at(2, 0.7), { both: 1 }) +
      B(356, 110, 132, 44, 'Tools &amp; actions', GREEN, at(2, 1.1)) + A(312, 132, 356, 132, at(2, 1.1), { both: 1 }) +
      B(196, 200, 116, 44, 'Memory &amp; context', PINK, at(2, 1.5), { fs: 13.5 }) + A(254, 154, 254, 200, at(2, 1.5), { both: 1 }) +
      B(356, 22, 132, 44, 'Safety', GREEN, at(2, 1.9)) + A(422, 66, 422, 110, at(2, 1.9)) +
      B(20, 200, 140, 44, 'Orchestration|sub-agents / protocols', YEL, at(2, 2.3)) + A(196, 222, 160, 222, at(2, 2.3)) +
      B(340, 200, 152, 44, 'Extensibility|hooks / skills / MCP', GREEN, at(2, 2.7)) + A(422, 200, 422, 154, at(2, 2.7)) +
      B(12, 110, 148, 44, 'Interface layer|TUI / IDE / SDK / server', BLUE, at(2, 3.1)) + A(160, 132, 196, 132, at(2, 3.1), { both: 1 })
    ), 'Seven subsystems around an agent loop, plus the interface layer.', { cur: [2], style: 'flex:0 0 470px' }),
    fig(table(['Subsystem', 'Minimal form', 'Maximal form'], [
      ['Agent loop', 'a linear <code>while</code>', `${sc('OpenHands')}: event-sourced log`],
      ['LLM integration', 'one LiteLLM call', `${sc('Hermes')}: five owned transports`],
      ['Tools &amp; actions', 'bash only', `${sc('Claude Code')}: 43 typed tools`],
      ['Memory', 'unbounded history', `${sc('Codex')}: agent-maintained memory`],
      ['Safety', 'cost and step limits', `${sc('Codex')}: policy + reviewer + sandbox`],
      ['Orchestration', `none (${sc('Aider')})`, `${sc('Claude Code')}: recursive composition`],
      ['Extensibility', 'Python protocols', `${sc('Pi')}: everything is an extension`],
    ], at(3, 0.3), 0.3), `The minimal column is almost entirely ${sc('Mini-SWE-Agent')}.`, { cur: [3] }),
  ],
});

/* ---------- 2. Corpus ---------- */
PAGES.push({
  n: '4', title: 'Eleven Systems, at Source Level',
  paras: [
    `The corpus is pinned to July 2026 releases: the flagship harness of each major LLM provider, plus seven open-source systems, across Python, TypeScript, and Rust. Each has a signature no other system implements in the same form.`,
    `The eleven span three orders of magnitude in code size, from about 5K lines to Codex at roughly 1.1M lines of Rust, while targeting similar tasks.`,
    `O1:Loop sophistication does not predict benchmark performance. Most of the mass in production systems addresses concerns orthogonal to task completion: safety, user experience, extensibility, and increasingly clients and transport.`,
    `Eight systems were already audited in April 2026 and were re-pinned rather than replaced. That yields a controlled longitudinal sample: the same harnesses, source-diffed across one quarter.`,
  ],
  figs: [
    fig(table(['System', '', 'Signature'], [
      ['Claude Code', 'TS', 'deferred tool loading; the reference others copy'],
      ['Codex', 'Rust', 'agent-maintained cross-session memory'],
      ['Gemini CLI', 'TS', 'model routing as runtime scheduling'],
      ['Mistral Vibe', 'Py', 'middleware-pipeline loop'],
      ['OpenHands', 'Py', 'hosts rival harnesses as backends', '@class="sep"'],
      ['Aider', 'Py', '13 polymorphic edit formats'],
      ['Mini-SWE-Agent', 'Py', 'the 100-line floor'],
      ['Hermes', 'Py', 'self-improving skill loop'],
      ['Pi', 'TS', 'everything-is-an-extension core'],
      ['OpenCode', 'TS', 'client/server harness'],
      ['OpenClaw', 'TS', 'multi-channel gateway (contrast)'],
      ['Omnigent', 'Py', 'meta-harness above harnesses', '@class="sep"'],
    ].map(r => { r[0] = sc(r[0]); r[1] = `<span class="m">${r[1]}</span>`; return r; }), at(0, 0.3), 0.3),
      'The eleven systems and the meta-harness contrast point.', { cur: [0] }),
  ],
  band: [
    fig(svg(540, 268, (() => {
      const x0 = 150, W = 340;
      const rows = [['Tiny', '~5K', 0.226, 'Mini-SWE-Agent'], ['Small', '~20–40K', 0.477, 'Aider, Mistral Vibe'], ['Medium', '~80–110K', 0.638, 'OpenHands, Pi'], ['Large', '~500K+', 0.87, 'Claude Code, OpenCode, OpenClaw'], ['Very large', '~600K+', 0.9, 'Gemini CLI, Hermes, Codex (~1.1M)']];
      let s = [['1K', 0], ['10K', .3226], ['100K', .645], ['1M', .968]].map(([l, f]) => `<line x1="${x0 + W * f}" y1="8" x2="${x0 + W * f}" y2="228" stroke="#ccc" stroke-dasharray="3 4"/>${T(x0 + W * f, 246, l, '', { fs: 12.5, anchor: 'middle', fill: '#666' })}`).join('');
      s += T(x0 + W / 2, 264, 'lines of code, log scale', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#666' });
      rows.forEach(([c, v, f, names], i) => {
        const y = 14 + i * 43;
        s += `<g ${at(1, 0.3 + i * 0.45)}>${T(0, y + 20, c, '', { fs: 15.5, b: 1 })}${T(84, y + 20, v, '', { fs: 13.5, fill: '#555' })}${T(x0 + 2, y + 8, names, '', { fs: 13.5, i: 1 })}</g>`;
        s += `<rect ${at(1, 0.3 + i * 0.45, 'data-anim="grow" data-dur="0.8"')} x="${x0}" y="${y + 14}" width="${W * f}" height="13" fill="${i === 0 ? YEL : BLUE}" stroke="${INK}" stroke-width="1.2"/>`;
      });
      return s;
    })()), 'Order-of-magnitude codebase size, by the paper’s qualitative classes.', { cur: [1] }),
    fig(svg(440, 200, (() => {
      let s = T(0, 44, 'April', at(3, 0.2), { fs: 16 }) + T(0, 124, 'July', at(3, 1.0), { fs: 16 });
      for (let i = 0; i < 8; i++) {
        s += `<rect ${at(3, 0.2 + i * 0.06)} x="${62 + i * 30}" y="28" width="22" height="22" fill="#eee" stroke="${INK}"/>`;
        s += `<line ${at(3, 0.8)} x1="${73 + i * 30}" y1="52" x2="${73 + i * 30}" y2="106" stroke="#888" stroke-dasharray="2 4"/>`;
        s += `<rect ${at(3, 1.0 + i * 0.06)} x="${62 + i * 30}" y="108" width="22" height="22" fill="#eee" stroke="${INK}"/>`;
      }
      for (let i = 8; i < 11; i++) s += `<g ${at(3, 1.7 + (i - 8) * 0.25)}><rect x="${62 + i * 30}" y="108" width="22" height="22" fill="${GREEN}" stroke="${INK}"/>${T(73 + i * 30, 125, '+', '', { fs: 17, anchor: 'middle' })}</g>`;
      s += T(310, 44, '8 systems', at(3, 0.6), { fs: 13.5, i: 1, fill: '#555' }) + T(62, 156, '8 re-pinned + 3 new', at(3, 2.2), { fs: 13.5, i: 1, fill: '#555' });
      return s;
    })()), 'The longitudinal sample: ninety days, diffed in source.', { cur: [3], h4: 'One quarter, source-diffed', style: 'flex:0 0 420px' }),
  ],
});

/* ---------- 3. Agent loop ---------- */
PAGES.push({
  n: '6', title: 'Agent Loop Design',
  paras: [
    `The loop alternates LLM inference with action execution, and all eleven systems implement variations of the ReAct pattern. Nine run a plain iterative cycle: prompt, LLM call, execute, observe.`,
    `Aider extends it with reflection. After each response it applies the edits, runs lint and tests, and re-invokes the model with corrective context, up to three times.`,
    `Claude Code and Codex overlay a coordinator mode on the iterative loop: a parent agent dispatches workers, then synthesizes their findings.`,
    `Under the shared shape the implementations differ radically, from Mini-SWE-Agent’s linear <code>while</code> to OpenHands’s event-sourced conversation engine. Stuck detection runs from none at all to a hybrid of hashing and an LLM self-check.`,
  ],
  figs: [
    fig(svg(492, 318, (() => {
      const bx = (cx, y, l, f, w = 100) => B(cx - w / 2, y, w, 29, l, f, '', { fs: 15 });
      let a = `<g ${at(0, 0.2)}>${T(78, 16, '(a) Iterative', '', { fs: 15.5, b: 1, anchor: 'middle' })}` +
        bx(78, 34, 'Prompt', BLUE) + bx(78, 92, 'LLM call', PINK) + bx(78, 150, 'Execute', GREEN) + bx(78, 208, 'Observe', CREAM) +
        A(78, 63, 78, 92) + A(78, 121, 78, 150) + A(78, 179, 78, 208) + PA('M128,222 H146 V48 H129') +
        T(78, 268, 'nine systems', '', { fs: 13, i: 1, anchor: 'middle', fill: '#555' }) + `</g>`;
      let b = `<g ${at(1, 0.2)}>${T(250, 16, '(b) Reflection', '', { fs: 15.5, b: 1, anchor: 'middle' })}` +
        bx(250, 34, 'Prompt', BLUE) + bx(250, 80, 'LLM call', PINK) + bx(250, 126, 'Apply edits', GREEN) + bx(250, 172, 'Lint / test', CREAM) + bx(250, 218, 'Reflect?', PINK) +
        A(250, 63, 250, 80) + A(250, 109, 250, 126) + A(250, 155, 250, 172) + A(250, 201, 250, 218) + PA('M200,232 H182 V48 H199') +
        T(176, 246, 'yes', '', { fs: 12, i: 1, anchor: 'end' }) + A(300, 232, 322, 232) + T(326, 236, 'no', '', { fs: 12, i: 1 }) +
        T(250, 268, 'Aider', '', { fs: 13, i: 1, anchor: 'middle', fill: '#555' }) + `</g>`;
      let c = `<g ${at(2, 0.2)}>${T(418, 16, '(c) Coordinator', '', { fs: 15.5, b: 1, anchor: 'middle' })}` +
        bx(418, 34, 'Coordinator', PINK, 108) + B(350, 112, 42, 29, 'W1', BLUE, '', { fs: 14 }) + B(397, 112, 42, 29, 'W2', BLUE, '', { fs: 14 }) + B(444, 112, 42, 29, 'W3', BLUE, '', { fs: 14 }) +
        A(400, 63, 373, 112) + A(418, 63, 418, 112) + A(436, 63, 463, 112) + bx(418, 190, 'Synthesize', GREEN, 108) +
        A(371, 141, 398, 190) + A(418, 141, 418, 190) + A(465, 141, 438, 190) +
        T(418, 268, 'Claude Code, Codex', '', { fs: 13, i: 1, anchor: 'middle', fill: '#555' }) + T(418, 284, '(config-gated in Hermes)', '', { fs: 12, i: 1, anchor: 'middle', fill: '#777' }) + `</g>`;
      return a + b + c;
    })()), 'Three agent loop paradigms; (c) is an overlay on (a).', { cur: [0, 1, 2] }),
  ],
  band: [
    fig(code([
      'def run(self, task):',
      '    self.add_messages(system, user(task))',
      '    while True:',
      '        result = self.step()',
      '        if result.role == "exit":',
      '            return result',
      '',
      'def step(self):',
      '    self.query()                   # one LLM call',
      '    return self.execute_actions()  # run in shell',
    ], at(3, 0.3)), `The entire ${sc('Mini-SWE-Agent')} loop, condensed: no state machine, no concurrency.`, { cur: [3], style: 'flex:0 0 456px' }),
    fig(table(['System', 'Stuck detection'], [
      ['OpenHands', 'five enumerated failure scenarios'],
      ['Gemini CLI', 'SHA-256 hashing + LLM check after 30 turns'],
      ['Hermes', 'hashed call signatures, warn-first'],
      ['OpenCode', 'doom loop raises a permission ask'],
      ['Mini-SWE-Agent', 'step limit, format-error cap, wall clock'],
      ['Claude Code, Codex', 'none'],
      ['Pi', 'none, by design'],
    ].map(r => { r[0] = sc(r[0]); return r; }), at(3, 2.2), 0.3), 'Recovery machinery varies far more than the loop itself.', { cur: [3] }),
  ],
});

/* ---------- 4. LLM integration ---------- */
PAGES.push({
  n: '7', title: 'LLM Integration and Co-design',
  paras: [
    `How a harness relates to its model is one of its most consequential decisions. The corpus spans the full range, from tight single-provider coupling to complete provider agnosticism.`,
    `O2:Provider-native optimizations (cache boundaries, extended thinking, reasoning effort) are not gated on tight coupling; they are gated on who pays the per-provider conditional-code cost. Hermes, Pi, and OpenCode pay it deliberately and centrally.`,
    `What tight coupling still buys, uniquely, is server-side co-evolution. Codex’s scaffold behavior is re-tuned per model release from the provider’s catalog endpoint without shipping a client. Coupling is about who controls the update loop.`,
    `O3:Prompt rhetoric converges where engineering experience converges, then thins as trust calibrates. The stable invariant across all eleven: no policy-level refusal language anywhere. Alignment work is never duplicated in the harness prompt.`,
  ],
  figs: [
    fig(svg(492, 20, T(0, 14, 'tight coupling', '', { fs: 13, i: 1, fill: '#555' }) + A(92, 10, 396, 10) + T(404, 14, 'agnosticism', '', { fs: 13, i: 1, fill: '#555' })) +
      table(['Strategy', 'Systems'], [
        ['Single-provider', 'Claude Code, Codex, Gemini CLI', '@data-focus="2"'],
        ['Provider-first + fallback', 'Mistral Vibe'],
        ['Abstraction layer (LiteLLM)', 'OpenHands, Aider, Mini-SWE-Agent'],
        ['Owned transports', 'Hermes, Pi, OpenCode', '@data-focus="1"'],
        ['Hybrid plugin-based', 'OpenClaw'],
      ].map(r => { r[1] = sc(r[1]); return r; }), at(0, 0.4), 0.5),
      'Five provider-abstraction strategies.', { cur: [0, 1] }),
  ],
  band: [
    fig(svg(500, 200,
      B(6, 60, 170, 64, 'Provider|model-catalog endpoint', BLUE, at(2, 0.3), { fs: 18 }) +
      B(326, 60, 168, 64, 'Codex client|no update shipped', PINK, at(2, 0.7), { fs: 18 }) +
      A(176, 92, 326, 92, at(2, 1.1)) +
      T(251, 52, 'prompts', at(2, 1.4), { fs: 13.5, i: 1, anchor: 'middle' }) + T(251, 68, 'reasoning tiers', at(2, 1.7), { fs: 13.5, i: 1, anchor: 'middle' }) + T(251, 84, 'tool modes', at(2, 2.0), { fs: 13.5, i: 1, anchor: 'middle' }) +
      T(251, 114, 'per model release', at(2, 2.3), { fs: 12.5, anchor: 'middle', fill: '#666' }) +
      T(250, 172, 'Only the vendor can re-tune the scaffold server-side on model-release day.', at(2, 2.8), { fs: 14, i: 1, anchor: 'middle' })
    ), 'Vendor coupling is less about capability, more about the update loop.', { cur: [2] }),
    fig(`<div class="cards" ${at(3, 0.3)} data-stagger="0.5">
        <div class="card p"><b>Harness-enforced policy prose</b>${sc('Claude Code, OpenCode, Hermes')}</div>
        <div class="card b"><b>Structural contracts</b>${sc('Mistral Vibe')}: a seven-level instruction hierarchy</div>
        <div class="card g"><b>Delegation to user context</b>${sc('Pi')}: a 30-line prompt</div>
      </div><div style="height:10px"></div>` + dots('policy-level refusal language', 0, 11, at(3, 2.4), 'red'),
      'Three rhetorical strategies coexist; one invariant holds.', { cur: [3], style: 'flex:0 0 470px' }),
  ],
});

/* ---------- 5. Tools ---------- */
PAGES.push({
  n: '8', title: 'Tool and Action Systems',
  paras: [
    `The tool system defines what the agent can actually do, and it absorbs a large share of the engineering effort in every mature agent. Built-in surfaces run from a single bash tool to more than a hundred tools.`,
    `Deferred tool loading keeps the prompt small: tools are left out of the initial prompt and discovered on demand through a search tool. A Claude Code exclusive in April, it is a spreading pattern by July.`,
    `File editing is the core action. The eleven systems implement eight fundamentally different strategies, from exact unique-string replacement to nine-stage fuzzy cascades and custom patch languages.`,
    `O4:The file-editing strategy is one of the most important determinants of code-modification accuracy. Stronger models shift the optimum toward strict contracts: Mistral Vibe migrated from fuzzy SEARCH/REPLACE to exact matching within one quarter.`,
  ],
  figs: [
    fig(svg(492, 306, (() => {
      const rows = [['Mini-SWE-Agent', 1, 'bash only'], ['Pi', 7, '4 by default'], ['Mistral Vibe', 12], ['Aider', 13, 'edit formats'], ['OpenCode', 17], ['OpenHands', 25], ['Codex', 27], ['Gemini CLI', 35], ['Claude Code', 43], ['Hermes', 69, 'toolset-scoped'], ['OpenClaw', 109, '+ channels']];
      return rows.map(([n, v, note], i) => {
        const y = 6 + i * 27, w = v / 109 * 250, d = 0.3 + i * 0.22;
        return T(120, y + 15, n, at(0, d), { fs: 14.5, anchor: 'end' }) +
          `<rect ${at(0, d, 'data-anim="grow" data-dur="0.7"')} x="128" y="${y + 3}" width="${w}" height="15" fill="${i === 0 ? YEL : GREEN}" stroke="${INK}" stroke-width="1.2"/>` +
          `<g ${at(0, d + 0.3)}>${T(134 + w, y + 15, v, '', { fs: 14.5, b: 1 })}${note ? T(134 + w + (v > 99 ? 30 : v > 9 ? 22 : 13), y + 15, note, '', { fs: 12.5, i: 1, fill: '#666' }) : ''}</g>`;
      }).join('');
    })()), 'Built-in tool counts, July 2026 (edit formats for Aider).', { cur: [0] }),
  ],
  band: [
    fig(svg(500, 236,
      B(6, 30, 196, 176, '', '#fafafa', at(1, 0.2)) + T(104, 22, 'initial prompt: core tools only', at(1, 0.2), { fs: 13.5, i: 1, anchor: 'middle' }) +
      ['read', 'edit', 'bash', 'grep'].map((l, i) => B(22 + (i % 2) * 86, 46 + Math.floor(i / 2) * 40, 76, 28, l, GREEN, at(1, 0.4 + i * 0.12), { fs: 14 })).join('') +
      B(40, 154, 128, 34, 'tool_search', YEL, at(1, 1.1), { fs: 15 }) +
      B(306, 30, 188, 176, '', WHITE, at(1, 1.5), { dash: 1, stroke: '#777' }) + T(400, 22, 'deferred tools', at(1, 1.5), { fs: 13.5, i: 1, anchor: 'middle' }) +
      Array.from({ length: 8 }, (_, i) => `<rect ${at(1, 1.6 + i * 0.07)} x="${322 + (i % 2) * 84}" y="${46 + Math.floor(i / 2) * 38}" width="72" height="26" rx="4" fill="#f3f3f3" stroke="#777" stroke-dasharray="4 3"/>`).join('') +
      PA('M168,171 C230,171 250,120 306,118', at(1, 2.3)) + T(254, 106, 'on demand', at(1, 2.5), { fs: 13, i: 1, anchor: 'middle' }) +
      T(250, 230, 'Claude Code → Codex, Hermes', at(1, 3.0), { fs: 13.5, i: 1, anchor: 'middle', fill: '#555' })
    ), 'Deferred tool loading: the same prompt economics, three implementations.', { cur: [1], style: 'flex:0 0 450px' }),
    fig(table(['Edit strategy', 'Systems'], [
      ['Exact unique-string replacement', 'Claude Code, Mistral Vibe, Pi, OpenHands', '@data-focus="3"'],
      ['Fuzzy matching cascade', 'OpenCode, Hermes, Aider'],
      ['Custom patch DSL', 'Codex'],
      ['Cascade + LLM “edit fixer”', 'Gemini CLI'],
      ['<code>sed</code> / <code>awk</code> via bash', 'Mini-SWE-Agent'],
    ].map(r => { r[1] = sc(r[1]); return r; }), at(2, 0.4), 0.45), 'The main file-editing families in the corpus.', { cur: [2, 3] }),
  ],
});

/* ---------- 6. Memory ---------- */
PAGES.push({
  n: '9', title: 'Memory and Context Management',
  paras: [
    `Every agent runs into the same problem eventually: the conversation outgrows the context window. The eleven systems implement four practical strategies, in increasing order of sophistication.`,
    `Seven of the eleven converge on threshold-triggered LLM compaction, a de facto standard: when history nears the limit, summarize the older turns and keep a recent tail verbatim.`,
    `O5:Persistent memory has replaced compaction as the frontier of context engineering. Compaction designs have converged; what now differentiates the field is the memory write path: who writes the memory, and who reviews it.`,
    `For repository context the systems converge on auto-discovered Markdown files. None of the eleven uses embedding-based retrieval as its primary memory substrate.`,
  ],
  figs: [
    fig(svg(492, 200, (() => {
      const cs = [['Linear', 'no pruning', ['Mini-SWE-Agent'], WHITE], ['Summarization', 'recursive halving', ['Aider,', 'OpenClaw'], CREAM], ['Condensation', 'pluggable', ['OpenHands'], BLUE], ['Compaction', 'threshold-based', ['Claude Code, Codex,', 'Gemini CLI, Mistral Vibe,', 'Hermes, Pi, OpenCode'], GREEN]];
      let s = cs.map(([l, sub, sys, f], i) => {
        const x = 2 + i * 124;
        return `<g ${at(0, 0.3 + i * 0.5)}>` + B(x, 10, 116, 50, `${l}|${sub}`, f, i === 3 ? 'data-focus="1"' : '', { fs: 15 }) + sys.map((t, j) => T(x + 58, 80 + j * 15, t, '', { fs: i === 3 ? 11.5 : 12.5, i: 1, anchor: 'middle' })).join('') + `</g>`;
      }).join('');
      s += `<g ${at(0, 2.2)}>` + T(2, 160, 'simple', '', { fs: 13, i: 1, fill: '#666' }) + A(48, 156, 404, 156) + T(410, 160, 'sophisticated', '', { fs: 13, i: 1, fill: '#666' }) + `</g>`;
      return s;
    })()), 'Four context strategies; seven of eleven systems sit in the last.', { cur: [0] }),
    fig(svg(492, 150, (() => {
      let s = `<rect x="8" y="22" width="476" height="34" fill="none" stroke="${INK}" stroke-width="1.3"/>` + T(8, 14, 'context window', '', { fs: 13, i: 1, fill: '#555' });
      s += `<line x1="400" y1="10" x2="400" y2="62" stroke="${RED}" stroke-dasharray="4 3" stroke-width="1.4"/>` + T(406, 14, 'threshold', '', { fs: 12.5, i: 1, fill: RED });
      for (let i = 0; i < 9; i++) s += `<rect ${at(1, 0.2 + i * 0.2)} x="${11 + i * 43}" y="25" width="40" height="28" fill="${i < 6 ? '#e6e6e6' : BLUE}" stroke="${INK}" stroke-width="1"/>`;
      s += A(140, 62, 140, 92, at(1, 2.4)) + T(150, 82, 'summarize old turns', at(1, 2.4), { fs: 13, i: 1 });
      s += `<rect x="8" y="96" width="476" height="34" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
      s += B(11, 99, 104, 28, 'summary', YEL, at(1, 2.9), { fs: 14, rx: 0 });
      for (let i = 6; i < 9; i++) s += `<rect ${at(1, 3.2)} x="${11 + i * 43}" y="99" width="40" height="28" fill="${BLUE}" stroke="${INK}" stroke-width="1"/>`;
      s += T(333, 146, 'recent tail, verbatim', at(1, 3.4), { fs: 12.5, i: 1, anchor: 'middle' });
      return s;
    })()), 'Threshold compaction.', { at: 1 }),
  ],
  band: [
    fig(table(['Write path', 'System', 'Who writes, who reviews'], [
      ['Agent-maintained', sc('Codex'), 'a sandboxed sub-agent consolidates memories over a git-baselined store'],
      ['Human-gated', sc('Gemini CLI'), 'an extraction sub-agent writes to a patch inbox the user reviews'],
      ['Model-direct, bounded', sc('Hermes'), 'character-capped Markdown snapshots, frozen per session'],
      ['Pre-turn recall', sc('OpenClaw'), 'an Active Memory sub-agent runs before each reply'],
    ], at(2, 0.4), 0.7), 'Four governance models for persistent memory.', { cur: [2] }),
    fig(svg(420, 150,
      B(4, 2, 156, 40, 'CLAUDE.md|user scope', WHITE, at(3, 0.3), { fs: 14.5 }) +
      B(22, 52, 156, 40, 'AGENTS.md|project', WHITE, at(3, 0.6), { fs: 14.5 }) +
      B(40, 102, 156, 40, 'src/AGENTS.md|nested, just-in-time', WHITE, at(3, 0.9), { fs: 14.5 }) +
      B(322, 50, 94, 44, 'prompt', PINK, at(3, 1.3)) + A(160, 22, 322, 60, at(3, 1.3)) + A(178, 72, 322, 72, at(3, 1.3)) + A(196, 122, 322, 84, at(3, 1.3), { dash: 1 })
    ) + '<div style="height:6px"></div>' + dots('embedding retrieval', 0, 11, at(3, 2.0), 'red'),
      'Deterministic retrieval extends from code to memory.', { cur: [3], style: 'flex:0 0 420px' }),
  ],
});

/* ---------- 7. Safety ---------- */
PAGES.push({
  n: '10', title: 'Safety and Permission Models',
  paras: [
    `Safety mechanisms become important in direct proportion to the autonomy the agent is given. The corpus covers a wide range, from essentially no controls to multi-layered architectures.`,
    `Claude Code layers static hook rules, an LLM permission classifier, and an interactive dialog. Codex now stacks four layers, two of them converging on the same design: static rules, then an LLM reviewer, then an interactive or OS backstop.`,
    `O6:OS-level sandboxing is one of the most code-expensive capabilities in the corpus, and it is a choice rather than a consequence of scale. Hermes, among the largest systems here, ships zero OS-level isolation primitives.`,
    `Hermes spends its safety budget on a policy floor instead: twelve hardline patterns that survive <code>--yolo</code>. Pi documents the absence as a security argument in its own right.`,
  ],
  figs: [
    fig(svg(492, 312, (() => {
      const L = (x, y, l, f, d, i) => B(x, y, 226, 40, l, f, at(i, d), { fs: 15 });
      let s = `<g ${at(1, 0.2)}>` + T(119, 18, 'Claude Code', '', { fs: 16, b: 1, anchor: 'middle' }) + `</g>` +
        L(6, 30, 'Static hook rules', GREEN, 0.4, 1) + L(6, 82, 'LLM permission classifier', YEL, 0.8, 1) + L(6, 134, 'Interactive user dialog', PINK, 1.2, 1) +
        A(119, 70, 119, 82, at(1, 0.8)) + A(119, 122, 119, 134, at(1, 1.2));
      s += `<g ${at(1, 2.0)}>` + T(373, 18, 'Codex', '', { fs: 16, b: 1, anchor: 'middle' }) + `</g>` +
        L(260, 30, 'Starlark execution policy', GREEN, 2.2, 1) + L(260, 82, 'Lifecycle hooks', GREEN, 2.6, 1) + L(260, 134, 'Guardian: LLM reviewer', YEL, 3.0, 1) + L(260, 186, 'Native OS sandbox', BLUE, 3.4, 1) +
        A(373, 70, 373, 82, at(1, 2.6)) + A(373, 122, 373, 134, at(1, 3.0)) + A(373, 174, 373, 186, at(1, 3.4));
      s += `<g ${at(1, 1.4)}>` + T(119, 196, 'fastest, least context', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#666' }) + T(119, 212, '↓', '', { fs: 14, anchor: 'middle', fill: '#666' }) + T(119, 228, 'slowest, most reliable', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#666' }) + `</g>`;
      s += `<g ${at(1, 4.2)}>` + `<line x1="6" y1="254" x2="486" y2="254" stroke="#aaa"/>` + T(246, 278, 'static rules → LLM classifier → interactive / OS backstop', '', { fs: 14.5, i: 1, anchor: 'middle' }) + T(246, 298, 'both provider-native flagships now implement this pattern', '', { fs: 12.5, anchor: 'middle', fill: '#666' }) + `</g>`;
      return s;
    })()), 'Layered permission stacks in the two flagships.', { cur: [1] }),
  ],
  band: [
    fig(table(['OS-level isolation', 'Systems'], [
      ['Native, three platforms', 'Codex, Gemini CLI'],
      ['Opt-in OS sandbox', 'Claude Code'],
      ['Containers, pluggable backends', 'OpenHands, Mini-SWE-Agent, Hermes'],
      ['None built in', 'Mistral Vibe, Pi, OpenCode, Aider, OpenClaw'],
    ].map(r => { r[1] = sc(r[1]); return r; }), at(2, 0.4), 0.5) + '<div style="height:10px"></div>' +
      chips(['Linux: Bubblewrap', 'macOS: Seatbelt', 'Windows: restricted tokens'], at(2, 2.6), 'b', 0.3),
      'Where sandboxing is built, it is a multi-thousand-line investment.', { cur: [2] }),
    fig(`<div ${at(3, 0.3)} class="card y"><b>A floor beneath YOLO (${sc('Hermes')})</b>hardline patterns survive the bypass flag, which is frozen at module import</div><div style="height:8px"></div>` +
      chips(['rm -rf /', 'mkfs', 'dd to block devices', 'fork bombs', 'shutdown'], at(3, 1.0), 'p', 0.2) + '<div style="height:12px"></div>' +
      `<div class="quote" ${at(3, 2.6)}>A partial in-process sandbox “would be easy to misunderstand as a security boundary.”<small>${sc('Pi')} security documentation, as quoted in the paper</small></div>`,
      'Two positions on safety without a sandbox.', { cur: [3], style: 'flex:0 0 450px' }),
  ],
});

/* ---------- 8. Orchestration ---------- */
PAGES.push({
  n: '11', title: 'Multi-Agent Orchestration',
  paras: [
    `Nine of the eleven systems support multi-agent execution. This is the dimension on which the corpus is most spread out.`,
    `The paper identifies six patterns. First: a single agent with no spawn tool, sequential delegation where the parent blocks on one child, and parallel child sessions.`,
    `Then a hierarchical thread tree with fan-out, recursive composition where any agent spawns agents, and named agent registries behind a cross-process protocol.`,
    `O7:Coordinator-worker emerges independently across the corpus. So many independently developed codebases converging on the same hierarchical shape is strong evidence of convergent evolution.`,
    `They diverge in what they optimize: cost, isolation and scale, portability, simplicity, or containment.`,
  ],
  figs: [
    fig(dots('multi-agent execution', 9, 11, at(0, 0.4)), '', { cur: [0], h4: 'Across the eleven systems' }),
    fig(table(['System', 'Optimizes', 'How'], [
      ['Claude Code', 'cost', 'forks context, shares the prompt cache'],
      ['Codex', 'isolation, scale', 'depth-tracked thread tree, CSV fan-out'],
      ['Gemini CLI', 'portability', 'symmetric local/remote protocol'],
      ['Mistral Vibe', 'simplicity', 'in-process, sequential'],
      ['Hermes', 'containment', 'intersects toolsets, blocks recursion'],
    ].map(r => { r[0] = sc(r[0]); r[1] = `<b>${r[1]}</b>`; return r; }), at(4, 0.3), 0.5), 'Same shape, different optimization targets.', { cur: [4] }),
  ],
  band: [
    fig(svg(1032, 440, (() => {
      const W = 344, H = 220;
      const nd = (x, y, l, f = PINK, w = 96) => B(x - w / 2, y, w, 28, l, f, '', { fs: 14 });
      const cell = (i, title, sys, inner, pi, d) => {
        const ox = (i % 3) * W, oy = Math.floor(i / 3) * H;
        return `<g ${at(pi, d)} transform="translate(${ox},${oy})">${T(W / 2, 18, title, '', { fs: 15.5, b: 1, anchor: 'middle' })}${inner}${T(W / 2, 200, sys, '', { fs: 13, i: 1, anchor: 'middle', fill: '#555' })}</g>`;
      };
      let s = '';
      s += cell(0, '(1) Single-agent', 'Mini-SWE-Agent, Aider, Pi core',
        nd(150, 84, 'Agent') + PA('M198,90 C246,70 246,128 200,108') + T(244, 102, 'act–observe', '', { fs: 12.5, i: 1 }) + T(150, 150, 'no spawn tool', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#777' }), 1, 0.4);
      s += cell(1, '(2) Sequential delegation', 'Mistral Vibe',
        nd(172, 44, 'Parent') + nd(172, 132, 'Sub-agent', BLUE) + A(152, 72, 152, 132) + A(192, 132, 192, 72, '', { dash: 1 }) + T(144, 106, 'task', '', { fs: 12.5, i: 1, anchor: 'end' }) + T(200, 106, 'summary', '', { fs: 12.5, i: 1 }), 1, 1.8);
      s += cell(2, '(3) Parallel child sessions', 'OpenHands, OpenCode',
        nd(172, 44, 'Parent') + nd(92, 132, 'Session A', BLUE) + nd(252, 132, 'Session B', BLUE) + A(152, 72, 100, 132) + A(192, 72, 244, 132) + T(172, 178, 'concurrent; separate histories', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#777' }), 1, 3.6);
      s += cell(3, '(4) Hierarchical thread tree', 'Codex',
        nd(172, 36, 'Root thread') + nd(92, 94, 'Thread', BLUE) + nd(252, 94, 'Thread', BLUE) + A(152, 64, 100, 94) + A(192, 64, 244, 94) +
        [52, 132, 212, 292].map(x => B(x - 26, 152, 52, 24, '…', BLUE, '', { fs: 14 })).join('') + A(80, 122, 56, 152) + A(104, 122, 128, 152) + A(240, 122, 216, 152) + A(264, 122, 288, 152), 2, 0.3);
      s += cell(4, '(5) Recursive composition', 'Claude Code',
        nd(172, 34, 'Agent') + nd(172, 90, 'Sub-agent', BLUE) + nd(172, 146, 'Sub-sub-agent', BLUE, 116) + A(172, 62, 172, 90) + A(172, 118, 172, 146) + T(182, 81, 'fork context', '', { fs: 12.5, i: 1 }) + T(182, 137, 'fork context', '', { fs: 12.5, i: 1 }), 2, 1.6);
      s += cell(5, '(6) Registry + protocol', 'Gemini CLI, OpenClaw, Hermes swarm',
        nd(84, 44, 'Parent') + nd(84, 132, 'Registry', GREEN) + nd(272, 88, 'Remote agent', BLUE, 112) + A(84, 72, 84, 132) + A(132, 140, 216, 110) +
        `<line x1="196" y1="30" x2="196" y2="176" stroke="#999" stroke-dasharray="5 4"/>` + T(92, 106, 'invoke by name', '', { fs: 12.5, i: 1 }) + T(204, 44, 'process boundary', '', { fs: 12, i: 1, fill: '#777' }) + T(160, 160, 'A2A / ACP', '', { fs: 12.5, i: 1 }), 2, 2.9);
      return s;
    })()), 'The six multi-agent orchestration patterns. Red nodes spawn, blue nodes are spawned, green is the definition registry.', { cur: [1, 2] }),
  ],
});

/* ---------- 9. Extensibility ---------- */
PAGES.push({
  n: '12', title: 'Extensibility',
  paras: [
    `Two standards cut across the corpus. MCP standardizes how an agent talks to an external tool process. Skills standardize how an agent packages a unit of expertise into a discoverable directory.`,
    `O8:Skills have overtaken MCP as the corpus’s most-adopted extensibility standard: 9 of 11 systems implement SKILL.md bundles, versus 8 of 11 for MCP. Deferred loading is now the near-universal strategy.`,
    `A supply chain has emerged around the layer: hosted registries in four systems, trust tiers and quarantine, provenance verification, and the first agent-authored skills.`,
    `O11:ACP ships in six of eleven systems and has acquired a third role, harness hosting: OpenHands runs Claude Code, Codex, or Gemini CLI as interchangeable backends. For their own sub-agents, harnesses stay in-process.`,
  ],
  figs: [
    fig(svg(492, 178,
      T(0, 14, 'MCP', at(0, 0.3), { fs: 15, b: 1 }) + B(0, 22, 110, 40, 'Agent', PINK, at(0, 0.3)) + B(300, 22, 190, 40, 'external tool process', BLUE, at(0, 0.6), { fs: 15 }) + A(110, 42, 300, 42, at(0, 0.9), { both: 1 }) + T(205, 34, 'wire protocol', at(0, 0.9), { fs: 13, i: 1, anchor: 'middle' }) +
      T(0, 98, 'Skill', at(0, 1.8), { fs: 15, b: 1 }) + B(0, 106, 110, 40, 'Agent', PINK, at(0, 1.8)) + B(300, 92, 190, 78, '', YEL, at(0, 2.1)) +
      `<g ${at(0, 2.1)}>` + T(314, 112, 'my-skill/', '', { fs: 12.5, mono: 1 }) + T(314, 131, '  SKILL.md', '', { fs: 12.5, mono: 1 }) + T(326, 131, '', '') + T(314, 150, '  scripts/', '', { fs: 12.5, mono: 1 }) + `</g>` +
      A(300, 126, 110, 126, at(0, 2.5)) + T(205, 118, 'discovered, loaded on demand', at(0, 2.5), { fs: 13, i: 1, anchor: 'middle' })
    ), 'A wire protocol versus a capability bundle.', { cur: [0] }),
    fig(dots('SKILL.md skills', 9, 11, at(1, 0.3)) + dots('lifecycle hooks', 9, 11, at(1, 0.9)) + dots('MCP', 8, 11, at(1, 1.5)) + dots('ACP', 6, 11, at(3, 0.3)),
      'Extension standards by adoption.', { cur: [1, 3], h4: 'Across the eleven systems' }),
  ],
  band: [
    fig(svg(470, 210,
      B(0, 20, 108, 50, 'author|human or agent', WHITE, at(2, 0.3)) + A(108, 45, 136, 45, at(2, 0.7)) +
      B(136, 20, 96, 50, 'registry|hosted', BLUE, at(2, 0.7)) + A(232, 45, 260, 45, at(2, 1.1)) +
      B(260, 20, 110, 50, 'trust tier|scan, quarantine', YEL, at(2, 1.1)) + A(370, 45, 398, 45, at(2, 1.5)) +
      B(398, 20, 70, 50, 'agent', PINK, at(2, 1.5)) +
      T(0, 112, 'hosted registries in four systems', at(2, 1.9), { fs: 14.5 }) +
      T(0, 136, `trust tiers and quarantine in Hermes`, at(2, 2.3), { fs: 14.5 }) +
      T(0, 160, 'provenance verification in OpenClaw', at(2, 2.7), { fs: 14.5 }) +
      T(0, 184, 'agent-authored skills in Hermes and Gemini CLI', at(2, 3.1), { fs: 14.5 })
    ), 'Skills are now distributed like packages.', { cur: [2], style: 'flex:0 0 470px' }),
    fig(svg(500, 216, (() => {
      const row = (y, l, r, lab, d, o = {}) => B(0, y, 132, 40, l, o.lf || WHITE, at(3, d), { fs: 14.5 }) + B(330, y, 170, 40, r, o.rf || PINK, at(3, d), { fs: 14.5 }) + A(132, y + 20, 330, y + 20, at(3, d + 0.3), { both: o.both, dash: o.dash }) + T(231, y + 13, lab, at(3, d + 0.3), { fs: 13, i: 1, anchor: 'middle' }) + T(231, y + 36, o.sub || '', at(3, d + 0.3), { fs: 12, anchor: 'middle', fill: '#666' });
      return row(4, 'Editor', 'Harness', 'ACP', 0.6, { both: 1, sub: 'designed role' }) +
        row(84, 'Host harness', 'rival harness', 'ACP', 1.6, { lf: GREEN, sub: 'harness hosting' }) +
        row(164, 'Agent', 'Agent', 'A2A', 2.6, { both: 1, dash: 1, lf: PINK, sub: 'mesh, Gemini CLI only' });
    })()), 'Inter-agent protocols now play three roles.', { cur: [3] }),
  ],
});

/* ---------- 10. Absences ---------- */
PAGES.push({
  n: '13', title: 'Two Absences and Five Trade-offs',
  paras: [
    `O9:Two technologies the broader literature treats as central are missing from all eleven systems. No system uses a general-purpose agentic framework in its agent runtime; every loop is hand-rolled in the host language’s async primitives.`,
    `And no system uses vector-embedding retrieval for code. All rely on ripgrep, tree-sitter, glob, and auto-discovered Markdown context files. Both findings survived a threefold corpus expansion and a three-month re-audit.`,
    `The reason offered: production harnesses run on a different complexity budget. Debuggability and prompt transparency outweigh framework reuse when the failure mode is mutating real code.`,
    `Five trade-off axes organize the design space, and the audit catalogs 29 recurring patterns, several documented for the first time.`,
  ],
  figs: [
    fig(dots('agentic framework imported', 0, 11, at(0, 0.4), 'red') + '<div style="height:6px"></div>' +
      chips(['LangChain', 'LangGraph', 'AutoGen', 'CrewAI', 'a dozen others'], at(0, 1.2), 'x', 0.25) + '<div style="height:14px"></div>' +
      dots('code retrieved by embeddings', 0, 11, at(1, 0.4), 'red') + '<div style="height:6px"></div>' +
      chips(['ripgrep', 'tree-sitter', 'glob', 'Markdown context files'], at(1, 1.2), 'g', 0.25),
      'The twin absences, and what is used instead.', { cur: [0, 1], h4: 'Across the eleven systems' }),
    fig(`<div class="quote">Debuggability and prompt transparency outweigh framework reuse when the failure mode is mutating real code.<small>Observation 9</small></div>`, '', { at: 2, d: 0.3 }),
  ],
  band: [
    fig(svg(520, 250, (() => {
      const ax = [['Simplicity', 'Capability', 'Mini-SWE-Agent', 'Codex'], ['Autonomy', 'Safety', 'Mini-SWE-Agent, Aider', 'Codex, Claude Code'], ['Agnosticism', 'Provider coupling', 'LiteLLM-based systems', 'Claude Code, Codex'], ['Modular', 'Monolithic', 'Pi: core + extension bus', 'Codex: 126-crate workspace'], ['Model capability', 'Scaffold complexity', 'what completes tasks', 'what users need']];
      return ax.map(([l, r, ls, rs], i) => {
        const y = 22 + i * 48;
        return `<g ${at(3, 0.3 + i * 0.45)}>` + T(216, y, l, '', { fs: 16, b: 1, anchor: 'end' }) + T(216, y + 17, ls, '', { fs: 12.5, i: 1, anchor: 'end', fill: '#666' }) +
          A(228, y - 2, 292, y - 2, '', { both: 1 }) + T(304, y, r, '', { fs: 16, b: 1 }) + T(304, y + 17, rs, '', { fs: 12.5, i: 1, fill: '#666' }) + `</g>`;
      }).join('');
    })()), 'Five fundamental trade-off axes.', { cur: [3] }),
    fig(chips(['event sourcing', 'policy-as-code', 'recursive composition', 'verify-on-stop guards', 'lineage compaction', 'session-tree version control', 'log-as-queue loops', 'syntax-aware command permissioning', 'cache-dialect fanout', 'harness mimicry', 'agent-maintained memory pipelines'], at(3, 2.6), 'b', 0.16),
      'A sample of the 29-pattern catalog.', { cur: [3], h4: '29 recurring design patterns', style: 'flex:0 0 450px' }),
  ],
});

/* ---------- 11. Platform turn ---------- */
PAGES.push({
  n: '14', title: 'The Platform Turn',
  paras: [
    `There is a second reading of the missing frameworks: the harness <i>is</i> the framework. Not a library the developer imports, but a runtime the developer works inside of.`,
    `If so, the two categories should merge, and in 2026 they are merging from both directions. Harnesses became importable SDKs while framework vendors shipped harnesses, and both converge on the same artifact shape.`,
    `Textbook platform economics followed: marketplaces for plugins and skills, importers for each other’s on-disk state, and enterprise governance layers.`,
    `A meta-layer appeared in June. Omnigent implements no editing loop of its own; it orchestrates vendor harnesses behind one API, re-implementing the expensive parts and arbitraging the proprietary ones.`,
    `O12:The coding-agent harness completed its platform turn in the first half of 2026. The competitive unit of the field is no longer the agent loop; it is the ecosystem surface around it.`,
  ],
  figs: [
    fig(svg(492, 116,
      B(4, 8, 200, 74, '', WHITE, at(0, 0.3)) + T(16, 28, 'your code', at(0, 0.3), { fs: 13.5, i: 1 }) + B(64, 38, 124, 32, 'framework', BLUE, at(0, 0.6), { fs: 15 }) + T(104, 104, 'a library you import', at(0, 0.6), { fs: 13, i: 1, anchor: 'middle', fill: '#555' }) +
      A(218, 46, 268, 46, at(0, 1.2)) +
      B(284, 8, 204, 74, '', GREEN, at(0, 1.5)) + T(296, 28, 'harness', at(0, 1.5), { fs: 13.5, i: 1 }) + B(300, 38, 172, 32, 'task + Markdown files', WHITE, at(0, 1.8), { fs: 14.5 }) + T(386, 104, 'a runtime you work inside of', at(0, 1.8), { fs: 13, i: 1, anchor: 'middle', fill: '#555' })
    ), 'The CLI as framework.', { cur: [0] }),
    fig(svg(492, 258,
      T(80, 14, 'harness → framework', at(1, 0.3), { fs: 13.5, i: 1, anchor: 'middle' }) + T(412, 14, 'framework → harness', at(1, 1.4), { fs: 13.5, i: 1, anchor: 'middle' }) +
      ['Claude Agent SDK', 'openai-codex SDK', 'OpenHands SDK'].map((l, i) => B(2, 24 + i * 40, 158, 31, l, PINK, at(1, 0.4 + i * 0.25), { fs: 14.5 })).join('') +
      ['Deep Agents', 'Pydantic AI Harness', 'Strands harness-sdk'].map((l, i) => B(332, 24 + i * 40, 158, 31, l, BLUE, at(1, 1.5 + i * 0.25), { fs: 14.5 })).join('') +
      A(100, 140, 168, 190, at(1, 2.5)) + A(392, 140, 324, 190, at(1, 2.5)) +
      B(76, 192, 340, 56, 'loop + tools + skills + sub-agents|+ hooks + MCP + sessions', GREEN, at(1, 2.8), { fs: 16 })
    ), 'The harness–framework merger, July 2026.', { cur: [1] }),
  ],
  band: [
    fig(svg(520, 250,
      B(4, 74, 74, 40, 'client', WHITE, at(3, 0.3)) + A(78, 94, 106, 94, at(3, 0.5)) +
      `<g ${at(3, 0.5)}><line x1="114" y1="26" x2="114" y2="176" stroke="${INK}" stroke-width="1.6"/>${T(114, 16, 'one API', '', { fs: 12.5, i: 1, anchor: 'middle' })}</g>` +
      A(114, 94, 138, 94, at(3, 0.6)) + B(138, 60, 136, 68, 'Omnigent|no editing loop', YEL, at(3, 0.7), { fs: 18 }) +
      ['Claude Code', 'Codex', 'Cursor', 'OpenCode', 'Hermes', 'Pi'].map((l, i) => `<g ${at(3, 1.2 + i * 0.18)}><line x1="274" y1="94" x2="372" y2="${24 + i * 30}" stroke="#777" stroke-width="0.9"/>${B(372, 10 + i * 30, 120, 25, l, '#f0f0f0', '', { fs: 13.5 })}</g>`).join('') +
      T(432, 204, '23 harness adapters', at(3, 2.4), { fs: 12.5, i: 1, anchor: 'middle', fill: '#555' }) +
      T(4, 204, 'adds:', at(3, 2.8), { fs: 13.5, i: 1 }) + T(42, 204, 'composition · cross-harness policy', at(3, 2.8), { fs: 13.5 }) + T(42, 224, 'uniform sandbox · shareable sessions', at(3, 3.1), { fs: 13.5 })
    ), 'The meta-harness: harnesses as interchangeable components.', { cur: [3] }),
    fig(`<div class="cards" ${at(2, 0.3)} data-stagger="0.7">
        <div class="card g"><b>Marketplaces</b>${sc('Codex')} plugin marketplace; skill registries with trust tiers</div>
        <div class="card y"><b>Switching costs</b>${sc('Codex')} imports ${sc('Claude Code')}’s sessions and settings</div>
        <div class="card b"><b>Enterprise governance</b>MDM-managed preferences and a constraint engine above the user</div>
      </div>`, 'Three developments from the ninety-day window.', { cur: [2], style: 'flex:0 0 450px' }),
  ],
});

/* ---------- 12. Ninety days ---------- */
PAGES.push({
  n: '14.5', title: 'Ninety Days of Harness Evolution',
  paras: [
    `Convergence became imitation. April’s convergences were mostly independent rediscovery; July’s are traceable. Codex adopted Claude Code’s hook event vocabulary verbatim. Cross-harness lineage is now written in the code itself.`,
    `Patterns diffused down the corpus. The half-life of a competitive distinctive in this field is currently measurable in weeks.`,
    `Policy migrated out of prose: from the prompt, where the model reads it, to configuration, where the platform enforces it.`,
    `The trees themselves moved at platform speed. Codex’s workspace nearly doubled in one quarter, and Mistral Vibe grew 77%.`,
    `The methodological lesson: inventory claims decay in weeks, while structural claims have so far proven durable.`,
  ],
  figs: [
    fig(svg(492, 186,
      B(2, 66, 128, 54, 'Claude Code', PINK, at(0, 0.3), { fs: 17 }) +
      [['Codex CLI', 'hook vocabulary', 12], ['OpenHands', 'plugin manifest', 75], ['OpenCode', 'skills directory', 138]].map(([l, lab, y], i) =>
        B(352, y, 138, 36, l, WHITE, at(0, 0.8 + i * 0.7), { fs: 15 }) + A(130, 93, 352, y + 18, at(0, 1.0 + i * 0.7), { red: 1 }) +
        T(i === 1 ? 344 : 232, i === 0 ? 34 : i === 1 ? 86 : 160, lab, at(0, 1.0 + i * 0.7), { fs: 13, i: 1, anchor: 'end', fill: RED })).join('')
    ), 'Convergence becomes imitation.', { cur: [0] }),
    fig(table(['Pattern', 'April', 'July'], [
      ['Deferred tool loading', '1 system', '<b>3</b>'],
      ['Read-only plan modes', '2', '<b>4</b>'],
      ['LLM approval classifiers', '1', '<b>2</b>'],
      ['Turn-level checkpointing', '1', '<b>3</b>'],
      ['Safety-aware scheduling', '1', '<b>2</b>'],
    ], at(1, 0.3), 0.4), 'How far five patterns spread in one quarter.', { cur: [1] }),
  ],
  band: [
    fig(svg(500, 230, (() => {
      const row = (y, l, v, w, f, d) => T(0, y + 14, l, at(3, d), { fs: 14 }) + `<rect ${at(3, d, 'data-anim="grow" data-dur="0.9"')} x="52" y="${y}" width="${w}" height="18" fill="${f}" stroke="${INK}" stroke-width="1.2"/>` + T(60 + w, y + 14, v, at(3, d + 0.5), { fs: 14.5, b: 1 });
      return T(0, 16, 'Codex, lines of Rust', at(3, 0.2), { fs: 14.5, i: 1 }) + row(26, 'April', '621K · 89 crates', 180, '#e6e6e6', 0.3) + row(52, 'July', '~1.12M · 126 crates', 325, BLUE, 0.9) +
        T(0, 116, 'Mistral Vibe, lines (own scale)', at(3, 1.8), { fs: 14.5, i: 1 }) + row(126, 'April', '35.6K', 150, '#e6e6e6', 1.9) + row(152, 'July', '63K  (+77%)', 265, GREEN, 2.5);
    })()), 'One quarter of growth in two source trees.', { cur: [3] }),
    fig(svg(470, 84,
      B(0, 14, 170, 56, 'prompt|where the model reads it', PINK, at(2, 0.3), { fs: 17 }) + A(170, 42, 290, 42, at(2, 0.9)) + T(230, 34, 'policy', at(2, 0.9), { fs: 13, i: 1, anchor: 'middle' }) +
      B(290, 14, 180, 56, 'configuration|where the platform enforces it', GREEN, at(2, 1.3), { fs: 17 })
    ) + `<div class="cards" style="margin-top:8px">
        <div class="card" ${at(4, 0.3)}><b>Inventory claims decay in weeks</b>tool counts, feature cells, version pins</div>
        <div class="card b" ${at(4, 1.3)}><b>Structural claims endure</b>loop taxonomy, subsystem anatomy, the absences</div>
      </div>`, 'Policy leaves the prompt; only structure stays put.', { cur: [2, 4], style: 'flex:0 0 470px' }),
  ],
});

/* ---------- 13. Discussion ---------- */
PAGES.push({
  n: '15', title: 'Discussion',
  paras: [
    `The paper closes its analysis with a guiding intuition, not a proven property: for a fixed model and task set, scaffold complexity and task success appear to trace a roughly concave curve.`,
    `After a steep early-gain region, further scaffold work pays off in operational concerns rather than completion rate. Production systems invest in scaffolding not because models need it, but because users need it for safety, reliability, and workflow integration.`,
    `Consistent with this, Lin et al. report that structural harness elements carry their improvement, while the system prompt alone regresses performance.`,
    `The study’s limits are explicit. It rests on source-code reading, not runtime measurement; benchmark figures are self-reported; and the Claude Code analysis draws on a circulated snapshot rather than an official release.`,
  ],
  figs: [
    fig(svg(492, 320,
      `<line x1="46" y1="18" x2="46" y2="276" stroke="${INK}" stroke-width="1.3" marker-start="url(#ar)"/><line x1="46" y1="276" x2="478" y2="276" stroke="${INK}" stroke-width="1.3" marker-end="url(#ar)"/>` +
      T(262, 304, 'scaffold complexity', '', { fs: 14, i: 1, anchor: 'middle' }) + T(30, 150, 'task success', 'transform="rotate(-90 30 150)"', { fs: 14, i: 1, anchor: 'middle' }) +
      `<rect ${at(1, 0.4)} x="232" y="20" width="240" height="64" fill="${CREAM}" opacity=".55"/>` +
      `<path ${at(0, 0.6, 'data-anim="draw" data-dur="2.6"')} d="M46,262 L96,262 C128,262 134,112 214,86 C292,64 380,58 466,54" fill="none" stroke="#3257b8" stroke-width="2.6"/>` +
      `<g ${at(0, 0.9)}>` + T(52, 252, 'floor', '', { fs: 13.5, i: 1 }) + `</g>` +
      `<g ${at(0, 1.8)}>` + T(168, 176, 'steep early gains', '', { fs: 14.5, b: 1 }) + T(168, 194, 'a bash tool, a read/write tool,', '', { fs: 12.5, i: 1, fill: '#555' }) + T(168, 209, 'a Markdown context file', '', { fs: 12.5, i: 1, fill: '#555' }) + `</g>` +
      `<g ${at(1, 0.4)}>` + T(352, 106, 'diminishing returns', '', { fs: 14.5, b: 1, anchor: 'middle' }) + T(352, 124, 'pays off in safety, UX, extensibility', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#555' }) + `</g>`
    ), 'The scaffold–capability frontier: a hypothesis to be tested, not a measurement.', { cur: [0, 1] }),
  ],
  band: [
    fig(svg(500, 226, (() => {
      const zx = 190, k = 30;
      const rows = [['tools', 3.3], ['middleware', 2.2], ['long-term memory', 5.6], ['system prompt alone', -2.3]];
      let s = `<line x1="${zx}" y1="4" x2="${zx}" y2="196" stroke="${INK}" stroke-width="1.2"/>`;
      rows.forEach(([l, v], i) => {
        const y = 12 + i * 46, w = Math.abs(v) * k, d = 0.4 + i * 0.6;
        s += T(v > 0 ? zx - 10 : zx + 10, y + 16, l, at(2, d), { fs: 14.5, anchor: v > 0 ? 'end' : 'start' });
        s += `<rect ${at(2, d, `data-anim="grow" data-dur="0.8" ${v < 0 ? 'data-origin="right"' : ''}`)} x="${v > 0 ? zx : zx - w}" y="${y}" width="${w}" height="22" fill="${v > 0 ? GREEN : PINK}" stroke="${INK}" stroke-width="1.2"/>`;
        s += T(v > 0 ? zx + w + 8 : zx - w - 8, y + 16, (v > 0 ? '+' : '−') + Math.abs(v) + ' pp', at(2, d + 0.5), { fs: 14.5, b: 1, anchor: v > 0 ? 'start' : 'end', fill: v > 0 ? INK : RED });
      });
      s += T(zx, 216, 'change on SWE-bench Verified, percentage points', '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#666' });
      return s;
    })()), 'Component ablation reported by Lin et al. (Agentic Harness Engineering).', { cur: [2], at: 2 }),
    fig(`<div class="cards" ${at(3, 0.3)} data-stagger="0.9">
        <div class="card"><b>Source reading, not runtime measurement</b>how systems are structured, not how fast they are</div>
        <div class="card"><b>Self-reported benchmark figures</b>different models, dates, and configurations</div>
        <div class="card"><b>${sc('Claude Code')}: the weakest link</b>a circulated March 2026 snapshot, not an official release</div>
        <div class="card"><b>No head-to-head execution study</b>each system compared independently</div>
      </div>`, 'Threats to validity the authors name.', { cur: [3], style: 'flex:0 0 470px' }),
  ],
});

/* ---------- 14. Recommendations ---------- */
const RECS = [
  ['Loop', [[1, 'Start with a linear <code>while</code> loop', 0]]],
  ['Provider coupling', [[2, 'Couple to your home provider; keep a generic fallback', 1]]],
  ['Tools', [[3, 'Begin with just a bash tool', 0], [4, 'Past ~15 tools, adopt deferred tool loading', 0]]],
  ['File editing', [[5, 'Match the edit contract to your model tier', 1]]],
  ['Memory and context', [[6, 'Auto-discover hierarchical Markdown context files', 1], [7, 'Threshold compaction with a verbatim recent tail', 1], [8, 'Do not build RAG over code', 4, 1]]],
  ['Safety, by deployment context', [[9, 'Developer tool: PLAN / DEFAULT / YOLO approval modes', 2], [10, 'Enterprise: OS sandbox, policy-as-code, audit trails', 2], [11, 'Safety rules as data, with a floor beneath YOLO', 2]]],
  ['Orchestration', [[12, 'Stay single-agent until parallelism clearly wins', 3], [13, 'Ship an ACP server; keep sub-agents in-process', 3]]],
  ['Extensibility', [[14, 'Skills for capability templates, then MCP for integrations', 3]]],
  ['What not to build', [[15, 'No agentic framework in the agent runtime', 4, 1], [16, 'No vector-embedding retrieval layer for code', 4, 1], [17, 'No one-to-one wrappers of SaaS APIs as tools', 4, 1], [18, 'Do not over-engineer stuck detection', 4, 1]]],
];
PAGES.push({
  n: '16', title: 'Design Recommendations',
  paras: [
    `The descriptive audit condenses into 18 recommendations, each anchored in an observation and a system that implements it. Start with a linear loop and a single bash tool; add tools only in response to observed failure modes.`,
    `Couple tightly only if you ship the model. Match the edit contract to the model tier, auto-discover Markdown context files, and compact at a threshold while keeping a recent tail verbatim.`,
    `Choose the safety architecture by deployment context, codify the rules as policy files rather than imperative code, and keep a floor beneath any YOLO mode.`,
    `Stay single-agent until parallel context isolation clearly beats serial search. Ship an ACP server, and reach for skills before MCP.`,
    `Equally important is what not to build: a framework-based runtime, RAG over code, one-to-one API wrapper tools, and elaborate stuck detection.`,
  ],
  figs: [
    fig(`<div class="recs" ${at(0, 0.2)}>` + RECS.map(([g, rs]) => `<div class="gh">${g}</div>` + rs.map(([n, t, p, no]) => `<div class="rec ${no ? 'no' : ''}" data-focus="${p}"><span class="rn">${n}</span><span>${t}</span></div>`).join('')).join('') + `</div>`,
      'The eighteen recommendations, grouped by subsystem.', { cur: [0, 1, 2, 3, 4] }),
  ],
  band: [],
});

/* ---------- 15. Minimum viable harness ---------- */
PAGES.push({
  n: '16.10', title: 'A Minimum Viable Harness',
  paras: [
    `As a concrete starting point the paper sketches a harness in about 90 lines of Python: a linear loop, turn and cost limits, four tools, Markdown context discovery, and threshold compaction.`,
    `O13:The 90-line agent implements 10 of the 18 recommendations directly and is compatible with the remaining eight, with no framework dependencies, no RAG, no vector store, no multi-agent orchestration, and no sandbox.`,
    `It deliberately omits what the corpus shows divergence on. Start here, measure, and add the minimum that your observed failure modes demand.`,
  ],
  figs: [
    fig(chips(['linear loop', 'turn and cost limits', 'bash', 'read_file', 'write_file', 'search_replace', 'AGENTS.md discovery', 'threshold compaction'], at(0, 0.5), 'g', 0.3),
      'What the 90 lines contain.', { cur: [0], h4: 'Included' }),
    fig(bar('implemented directly', '10 <small>of 18</small>', 190, at(1, 0.4), 'k') + '<div style="height:6px"></div>' +
      chips(['no framework', 'no RAG', 'no vector store', 'no multi-agent', 'no sandbox'], at(1, 1.6), 'x', 0.4),
      'Ten of eighteen, with the twin absences intact.', { cur: [1], h4: 'Against the 18 recommendations' }),
  ],
  band: [
    fig(code([
      'async def run(self, task: str) -> str:',
      '    self.messages = [system(discover_context()), user(task)]',
      '    while True:',
      '        await self._check_limits()        # max_turns, max_cost',
      '        await self._maybe_compact()       # threshold compaction',
      '        resp = await self.model.complete(self.messages, tools=tool_schemas)',
      '        self.messages.append(resp)',
      '        if not resp.get("tool_calls"):',
      '            return resp.get("content", "")',
      '        for call in resp["tool_calls"]:   # serial execution',
      '            out = TOOLS[call["name"]](**call["args"])',
      '            self.messages.append(tool_result(call, out))',
    ], at(0, 1.6), 0.28), 'The core loop of the paper’s Listing 3, condensed. Illustrative scaffold, not production code.', { cur: [0, 2] }),
  ],
});

/* ---------- One turn, followed end to end (inserted after "What is a harness") ---------- */
PAGES.splice(2, 0, {
  n: '2.3', title: 'One Turn Through the Harness',
  paras: [
    `Before the dissection, follow one task through the whole machine. The loop first constructs a prompt: system instructions, auto-discovered context files, the conversation so far, and the task itself.`,
    `The model replies with a tool call rather than prose. The harness, not the model, decides whether that call may run: static rules first, then a classifier, then the user.`,
    `The call executes, inside a sandbox where one exists, and its output comes back as an observation appended to the history.`,
    `The cycle repeats until the model stops calling tools. Every section that follows is a closer look at one stage of this path.`,
  ],
  figs: [
    fig(`<div class="cards" ${at(0, 0.3)} data-stagger="0.5">
        <div class="card b" data-focus="0"><b>1 · Prompt construction</b>memory and context, LLM integration</div>
        <div class="card" data-focus="1"><b>2 · LLM inference</b>the model proposes an action</div>
        <div class="card g" data-focus="1,2"><b>3 · Tool execution</b>safety and permissions, tools and actions</div>
        <div class="card y" data-focus="2"><b>4 · Observation collection</b>back into the context window</div>
      </div>`, 'The iterative cycle nine of the eleven systems run.', { cur: [0, 1, 2], h4: 'The action–observation cycle' }),
  ],
  band: [
    fig(svg(1032, 372, (() => {
      const H = (x, t, s, a) => `<g ${a}>` + T(x, 18, t, '', { fs: 15.5, b: 1, anchor: 'middle' }) + T(x, 36, s, '', { fs: 12.5, i: 1, anchor: 'middle', fill: '#666' }) + `</g>`;
      const guide = (id, d) => `<path id="${id}" d="${d}" fill="none" stroke="none"/>`;
      let s = '';
      // stage 1: task and prompt assembly
      s += H(64, 'Task', 'interface layer', at(0, 0.2)) + B(0, 150, 128, 64, '', WHITE, at(0, 0.2)) +
        `<g ${at(0, 0.2)}>` + T(64, 176, 'fix the failing', '', { fs: 12.5, mono: 1, anchor: 'middle' }) + T(64, 194, 'test in utils.py', '', { fs: 12.5, mono: 1, anchor: 'middle' }) + `</g>`;
      s += H(274, 'Prompt', 'memory & context', at(0, 0.8));
      [['system prompt', BLUE], ['AGENTS.md', GREEN], ['history', '#ececec'], ['task', PINK]].forEach(([l, f], i) => { s += B(200, 96 + i * 34, 148, 30, l, f, at(0, 0.9 + i * 0.3), { fs: 14, rx: 2 }); });
      s += ribbon(128, 156, 208, 200, 198, 228, PINK, at(0, 1.9)) + guide('fl1', 'M128,182 C164,182 164,213 200,213') + rider('fl1', at(0, 2.0), 0.9);
      // stage 2: model, action, permission
      s += H(470, 'Model', 'LLM integration', at(1, 0.2)) + ribbon(348, 96, 228, 424, 150, 214, BLUE, at(1, 0.2)) + guide('fl2', 'M348,162 C386,162 386,182 424,182') + rider('fl2', at(1, 0.3), 0.9) +
        `<g ${at(1, 0.7)}><circle cx="470" cy="182" r="47" fill="${BLUE}" stroke="${INK}" stroke-width="1.3"/>${T(470, 189, 'LLM', '', { fs: 22, b: 1, anchor: 'middle' })}</g>`;
      s += H(652, 'Tool call', 'agent loop', at(1, 1.6)) + ribbon(517, 168, 196, 578, 160, 204, '#e7e2f4', at(1, 1.4)) + guide('fl3', 'M517,182 L578,182') + rider('fl3', at(1, 1.5), 0.7) +
        B(578, 152, 148, 60, '', WHITE, at(1, 1.9)) + `<g ${at(1, 1.9)}>` + T(652, 177, 'bash(', '', { fs: 12.5, mono: 1, anchor: 'middle' }) + T(652, 195, '"pytest -q")', '', { fs: 12.5, mono: 1, anchor: 'middle' }) + `</g>`;
      s += H(836, 'Permission', 'safety', at(1, 3.0)) + ribbon(726, 166, 198, 790, 136, 228, '#ececec', at(1, 2.8)) + guide('fl4', 'M726,182 C758,182 758,150 790,150') + rider('fl4', at(1, 2.9), 0.8) +
        B(790, 136, 92, 28, 'allow', GREEN, at(1, 3.3), { fs: 14 }) + B(790, 168, 92, 28, 'ask', YEL, at(1, 3.6), { fs: 14 }) + B(790, 200, 92, 28, 'deny', PINK, at(1, 3.9), { fs: 14 });
      // stage 3: execution and the way back
      s += H(980, 'Execute', 'tools & actions', at(2, 0.2)) + ribbon(882, 136, 164, 930, 160, 204, GREEN, at(2, 0.2)) + guide('fl5', 'M882,150 C906,150 906,182 930,182') + rider('fl5', at(2, 0.3), 0.7) +
        B(930, 152, 100, 60, 'shell|sandboxed', WHITE, at(2, 0.7), { fs: 16 }) + T(980, 234, '1 failed', at(2, 1.3), { fs: 13, mono: 1, anchor: 'middle', fill: RED });
      s += `<path ${at(2, 1.7, 'data-anim="draw" data-dur="1.5"')} d="M980,244 C980,352 274,372 274,268" fill="none" stroke="#e3c35a" stroke-width="13" stroke-linecap="round" opacity="0.6"/>` +
        guide('fl6', 'M980,244 C980,352 274,372 274,268') + rider('fl6', at(2, 1.8), 1.5) +
        T(640, 326, 'observation', at(2, 2.4), { fs: 14, i: 1, anchor: 'middle' }) +
        B(200, 232, 148, 30, 'observation', YEL, at(2, 3.3), { fs: 14, rx: 2 });
      return s;
    })()) + '<div style="height:14px"></div>' + table(['Turn', 'Model emits', 'Harness does', 'Observation'], [
      ['1', '<code>bash("pytest -q")</code>', 'checks permission, runs it', '1 failed'],
      ['2', '<code>read_file("utils.py")</code>', 'reads the file', 'file contents'],
      ['3', '<code>search_replace(…)</code>', 'applies an exact-match edit', 'OK'],
      ['4', '<code>bash("pytest -q")</code>', 'runs it again', 'all passed'],
      ['5', 'text, no tool calls', 'exits the loop', '<span class="m">none</span>'],
    ], at(3, 0.3), 0.55), 'One task flowing through the stages, then looping. An illustrative sequence; stage names follow the paper’s anatomy.', { cur: [0, 1, 2, 3] }),
  ],
});

/* ---------- 16. End card ---------- */
PAGES.push({
  kind: 'end', hold: 9,
  html: `
    <h1 ${at(0, 0.2)}>Harness Engineering</h1>
    <p ${at(0, 0.5)}>Anatomy, Architecture, and Evolution of Coding Agents</p>
    <div class="tk">
      <div ${at(0, 1.2)}><b>1</b><span>Loop sophistication does not predict benchmark performance. It predicts production readiness.</span></div>
      <div ${at(0, 2.6)}><b>2</b><span>The model–agent relationship is co-evolutionary, and coupling is about the update loop, not capability.</span></div>
      <div ${at(0, 4.0)}><b>3</b><span>The competitive unit is no longer the agent loop; it is the ecosystem surface around it.</span></div>
    </div>
    <div class="ref" ${at(0, 5.2)}>Barbaste, Darrigol, Vu, and Wiltberger · July 2026<br>arXiv:2609.00006v1 [cs.SE]</div>`,
});
