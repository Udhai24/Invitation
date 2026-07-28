/* Functional test harness for the wedding invitation.
   No headless browser is available in this sandbox, so app.js is executed
   against a real DOM via jsdom. Each scenario gets its own window, and the
   window is closed afterwards so its timers can't leak into the next one. */

import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const nodeTimeout = setTimeout;                       // survives global shadowing
const sleep = (ms) => new Promise(r => nodeTimeout(r, ms));

let fails = 0, passes = 0;
const ok  = (m) => { passes++; console.log('  \x1b[32m✓\x1b[0m ' + m); };
const bad = (m) => { fails++;  console.log('  \x1b[31m✗ ' + m + '\x1b[0m'); };
const eq  = (a, b, m) => (String(a) === String(b) ? ok(m) : bad(`${m}\n      got:  ${JSON.stringify(a)}\n      want: ${JSON.stringify(b)}`));
const has = (a, sub, m) => (String(a).includes(sub) ? ok(m) : bad(`${m}\n      got:  ${JSON.stringify(String(a).slice(0, 200))}`));
const yes = (v, m) => (v ? ok(m) : bad(m));
const no  = (v, m) => (!v ? ok(m) : bad(m));
const T   = (el) => el?.textContent?.trim().replace(/\s+/g, ' ') ?? '';

/* Deliberately NOT overriding setTimeout/setInterval: jsdom's own timer impl
   delegates to the realm globals, so swapping them causes infinite recursion.
   Node's timers are used instead, and every timer a scenario creates is tracked
   so close() can clear it — that's what stops one scenario's pending callbacks
   from writing into the next scenario's document. */
const GLOBALS = ['document', 'location', 'history', 'navigator', 'localStorage', 'matchMedia',
                 'IntersectionObserver', 'fetch', 'addEventListener', 'open', 'window', 'console',
                 'setTimeout', 'setInterval'];
const nodeInterval = setInterval;
const clearAny = (h) => { try { clearTimeout(h); } catch {} try { clearInterval(h); } catch {} };
const saved = Object.fromEntries(GLOBALS.map(k => [k, globalThis[k]]));
const set = (k, v) => { try { Object.defineProperty(globalThis, k, { value: v, writable: true, configurable: true }); } catch {} };

