/* IndustryBridge · shared layer for the solver pages.
 * Live mode: talks to the Apps Script web app (apps-script/BridgePagesAPI.gs) on the same Google Sheet as AppSheet.
 * Demo mode: no web app set, or ?demo=1 → a built-in CH001 sample kept in this browser, so links still open on any phone.
 */
(function () {
  // Paste the web app URL (…/exec) here after deploying BridgePagesAPI.gs.
  const IB_API_DEFAULT = 'https://script.google.com/macros/s/AKfycbwJBZi2BdHdqgKZHU8Za8WcGeRW4sYEL27pDENgnPhOSNZLqHMOeTmI0690Nu9t_BhpUg/exec';

  const qs = new URLSearchParams(location.search);
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} },
  };
  if (qs.get('engine')) ls.set('ib-bridge-api', qs.get('engine') === 'off' ? null : qs.get('engine'));
  const API = qs.get('demo') === '1' ? '' : (ls.get('ib-bridge-api') || IB_API_DEFAULT);

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = Number(v); return isNaN(n) ? 0 : n; };
  const rm = v => 'RM ' + num(v).toLocaleString('en-MY');
  const split = v => String(v || '').split(/\s*[;\n]\s*/).filter(Boolean);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function call(name, params = {}, write = false) {
    if (!API) return Demo.run(name, params);
    let r;
    try {
      r = write
        ? await fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ fn: name }, params)) })
        : await fetch(API + '?' + new URLSearchParams(Object.assign({ api: name }, params)));
    } catch (e) { throw new Error('Could not reach IndustryBridge. Check your connection and try again.'); }
    const j = await r.json().catch(() => ({ ok: false, error: 'Unexpected answer from the server.' }));
    if (!j.ok) throw new Error(j.error || 'Something went wrong.');
    return j;
  }

  /* ---------------- demo backend: same calls as Engine, kept in this browser ---------------- */
  const DKEY = 'ib-bridge-demo-v2';
  const SEED = () => ({
    challenges: [{ challenge_id: 'CH001', title: 'Catch cracked and misaligned chip packages on our line', owner_org: 'Melaka Semicon Assembly (demo)',
      budget_band: 'RM 50k - 150k', deadline: '2027-06-30', location_state: 'Melaka', confidentiality: 'Invited only', status: 'Invited',
      brief_summary: 'A back-end assembly line packs about 40,000 chip packages a day and misses double-mounted, misaligned and cracked units. The company wants an AI camera check that flags bad units in real time.',
      domain: 'Manufacturing Computer Vision', skills: 'Computer vision; Deep learning; Industrial cameras; Edge deployment; Data labelling',
      deliverables: 'Trained defect model; Inline camera prototype; Accuracy report', readiness: 'Prototype needed',
      success_kpi: 'Detect 95% of cracked or misaligned units; under 1% false rejects; under 200 ms per unit',
      data_needed: 'About 5,000 labelled line images and access to the end-of-line station for a 4-week pilot',
      funding_hint: 'PPRN (MOHE Public-Private Research Network): industry co-funds university R&D',
      market_low: 60000, market_high: 120000, market_note: 'Similar university AOI pilots and vendor line-integration jobs in Malaysia, 2023–2026',
      bid_deadline: '2026-12-31', selected_proposal: '', milestones: '' }],
    cands: [
      { cand_id: 'CH001-E1', challenge_id: 'CH001', solver_type: 'Expert', solver_id: 'EXP008', solver_name: 'Profesor Madya Ts. Dr. Choo Yun Huoy', org: 'FAIX, UTeM',
        rank: 1, score: 88, fit_topic: 36, fit_industry: 20, fit_recent: 14, fit_impact: 6, fit_capacity: 9, email_to: 'demo-expert@utem.edu.my',
        evidence: 'Leads a 2026 industry grant on an AI system that detects double unit mounting, misalignment and package cracks, the same defects on this line.', response: 'Sent', invited: true },
      { cand_id: 'CH001-P1', challenge_id: 'CH001', solver_type: 'Partner', solver_id: 'PTN5959610', solver_name: 'Visynamics Holdings Berhad', org: 'Melaka · visynamics.com',
        rank: 1, score: 81, fit_topic: 34, fit_industry: 22, fit_recent: 0, fit_impact: 12, fit_capacity: 0, email_to: 'demo-partner@visynamics.com',
        evidence: 'Delivered tray-to-tray vision inspection systems that catch IC package micro-cracks, chipped edges and unit misalignment.', response: 'Sent', invited: true },
    ],
    proposals: [], qna: [], optout: [], claims: {}, runs: [
      { run_id: 'R1', agent: 'A1 Scoper + A2 Router', status: 'Done', started_at: '', note: 'Manufacturing Computer Vision' },
      { run_id: 'R2', agent: 'R1–R4 + S1 Matchmaker', status: 'Done', started_at: '', note: '8 experts shortlisted with reasons' },
      { run_id: 'R3', agent: 'P1 Vendor Scout + P2 Portfolio', status: 'Done', started_at: '', note: '5 companies (Verified list)' },
      { run_id: 'R4', agent: 'S3 Guardian + S2 Messenger', status: 'Done', started_at: '', note: '2 sent, 0 blocked' },
    ],
  });
  const BID_KEYS = ['proposal_id', 'approach', 'weeks', 'cost_rm', 'team', 'students', 'payment_terms', 'ip_terms', 'support_months', 'vs_market', 'bid_round', 'submitted_at', 'status', 'counter_price', 'counter_terms', 'counter_note', 'counter_status', 'decided_at'];
  const Demo = {
    db() { try { return JSON.parse(ls.get(DKEY)) || SEED(); } catch (e) { return SEED(); } },
    save(d) { ls.set(DKEY, JSON.stringify(d)); },
    reset() { ls.set(DKEY, null); },
    now() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; },
    cand(d, p, need) {
      const c = d.cands.find(x => x.cand_id === p.inv && (p.k === 'demo' || p.k === x.cand_id));
      if (need && !c) throw new Error('This link is not valid. Please use the link in your invitation email.');
      return c;
    },
    prop(d, c) { return d.proposals.filter(x => x.cand_id === c.cand_id).pop() || null; },
    counterOpen(pr) { return !!pr && !!(pr.counter_price || pr.counter_terms || pr.counter_note) && /^(|pending|sent|countered|open)$/i.test(pr.counter_status || ''); },
    decision(ch, pr) {
      if (!pr) return null;
      if (/^selected/i.test(pr.status) || (ch.selected_proposal && ch.selected_proposal === pr.proposal_id)) return 'selected';
      if (/withdrawn/i.test(pr.status)) return 'withdrawn';
      if (/not selected/i.test(pr.status) || ch.selected_proposal) return 'not_selected';
      return null;
    },
    vs(ch, v) { const lo = num(ch.market_low), hi = num(ch.market_high); return !v || !lo || !hi ? '' : v < lo ? 'Below market' : v > hi ? 'Above market' : 'Within market'; },
    opted(d, c, ch) { return d.optout.some(o => o.email === c.email_to && (o.scope === 'All' || o.topic === ch.domain)); },
    pub(ch) { return Object.assign({}, ch, { owner: ch.confidentiality === 'Public' ? ch.owner_org : 'A company in ' + ch.location_state }); },
    bidData(p, ch) {
      if (!p.approach || !num(p.weeks) || !num(p.cost_rm) || !p.team || !p.ip_terms) throw new Error('Please fill in approach, weeks, price, team and IP terms.');
      return { approach: p.approach, weeks: num(p.weeks), cost_rm: num(p.cost_rm), team: p.team,
        students: [].concat(p.students || []).filter(s => s && s.name).map(s => `${s.name} (${s.role})`).join('; '),
        payment_terms: /milestone/i.test(p.payment_terms) ? 'By milestone' : 'One payment', ip_terms: p.ip_terms, support_months: Math.max(0, Math.round(num(p.support_months))),
        vs_market: this.vs(ch, num(p.cost_rm)), submitted_at: this.now(), status: 'Submitted' };
    },
    async run(a, p) {
      await new Promise(r => setTimeout(r, 250));
      const d = this.db(), c0 = d.cands.find(c => c.cand_id === p.inv), ch = d.challenges.find(x => x.challenge_id === (c0 ? c0.challenge_id : p.ch)) || d.challenges[0];
      const out = { ok: true, demo: true };
      if (a === 'bid') {
        const c = this.cand(d, p, false);
        if (!c) return Object.assign(out, ch.confidentiality === 'Public' ? { state: 'public', challenge: this.pub(ch) } : { state: 'locked', challenge: { title: ch.title, brief_summary: ch.brief_summary, confidentiality: ch.confidentiality } });
        const pr = this.prop(d, c), mine = pr ? Object.fromEntries(BID_KEYS.map(k => [k, pr[k] ?? ''])) : null;
        return Object.assign(out, { state: 'invited', challenge: this.pub(ch), deadlinePassed: false, cand: c, proposal: mine, counterOpen: this.counterOpen(pr),
          decision: this.decision(ch, pr), milestones: pr ? { text: ch.milestones } : null, optedOut: this.opted(d, c, ch), qna: d.qna.filter(q => q.asked_by === c.solver_name) });
      }
      if (a === 'respond') { const c = this.cand(d, p, true); c.response = p.answer === 'Declined' ? 'Declined' : 'Interested'; this.save(d); return Object.assign(out, { response: c.response }); }
      if (a === 'submitBid' || (a === 'respondCounter' && p.answer === 'Revise')) {
        const c = this.cand(d, p, true), old = this.prop(d, c), data = this.bidData(p, ch);
        if (old && !/withdrawn/i.test(old.status)) { Object.assign(old, data, { bid_round: num(old.bid_round || 1) + 1 }); if (this.counterOpen(old)) old.counter_status = 'Revised'; }
        else { d.proposals.push(Object.assign({ proposal_id: 'P' + Date.now(), challenge_id: c.challenge_id, cand_id: c.cand_id, solver_name: c.solver_name, solver_type: c.solver_type, bid_round: 1 }, data));
          d.runs.push({ run_id: 'R' + Date.now(), agent: 'Proposal received', status: 'Done', started_at: this.now(), note: c.solver_name }); }
        c.response = 'Interested'; if (/^(briefed|shortlisted|invited)$/i.test(ch.status)) ch.status = 'Receiving';
        this.save(d); return Object.assign(out, { vs_market: data.vs_market });
      }
      if (a === 'respondCounter') {
        const c = this.cand(d, p, true), pr = this.prop(d, c);
        if (!this.counterOpen(pr)) throw new Error('There is no open counter-offer.');
        if (p.answer === 'Accept') { pr.counter_status = 'Accepted'; if (num(pr.counter_price)) { pr.cost_rm = num(pr.counter_price); pr.vs_market = this.vs(ch, pr.cost_rm); } }
        else if (p.answer === 'Withdraw') { pr.counter_status = 'Withdrawn'; pr.status = 'Withdrawn'; pr.decided_at = this.now(); }
        this.save(d); return out;
      }
      if (a === 'askQuestion') { const c = this.cand(d, p, true); if (!p.question) throw new Error('Please type a question.'); d.qna.push({ question: p.question, answer: '', asked_by: c.solver_name, asked_at: this.now() }); this.save(d); return out; }
      if (a === 'optout') { const c = this.cand(d, p, true), oid = 'O' + Date.now(); d.optout.push({ optout_id: oid, email: c.email_to, scope: p.scope === 'Topic' ? 'Topic' : 'All', topic: p.scope === 'Topic' ? ch.domain : '', reason: p.reason || '' }); this.save(d); return Object.assign(out, { optout_id: oid }); }
      if (a === 'undoOptout') { const c = this.cand(d, p, true); d.optout = d.optout.filter(o => !(o.optout_id === p.optout_id && o.email === c.email_to)); this.save(d); return out; }
      if (a === 'live') {
        const live = d.proposals.filter(x => !/withdrawn/i.test(x.status)), sel = d.proposals.find(x => this.decision(ch, x) === 'selected');
        return Object.assign(out, { challenge: this.pub(ch), runs: d.runs.slice(-40),
          cands: d.cands.map(c => Object.assign({}, c, { bid: live.some(x => x.cand_id === c.cand_id) })),
          bids: { count: live.length, countered: d.proposals.filter(x => this.counterOpen(x)).length },
          selected: sel ? { cand_id: sel.cand_id, solver_name: sel.solver_name, milestones: { text: ch.milestones } } : null });
      }
      if (a === 'pool' || a === 'profile' || a === 'claim' || a === 'saveProfile') return this.profileish(a, p, d, out);
      throw new Error('Not available in demo mode.');
    },
    async experts() { if (!this._ex) this._ex = await (await fetch('match-experts.json')).json(); return this._ex; },
    async profileish(a, p, d, out) {
      const ex = await this.experts();
      if (a === 'pool') return Object.assign(out, { experts: ex.map(e => ({ id: e.id, n: e.n, f: e.f, u: 'UTeM', fl: e.fl.split(';').slice(0, 2).join(';'), p: (e.p[0] || [])[1] || '' })), partners: [{ id: 'PTN5959610', n: 'Visynamics Holdings Berhad', st: 'Melaka' }, { id: 'PTN5963081', n: 'TT Vision Holdings Berhad', st: 'Penang' }] });
      const e = ex.find(x => x.id === p.e);
      if (!e) throw new Error(p.p ? 'Company profiles need the live connection.' : 'Profile not found.');
      const cl = d.claims[e.id] || {};
      if (a === 'claim') { const em = String(p.email || '').toLowerCase(); if (!/@(.+\.)?utem\.edu\.my$/.test(em)) throw new Error('Use your official work email ending in @utem.edu.my.'); d.claims[e.id] = Object.assign(cl, { claimed: true }); this.save(d); return Object.assign(out, { editKey: 'demo-' + e.id }); }
      if (a === 'saveProfile') { if (p.key !== 'demo-' + e.id) throw new Error('Please claim this profile first.'); Object.assign(cl, { claimed: true, open_to_industry: !!p.open_to_industry, fields: p.fields || cl.fields, hidden: !!p.hide }); d.claims[e.id] = cl; this.save(d); return out; }
      return Object.assign(out, { kind: 'Expert', hidden: !!cl.hidden,
        profile: { expert_id: e.id, name: e.n, title: e.t, university: 'UTeM', faculty: e.f, fields: cl.fields || e.fl, h_index: e.h, citations: e.c, students_supervised: e.s || '',
          claimed: !!cl.claimed, open_to_industry: !!cl.open_to_industry, domain: 'utem.edu.my', source: 'UTeM Expert Directory + OpenAlex', last_crawled: '2026-11-27',
          profile_url: 'https://ecv.utem.edu.my/expert/' },
        papers: e.p.map(x => ({ year: x[0], title: x[1] })), grants: e.g.map(x => ({ year: x[0], title: x[1], type: x[2], amount_rm: x[3], role: x[4] })) });
    },
  };

  function demoBar(extra) {
    if (API) return;
    const bar = document.createElement('div');
    bar.className = 'demo-bar';
    bar.innerHTML = '<b>Demo data</b><span class="muted">stored in this browser</span>' + (extra || '') + '<button class="ghost" data-reset>Reset</button>';
    bar.querySelector('[data-reset]').onclick = () => { Demo.reset(); location.reload(); };
    document.body.appendChild(bar);
    document.body.classList.add('has-demo');
    return bar;
  }

  window.IB = { API, live: !!API, call, param: k => qs.get(k), $, esc, num, rm, split, reduced, Demo, demoBar, ls };
})();