/** Boot the app in a fresh window. `reduced` skips the loader animation. */
async function run(query = '', { reduced = true, offline = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://example.test/invitation/' + query,
                               pretendToBeVisual: true, runScripts: 'dangerously' });
  const w = dom.window;
  const consoleErrors = [], warns = [], opened = [];

  w.console.error = (...a) => consoleErrors.push(a.join(' '));
  w.console.warn  = (...a) => warns.push(a.join(' '));
  w.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} });
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.fetch = async (p) => {
    if (offline) throw new Error('network down');
    const f = path.join(ROOT, String(p).replace(/^\.?\//, ''));
    if (!fs.existsSync(f)) return { ok: false, status: 404 };
    const txt = fs.readFileSync(f, 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(txt), text: async () => txt };
  };
  w.navigator.clipboard = { writeText: async () => {} };
  w.open = (u) => { opened.push(u); return null; };
  Object.defineProperty(w.document, 'fonts', { value: { ready: Promise.resolve() }, configurable: true });

  const timers = [];
  const bind = () => {
    for (const k of GLOBALS) {
      if (k === 'setTimeout')  { set(k, (f, ms) => { const h = nodeTimeout(f, ms);  timers.push(h); return h; }); continue; }
      if (k === 'setInterval') { set(k, (f, ms) => { const h = nodeInterval(f, ms); timers.push(h); return h; }); continue; }
      const v = k === 'window' ? w : w[k];
      set(k, typeof v === 'function' && v.bind ? v.bind(w) : v);
    }
  };
  bind();

  const tmp = `/tmp/app.${process.pid}.${Math.random().toString(36).slice(2)}.mjs`;
  fs.writeFileSync(tmp, fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8')
    .replace("'./config.js'", JSON.stringify(path.join(ROOT, 'assets/js/config.js')))
    .replace("'./i18n.js'",   JSON.stringify(path.join(ROOT, 'assets/js/i18n.js'))));
  await import('file://' + tmp);
  await sleep(50);
  fs.unlinkSync(tmp);

  const close = () => {
    timers.forEach(clearAny);
    w.close();
    for (const k of GLOBALS) set(k, saved[k]);
  };
  return { w, d: w.document, consoleErrors, warns, opened, bind, close };
}

const section = (n) => console.log(`\n\x1b[1m── ${n} ──\x1b[0m`);

/* ══════════════════════════════════════════════════════════════════════ */

section('1. Generic visitor, no ?id (Tamil default)');
{
  const s = await run('');
  eq(s.d.documentElement.lang, 'ta', 'html lang = ta');
  eq(s.d.documentElement.dataset.lang, 'ta', 'data-lang drives the Tamil font swap');
  eq(T(s.d.querySelector('#greetLine')), 'அன்புடையீர் வணக்கம்', 'warm generic greeting');
  yes(s.d.querySelector('#greetTag').hidden, 'category tag hidden with no guest');
  eq(T(s.d.querySelector('#nameA')), 'யுவஸ்ரீ', 'bride first (matches the printed card)');
  eq(T(s.d.querySelector('#nameB')), 'விக்னேஷ் குமார்', 'groom second');
  has(T(s.d.querySelector('#heroDate')), '2026', 'hero date rendered');
  eq(s.consoleErrors.length, 0, 'no console errors');
  s.close();
}

section('2. ?id=A1001 — Office guest, prefers English');
{
  const s = await run('?id=A1001');
  eq(s.d.documentElement.lang, 'en', "guest's own language preference honoured");
  eq(T(s.d.querySelector('#greetLine')), 'Welcome, Dr. Ramesh Kumar', 'personalised greeting');
  eq(T(s.d.querySelector('#greetTag')), 'Colleagues', 'category-aware tag');
  eq(s.d.querySelector('#greetTag').hidden, false, 'tag visible');
  eq(T(s.d.querySelector('#nameA')), 'Yuvasri', 'names in English');
  has(T(s.d.querySelector('#heroDate')), 'Sunday, 13 September 2026', 'English long date');
  s.close();
}

section('3. ?id=A1002 — Family guest, Tamil, uses nameTa');
{
  const s = await run('?id=A1002');
  eq(s.d.documentElement.lang, 'ta', 'Tamil for this guest');
  eq(T(s.d.querySelector('#greetLine')), 'இல்லம் வருக, R. சுரேஷ் குடும்பத்தார்', 'Family greeting differs from the default');
  eq(T(s.d.querySelector('#greetTag')), 'சொந்தம்', 'Tamil category tag');
  s.close();
}

section('4. ?lang= beats the guest record');
{
  const s = await run('?id=A1003&lang=ta');
  eq(s.d.documentElement.lang, 'ta', 'URL wins over guest.language=en');
  eq(T(s.d.querySelector('#greetLine')), 'மதிப்பிற்குரிய பேராசிரியர் மோகன் ராஜ்', 'Professor honorific in Tamil');
  s.close();
}

section('5. Unknown id, and a dead network, both degrade gracefully');
{
  const a = await run('?id=DOESNOTEXIST&lang=en');
  eq(T(a.d.querySelector('#greetLine')), 'Dear Guest, welcome', 'unknown id → generic greeting');
  yes(T(a.d.querySelector('#invBody')).length > 50, 'invitation still fully renders');
  eq(a.consoleErrors.length, 0, 'no console errors');
  a.close();

  const b = await run('?id=A1001&lang=en', { offline: true });
  eq(T(b.d.querySelector('#greetLine')), 'Dear Guest, welcome', 'guests.json unreachable → generic greeting');
  yes(T(b.d.querySelector('#invClose')).length > 50, 'rest of the invitation unaffected');
  eq(b.consoleErrors.length, 0, 'failure logged as a warning, not an error');
  yes(b.warns.some(x => x.includes('guest list unavailable')), 'warning explains what happened');
  b.close();
}

section('6. Every content slot is filled, no template leftovers');
{
  const s = await run('?lang=en');
  const ids = ['invBody', 'invClose', 'brPlace', 'brParentLabel', 'brParents', 'brChild', 'brOf',
               'grPlace', 'grParentLabel', 'grParents', 'grChild', 'grOf', 'vName', 'vSub',
               'vAddr', 'littleOne'];
  eq(ids.filter(i => T(s.d.querySelector('#' + i)) === '').join(',') || 'none', 'none', 'no empty content nodes');
  has(T(s.d.querySelector('#invBody')), 'Sunday, 13 September 2026', 'date in the invitation body');
  has(T(s.d.querySelector('#invBody')), 'Hastham Nakshatra', 'panchangam carried over from the card');
  has(T(s.d.querySelector('#invBody')), '6:00 AM and 7:30 AM', 'muhurtham window');
  has(T(s.d.querySelector('#invBody')), 'Sri Sampuraya Nallur Muthu Mariamman', 'family deity named');
  eq(T(s.d.querySelector('#brChild')), 'Yuvasri', 'bride name kept plain');
  eq(T(s.d.querySelector('#grChild')), 'Vignesh Kumar', 'groom name kept plain');
  has(T(s.d.querySelector('#brParents')), 'R. Valli', "bride's parents");
  has(T(s.d.querySelector('#grParents')), 'G. Udhayakumar', "groom's parents");
  no(/Srinivasan|Govindasamy|Kasthuri|Yasodha/.test(T(s.d.body)), 'no grandparents anywhere');
  no(/Sekar|Vijayakumar|Jayanthi/.test(T(s.d.body)), 'no periyappa / anna-anni list');
  yes(s.d.querySelector('#brMeta').hidden, 'degrees + institute hidden (showQualifications: false)');
  no(/M\.Sc\.|DMLT|B\.E\.,|Annamal|Intellect/.test(T(s.d.querySelector('.pair'))), 'no quals in the name blocks');
  has(T(s.d.querySelector('#invClose')), '631501', 'venue PIN in the closing line');
  const leftEn = T(s.d.body).match(/\{[a-zA-Z]+\}/g);
  eq(leftEn ? [...new Set(leftEn)].join(',') : 'none', 'none', 'no unreplaced {vars} in English');
  no(/undefined|NaN/.test(T(s.d.body)), 'no undefined/NaN leaking in English');
  s.close();

  const ta = await run('?lang=ta');
  const leftTa = T(ta.d.body).match(/\{[a-zA-Z]+\}/g);
  eq(leftTa ? [...new Set(leftTa)].join(',') : 'none', 'none', 'no unreplaced {vars} in Tamil');
  no(/undefined|NaN/.test(T(ta.d.body)), 'no undefined/NaN leaking in Tamil');
  has(T(ta.d.querySelector('#invBody')), 'அஸ்தம் நட்சத்திரம்', 'Tamil panchangam');
  eq(T(ta.d.querySelector('#brChild')), 'யுவஸ்ரீ', 'Tamil bride name');
  ta.close();
}

section('7. Two-day schedule: reception the evening before, then the muhurtham');
{
  const s = await run('?lang=en');
  const evs = [...s.d.querySelectorAll('#events .ev')];
  eq(evs.length, 2, 'two event cards');

  const [rec, muh] = evs;
  eq(T(rec.querySelector('.ev__name')), 'Reception', 'first card is the reception');
  has(T(rec), 'Saturday', 'reception falls on a Saturday');
  has(T(rec), '12 September 2026', 'reception is the day before the wedding');
  has(T(rec), '6:00 PM onwards', 'reception time');
  has(T(rec), 'Dinner at 7:30 PM', 'dinner time carried over from the draft');
  no(rec.classList.contains('ev--primary'), 'reception is not the primary event');

  eq(T(muh.querySelector('.ev__name')), 'Muhurtham', 'second card is the muhurtham');
  has(T(muh), 'Sunday', 'muhurtham falls on a Sunday');
  has(T(muh), '13 September 2026', 'muhurtham date');
  has(T(muh), 'Between 6:00 and 7:30 in the morning', 'muhurtham window');
  has(T(muh), 'Kanni Lagnam', 'lagnam shown under the muhurtham time');
  yes(muh.classList.contains('ev--primary'), 'muhurtham is highlighted as primary');

  evs.forEach(e => has(T(e), 'S.S.P Bhavana Hall', 'venue named on each card'));

  has(rec.querySelector('.ev__cal').href, '20260912T123000Z', 'reception 18:00 IST → 12:30 UTC');
  has(muh.querySelector('.ev__cal').href, '20260913T003000Z', 'muhurtham 06:00 IST → 00:30 UTC');
  has(muh.querySelector('.ev__cal').href, '20260913T020000Z', 'muhurtham end 07:30 IST → 02:00 UTC');
  s.close();

  const ta = await run('?lang=ta');
  const tevs = [...ta.d.querySelectorAll('#events .ev')];
  eq(T(tevs[0].querySelector('.ev__name')), 'மணமக்கள் வரவேற்பு', 'Tamil reception title');
  has(T(tevs[0]), 'இரவு 7.30 மணிக்கு மணவிருந்து', 'Tamil dinner line');
  eq(T(tevs[1].querySelector('.ev__name')), 'சுபமுகூர்த்தம்', 'Tamil muhurtham title');
  ta.close();
}

section('8. Countdown maths');
{
  const s = await run('');
  const target = new Date('2026-09-13T06:00:00+05:30').getTime();
  const expect = Math.floor((target - Date.now()) / 86400000);
  eq(Number(T(s.d.querySelector('#cdD'))), expect, `days remaining = ${expect}`);
  yes(/^\d{2}$/.test(T(s.d.querySelector('#cdH'))), 'hours zero-padded');
  yes(/^\d{2}$/.test(T(s.d.querySelector('#cdM'))), 'minutes zero-padded');
  yes(/^\d{2}$/.test(T(s.d.querySelector('#cdS'))), 'seconds zero-padded');
  yes(Number(T(s.d.querySelector('#cdH'))) < 24, 'hours < 24');
  yes(Number(T(s.d.querySelector('#cdM'))) < 60, 'minutes < 60');
  yes(s.d.querySelector('#cdMsg').hidden, 'post-event message hidden while the date is future');
  s.close();
}

section('9. Venue links and lazily-loaded map');
{
  const s = await run('?lang=en');
  has(s.d.querySelector('#vDir').href, 'maps/dir/?api=1&destination=', 'directions deep link');
  has(s.d.querySelector('#vDir').href, 'Kanchipuram', 'destination encoded');
  has(s.d.querySelector('#vMap').href, 'maps/search/?api=1', 'open-in-Maps link');
  const f = s.d.querySelector('#vMapBox iframe');
  yes(f, 'map iframe injected');
  eq(f.getAttribute('loading'), 'lazy', 'map is lazy-loaded (kind to mobile data)');
  yes(f.getAttribute('title'), 'map iframe is titled (a11y)');
  has(T(s.d.querySelector('#vAddr')), 'Vegavathi Street', 'street address');
  s.close();
}

section('10. Families, contacts, gallery');
{
  const s = await run('?lang=en');
  eq(s.d.querySelectorAll('#fams .fam').length, 2, 'two family cards');
  has(T(s.d.querySelector('#fams')), 'G. Udhayakumar', "groom's father");
  has(T(s.d.querySelector('#fams')), 'A. Valarmathi', "groom's mother");
  no(/Srinivasan|Govindasamy/.test(T(s.d.querySelector('#fams'))), 'family cards list parents only');
  has(s.d.querySelector('#fams a[href^="tel:"]').href, 'tel:+917708319668', 'bride-side phone is a tel: link');
  has(T(s.d.querySelector('#littleOne')), 'P. Mounasri', 'the little one from the card is credited');
  eq(s.d.querySelectorAll('#contacts .con').length, 4, 'four contacts');
  eq(s.d.querySelectorAll('#contacts a.con__call').length, 2, 'only contacts with numbers get a Call button');
  has(s.d.querySelectorAll('#contacts a.con__call')[0].href, 'tel:+918428493409', 'Udhayakumar call link');
  yes(s.d.querySelector('#gallery').hidden, 'gallery hides itself while empty');
  s.close();
}

section('11. RSVP is gone, contacts remain');
{
  const s = await run('?lang=en');
  no(s.d.querySelector('#rsvp'), 'no RSVP section in the DOM');
  no(s.d.querySelector('[data-rsvp]'), 'no RSVP buttons');
  no(s.d.querySelector('#rsvpForm'), 'no Google Form link');
  no(/wa\.me\/91/.test(s.d.body.innerHTML), 'no RSVP WhatsApp deep link anywhere');
  no(/RSVP/i.test(T(s.d.body)), 'the word RSVP appears nowhere');
  no(s.d.querySelector('.topbar__nav a[href="#rsvp"]'), 'RSVP removed from the nav');
  yes(s.d.querySelector('.topbar__nav a[href="#contact"]'), 'nav points at Contact instead');
  no(s.d.querySelector('#contact').hidden, 'contacts section still shown');
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  no(/rsvp/i.test(src), 'no leftover RSVP code in app.js');
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/main.css'), 'utf8');
  no(/\.rbtn|\.rsvp/.test(css), 'no leftover RSVP styles');
  s.close();
}

section('12. Sharing keeps the personalisation intact');
{
  const s = await run('?id=A1004&lang=en');
  const txt = decodeURIComponent(s.d.querySelector('#shareWa').href.split('text=')[1]);
  has(txt, 'id=A1004', 'forwarded link keeps the guest id');
  has(txt, 'lang=en', 'forwarded link keeps the language');
  has(txt, 'Vignesh Kumar', 'share text names the couple');
  has(txt, 'example.test/invitation/', 'share link derived from where the page is served');
  no(/undefined|null/.test(txt), 'no placeholder junk in the share text');
  s.close();

  // Served from a repo subpath, as GitHub Pages does — links must still be right
  const gh = await run('?id=A1004&lang=en');
  gh.d.defaultView.history.replaceState(null, '', '/invitation/index.html?id=A1004&lang=en');
  gh.close();

  const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  has(src, 'location.origin + location.pathname.replace', 'base URL falls back to the address bar');
  has(src, 'if (CONFIG.siteUrl) return CONFIG.siteUrl', 'an explicit siteUrl still wins if set');
  const cfg = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
  has(cfg, "siteUrl: ''", 'siteUrl ships empty — nothing to edit after deploying');
}

section('13. Language toggle');
{
  const s = await run('?lang=en');
  s.bind();
  eq(s.d.documentElement.lang, 'en', 'starts in English');
  s.d.querySelector('#langBtn').onclick();
  eq(s.d.documentElement.lang, 'ta', 'switches to Tamil');
  eq(T(s.d.querySelector('#greetLine')), 'அன்புடையீர் வணக்கம்', 'greeting re-rendered');
  eq(T(s.d.querySelector('#nameA')), 'யுவஸ்ரீ', 'names re-rendered');
  eq(T(s.d.querySelector('#events .ev__name')), 'மணமக்கள் வரவேற்பு', 'schedule re-rendered in Tamil');
  has(s.w.location.search, 'lang=ta', 'URL updated in place, no reload');
  eq(T(s.d.querySelector('#langBtnLabel')), 'English', 'toggle now offers the other language');
  eq(s.w.localStorage.getItem('wedding.lang'), 'ta', 'choice remembered for next visit');
  s.d.querySelector('#langBtn').onclick();
  eq(s.d.documentElement.lang, 'en', 'toggles back');
  eq(T(s.d.querySelector('#events .ev__name')), 'Reception', 'schedule back to English');
  s.close();
}

section('14. Language resolution order');
{
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  const order = src.slice(src.indexOf('function resolveLang'), src.indexOf('function saveLang'));
  yes(order.indexOf('searchParams') < order.indexOf('localStorage'), '?lang= is checked before the saved choice');
  yes(order.indexOf('localStorage') < order.indexOf('guest?.language'), 'saved choice beats the guest record');
  yes(order.indexOf('guest?.language') < order.indexOf('navigator.language'), 'guest record beats the browser locale');
  has(order, 'catch { /* private mode */ }', 'localStorage failure (private browsing) is handled');
}

section('15. Translation coverage');
{
  const { STRINGS } = await import('file://' + path.join(ROOT, 'assets/js/i18n.js'));
  const en = Object.keys(STRINGS.en), ta = Object.keys(STRINGS.ta);
  eq(en.filter(k => !ta.includes(k)).join(',') || 'none', 'none', 'every English key has a Tamil translation');
  eq(ta.filter(k => !en.includes(k)).join(',') || 'none', 'none', 'no orphan Tamil keys');
  eq(en.filter(k => !String(STRINGS.en[k]).trim()).join(',') || 'none', 'none', 'no blank English strings');
  eq(ta.filter(k => !String(STRINGS.ta[k]).trim()).join(',') || 'none', 'none', 'no blank Tamil strings');
  const used = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  eq(used.filter(k => !en.includes(k)).join(',') || 'none', 'none', 'every data-i18n hook in the HTML resolves');
  const varsOf = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  eq(en.filter(k => varsOf(STRINGS.en[k]) !== varsOf(STRINGS.ta[k])).join(',') || 'none', 'none',
     'EN and TA use the same {placeholders}');
  yes(en.length > 70, `${en.length} strings translated in each language`);
}

section('16. Loader lifecycle with animation enabled (real timers)');
{
  const s = await run('', { reduced: false });
  yes(s.d.body.classList.contains('is-loading'), 'scroll locked while the loader is up');
  const el = s.d.querySelector('#loader');
  yes(el && !el.classList.contains('is-done'), 'loader visible on arrival');
  yes(T(s.d.querySelector('#greetLine')).length > 0, 'content already rendered behind the loader');
  await sleep(2500);
  no(s.d.body.classList.contains('is-loading'), 'scroll unlocked afterwards');
  no(s.d.querySelector('#loader'), 'loader removed from the DOM');
  eq(s.consoleErrors.length, 0, 'no errors during the loader sequence');
  s.close();
}

section('16b. Loader failsafe survives a dead module (the file:// bug)');
{
  // Simulate the real failure: the ES module never runs at all.
  const dom = new JSDOM(html, { url: 'https://example.test/invitation/',
                                pretendToBeVisual: true, runScripts: 'dangerously' });
  const w = dom.window, d = w.document;
  yes(d.body.classList.contains('is-loading'), 'inline script locks scroll on arrival');
  yes(typeof w.__dismissLoader === 'function', 'failsafe installed by a classic (non-module) script');
  yes(w.__loaderFailsafe, 'failsafe timer armed');
  yes(d.getElementById('loader'), 'loader present, module has not run');
  w.__dismissLoader();                                   // what the 5s timer would do
  no(d.body.classList.contains('is-loading'), 'failsafe unlocks scroll');
  yes(d.getElementById('loader').classList.contains('is-done'), 'failsafe fades the loader out');
  w.close();

  // and the file:// case gets an explanation rather than a blank page
  const f = new JSDOM(html, { url: 'file:///C:/invitation/index.html',
                              pretendToBeVisual: true, runScripts: 'dangerously' });
  await sleep(60);
  const fd = f.window.document;
  no(fd.body.classList.contains('is-loading'), 'file:// dismisses the loader immediately');
  eq(fd.getElementById('fileWarn').hidden, false, 'file:// shows the "needs a web server" note');
  has(T(fd.getElementById('fileWarn')), 'python -m http.server', 'note tells you exactly what to run');
  f.window.close();
}

section('17. Slow-network safety and deployment sanity');
{
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  has(src, 'setTimeout(r, 3500)', 'loader hard-capped at 3.5s — a slow font CDN can never trap a guest');
  has(src, "console.warn('[invitation] guest list unavailable", 'guest fetch failure caught, never thrown');

  yes(fs.existsSync(path.join(ROOT, '.nojekyll')), '.nojekyll present for GitHub Pages');
  const abs = [...html.matchAll(/(?:src|href)="\/(?!\/)[^"]*"/g)].map(m => m[0]);
  eq(abs.join(',') || 'none', 'none', 'no root-absolute paths — works at any base path');
  const refs = [...html.matchAll(/(?:src|href)="((?:assets|tools)\/[^"]+)"/g)].map(m => m[1]);
  eq(refs.filter(r => !fs.existsSync(path.join(ROOT, r))).join(',') || 'none', 'none',
     `all ${refs.length} local assets referenced by index.html exist`);

  const css = fs.readFileSync(path.join(ROOT, 'assets/css/main.css'), 'utf8');
  has(css, 'prefers-reduced-motion', 'CSS honours prefers-reduced-motion');
  has(css, '@media print', 'print stylesheet present');
  // strip inline data-URIs first: they contain url(%23id) filter refs of their own
  const cssNoData = css.replace(/url\(["']?data:[^)]*\)/g, 'url(DATA)');
  no(/url\((?!DATA|["']?https:)/.test(cssNoData), 'CSS makes no external image requests');
  has(css, 'html[data-lang="ta"]', 'Tamil typography overrides present');
  has(css, '.skip-link', 'skip link styled');

  const bytes = ['index.html', 'assets/css/main.css', 'assets/js/app.js', 'assets/js/config.js', 'assets/js/i18n.js']
    .reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
  yes(bytes < 130_000, `critical path is ${(bytes / 1024).toFixed(0)} KB uncompressed`);
}

section('18. Accessibility markup');
{
  const s = await run('?lang=en');
  const d = s.d;
  yes(d.querySelector('a.skip-link[href="#invitation"]'), 'skip link present');
  eq(d.querySelectorAll('h1').length, 1, 'exactly one h1');
  yes(d.querySelector('#cd').getAttribute('aria-live'), 'countdown announced politely');
  has(d.querySelector('#langBtn').getAttribute('aria-label'), 'Tamil', 'language button says what it switches to');
  eq([...d.querySelectorAll('img')].filter(i => i.alt === null).length, 0, 'all images have alt text');
  yes(d.querySelector('main'), 'main landmark');
  yes(d.querySelector('footer'), 'footer landmark');
  yes(d.querySelector('nav[aria-label]'), 'nav is labelled');
  eq([...d.querySelectorAll('svg')].filter(x => !x.hasAttribute('aria-hidden') && !x.hasAttribute('role')).length,
     0, 'decorative SVGs are aria-hidden');
  eq([...d.querySelectorAll('iframe')].filter(x => !x.getAttribute('title')).length, 0, 'iframes titled');
  s.close();
}

section('19. ?n= links: greeting works with no guests.json entry');
{
  const s = await run('?n=Ramesh%20Mama&c=Relative&lang=en');
  eq(T(s.d.querySelector('#greetLine')), 'Welcome, Ramesh Mama', 'inline name used in the greeting');
  eq(T(s.d.querySelector('#greetTag')), 'Family & Relatives', 'inline category drives the tag');
  eq(s.d.querySelector('#greetTag').hidden, false, 'tag shown');
  eq(s.consoleErrors.length, 0, 'no console errors');
  s.close();
}

section('20. ?n= links: Tamil name via ?nt=');
{
  const s = await run('?n=Suresh%20Family&nt=%E0%AE%9A%E0%AF%81%E0%AE%B0%E0%AF%87%E0%AE%B7%E0%AF%8D%20%E0%AE%95%E0%AF%81%E0%AE%9F%E0%AF%81%E0%AE%AE%E0%AF%8D%E0%AE%AA%E0%AE%A4%E0%AF%8D%E0%AE%A4%E0%AE%BE%E0%AE%B0%E0%AF%8D&c=Family&lang=ta');
  eq(T(s.d.querySelector('#greetLine')), 'இல்லம் வருக, சுரேஷ் குடும்பத்தார்', 'Tamil name used in Tamil mode');
  eq(T(s.d.querySelector('#greetTag')), 'சொந்தம்', 'Tamil category tag');
  s.close();

  const en = await run('?n=Suresh%20Family&nt=%E0%AE%9A%E0%AF%81%E0%AE%B0%E0%AF%87%E0%AE%B7%E0%AF%8D&c=Family&lang=en');
  eq(T(en.d.querySelector('#greetLine')), 'Welcome home, Suresh Family', 'Latin name used in English mode');
  en.close();
}

section('21. ?n= links: single name used in both languages');
{
  const s = await run('?n=Arun&lang=ta');
  eq(T(s.d.querySelector('#greetLine')), 'வணக்கம், Arun', 'falls back to the Latin name, no blank');
  yes(s.d.querySelector('#greetTag').hidden, 'no category means no tag');
  s.close();
}

section('22. ?n= links: untrusted input is neutralised');
{
  const s = await run('?n=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&lang=en');
  const line = s.d.querySelector('#greetLine');
  eq(line.querySelectorAll('*').length, 0, 'no elements injected into the greeting');
  no(s.d.querySelector('#greetLine img'), 'no <img> created');
  no(/<img/i.test(s.d.body.innerHTML), 'no img tag anywhere in the document');
  has(T(line), 'img src=x', 'angle brackets stripped, text kept harmless');
  s.close();

  const long = await run('?n=' + 'A'.repeat(300) + '&lang=en');
  const shown = T(long.d.querySelector('#greetLine'));
  yes(shown.length < 90, `overlong name capped (${shown.length} chars) so the layout holds`);
  long.close();

  const junkCat = await run('?n=Arun&c=%3Cscript%3E&lang=en');
  eq(T(junkCat.d.querySelector('#greetLine')), 'Welcome, Arun', 'unknown category falls back to the default greeting');
  yes(junkCat.d.querySelector('#greetTag').hidden, 'bogus category shows no tag');
  junkCat.close();
}

section('23. ?id= precedence and fall-through');
{
  const s = await run('?id=A1001&n=Someone%20Else&lang=en');
  eq(T(s.d.querySelector('#greetLine')), 'Welcome, Dr. Ramesh Kumar', 'curated id takes precedence over ?n=');
  s.close();

  const miss = await run('?id=NOPE&n=Ramesh%20Mama&c=Relative&lang=en');
  eq(T(miss.d.querySelector('#greetLine')), 'Welcome, Ramesh Mama', 'unknown id falls through to the inline name');
  miss.close();

  const neither = await run('?lang=en');
  eq(T(neither.d.querySelector('#greetLine')), 'Dear Guest, welcome', 'neither given → generic greeting');
  neither.close();
}

section('24. Forwarding an inline-name link keeps the personalisation');
{
  const s = await run('?n=Ramesh%20Mama&nt=%E0%AE%B0%E0%AE%AE%E0%AF%87%E0%AE%B7%E0%AF%8D&c=Relative&lang=en');
  const txt = decodeURIComponent(s.d.querySelector('#shareWa').href.split('text=')[1]);
  has(txt, 'n=Ramesh+Mama', 'name carried into the share link');
  has(txt, 'nt=', 'Tamil name carried too');
  has(txt, 'c=Relative', 'category carried');
  has(txt, 'lang=en', 'language carried');
  s.close();
}

section('25. tools/create.html — the family-facing link creator');
{
  const p = path.join(ROOT, 'tools/create.html');
  const src = fs.readFileSync(p, 'utf8');

  // its sanitiser must match the app's
  const appSrc = fs.readFileSync(path.join(ROOT, 'assets/js/app.js'), 'utf8');
  const cls = /\[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028\\u2029\]/;
  yes(cls.test(src), 'creator sanitises control + invisible characters');
  yes(cls.test(appSrc), 'invitation sanitises the same set');

  has(src, 'noindex', 'creator page is noindex');
  has(src, "new URL('../', location.href)", 'derives the invitation URL from its own location');
  no(/localhost:8080\/\?/.test(src), 'no hardcoded host in generated links');

  const dom = new JSDOM(src, { url: 'https://example.test/invitation/tools/create.html',
                               pretendToBeVisual: true, runScripts: 'dangerously' });
  const w = dom.window, d = w.document;
  await sleep(60);

  eq(d.documentElement.lang, 'ta', 'opens in Tamil');
  eq(d.querySelectorAll('#chips .chip').length, 7, 'seven category chips (incl. "not specified")');
  yes(d.querySelector('#nm'), 'name field present');
  eq(T(d.querySelector('#pvLine')), 'அன்புடையீர் வணக்கம்', 'preview shows the generic greeting while empty');
  yes(d.querySelector('#waBtn').getAttribute('aria-disabled') === 'true', 'buttons disabled until a name is typed');

  // type a name
  d.querySelector('#nm').value = 'ரமேஷ் மாமா';
  d.querySelector('#nm').oninput();
  eq(T(d.querySelector('#pvLine')), 'வணக்கம், ரமேஷ் மாமா', 'preview updates live');
  no(d.querySelector('#waBtn').getAttribute('aria-disabled'), 'buttons enabled');
  const link = T(d.querySelector('#linkBox'));
  has(link, 'example.test/invitation/', 'link points at the invitation, not the tool');
  has(link, 'nt=', 'Tamil name goes into nt=');
  has(link, 'lang=ta', 'language included');
  no(link.includes('/tools/'), 'link does not point back into /tools/');

  // pick a category
  const chips = [...d.querySelectorAll('#chips .chip')];
  const family = chips.find(c => T(c) === 'சொந்தம்');
  family.onclick();
  eq(T(d.querySelector('#pvLine')), 'இல்லம் வருக, ரமேஷ் மாமா', 'category changes the preview greeting');
  eq(T(d.querySelector('#pvTag')), 'சொந்தம்', 'preview tag appears');
  has(T(d.querySelector('#linkBox')), 'c=Family', 'category added to the link');

  // switch the tool to English
  d.querySelector('#langBtn').onclick();
  eq(d.documentElement.lang, 'en', 'tool switches to English');
  eq(T(d.querySelector('#langBtn')), 'தமிழ்', 'toggle offers Tamil back');
  eq(d.querySelectorAll('#chips .chip').length, 7, 'chips rebuilt in English');
  yes(T(d.querySelector('#h1')).includes('personal invitation'), 'headings translated');

  // WhatsApp message
  // language toggle should swap the two name fields, not mislabel them
  eq(d.querySelector('#nm').value, '', 'English field is empty after the swap');
  eq(d.querySelector('#nm2').value, 'ரமேஷ் மாமா', 'Tamil name moved to the Tamil field');

  d.querySelector('#nm').value = 'Ramesh Mama';
  d.querySelector('#nm').oninput();
  // The preview deliberately shows the GUEST's view, which is still Tamil
  // because the invitation-language selector is on Tamil.
  eq(T(d.querySelector('#pvLine')), 'இல்லம் வருக, ரமேஷ் மாமா',
     'preview keeps showing the guest view (Tamil), not the tool language');
  d.querySelector('#lg').value = 'en';
  d.querySelector('#lg').onchange();
  eq(T(d.querySelector('#pvLine')), 'Welcome home, Ramesh Mama',
     'switching the invitation language flips the preview');
  eq(T(d.querySelector('#pvNames')), 'Yuvasri — Vignesh Kumar', 'couple names follow the guest language');
  const enLink = T(d.querySelector('#linkBox'));
  has(enLink, 'n=Ramesh+Mama', 'Latin name in n=');
  has(enLink, 'nt=', 'Tamil name preserved in nt=');

  const wa = d.querySelector('#waBtn').href;
  has(wa, 'wa.me/?text=', 'WhatsApp link');
  const msg = decodeURIComponent(wa.split('text=')[1]);
  has(msg, '12 Sep 2026', 'reception date in the English message');
  has(msg, '13 Sep 2026', 'muhurtham date in the English message');
  has(msg, 'Reception', 'reception labelled');
  has(msg, 'Muhurtham', 'muhurtham labelled');
  has(msg, 'S.S.P', 'venue in the message');

  // and the Tamil message carries the Tamil dates
  d.querySelector('#langBtn').onclick();
  const taMsg = decodeURIComponent(d.querySelector('#waBtn').href.split('text=')[1]);
  has(taMsg, '12.09.2026', 'reception date in the Tamil message');
  has(taMsg, 'சுபமுகூர்த்தம்', 'muhurtham named in Tamil');

  w.close();
}

section('26. Round trip: a creator link works in the invitation');
{
  // Exactly what section G generated: Tamil name + category
  const s = await run('?n=%E0%AE%B0%E0%AE%AE%E0%AF%87%E0%AE%B7%E0%AF%8D%20%E0%AE%AE%E0%AE%BE%E0%AE%AE%E0%AE%BE&nt=%E0%AE%B0%E0%AE%AE%E0%AF%87%E0%AE%B7%E0%AF%8D%20%E0%AE%AE%E0%AE%BE%E0%AE%AE%E0%AE%BE&c=Family&lang=ta');
  eq(T(s.d.querySelector('#greetLine')), 'இல்லம் வருக, ரமேஷ் மாமா', 'round-trip: creator link greets correctly');
  eq(T(s.d.querySelector('#greetTag')), 'சொந்தம்', 'round-trip: category tag correct');
  yes(T(s.d.querySelector('#invBody')).length > 50, 'round-trip: full invitation renders');
  eq(s.consoleErrors.length, 0, 'round-trip: no console errors');
  s.close();
}

console.log(fails === 0
  ? `\n\x1b[1;32m${passes} checks passed, 0 failed.\x1b[0m\n`
  : `\n\x1b[1;31m${passes} passed, ${fails} FAILED.\x1b[0m\n`);
process.exit(fails ? 1 : 0);
