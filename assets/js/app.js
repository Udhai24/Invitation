/* =============================================================================
   app.js — application bootstrap
   Responsibilities: guest lookup → language → render → interactions.
   No framework, no build step. ES modules, works on GitHub Pages as-is.
   ========================================================================== */

import { CONFIG } from './config.js';
import { STRINGS, DATE_FMT, t } from './i18n.js';

/* ─── tiny helpers ─────────────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS_LANG = 'wedding.lang';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = { lang: CONFIG.defaultLang, guest: null };

/* ─── 1. Language resolution ───────────────────────────────────────────────
   Priority: ?lang= → saved choice → guest record → browser → config default
------------------------------------------------------------------------- */
function resolveLang(guest) {
  const p = new URLSearchParams(location.search);
  const fromUrl = (p.get('lang') || '').toLowerCase();
  if (CONFIG.languages.includes(fromUrl)) return fromUrl;

  try {
    const saved = localStorage.getItem(LS_LANG);
    if (CONFIG.languages.includes(saved)) return saved;
  } catch { /* private mode */ }

  if (guest?.language && CONFIG.languages.includes(guest.language)) return guest.language;

  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('ta')) return 'ta';

  return CONFIG.defaultLang;
}

function saveLang(lang) {
  try { localStorage.setItem(LS_LANG, lang); } catch { /* ignore */ }
}

/* ─── 2. Guest lookup ───────────────────────────────────────────────────
   Two ways to personalise, checked in this order:

   a) ?id=A1001            — looked up in assets/data/guests.json.
                             Curated, short, but the id must exist in the file.
   b) ?n=Ramesh Kumar      — the name travels inside the link itself, so anyone
      &nt=ரமேஷ் குமார்      in the family can make a working link with no edit
      &c=Office             to the repo. See tools/create.html.
------------------------------------------------------------------------- */

const CATEGORIES = ['Family', 'Relative', 'Friend', 'Office', 'Professor', 'Student'];

/** Anything arriving from the URL is untrusted. Keep it short and inert.
 *  (It is only ever written with textContent, never innerHTML — this is
 *  belt-and-braces so a stray name can't distort the layout either.) */
function cleanParam(value, max = 70) {
  return (value || '')
    .replace(/[<>]/g, '')                                        // no tag-looking characters
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029]/g, '')   // control + invisible chars
    .replace(/\s+/g, ' ')                                        // collapse whitespace
    .trim()
    .slice(0, max);
}

function inlineGuest() {
  const p = new URLSearchParams(location.search);
  const name = cleanParam(p.get('n'));
  if (!name) return null;

  const nameTa = cleanParam(p.get('nt'));
  const cat = cleanParam(p.get('c'), 20);

  return {
    id: '',
    name,
    nameTa: nameTa || name,               // fall back to the Latin name
    category: CATEGORIES.includes(cat) ? cat : 'default',
    language: ''                          // ?lang= / saved choice decides
  };
}

async function loadGuest() {
  const id = (new URLSearchParams(location.search).get('id') || '').trim();

  if (id) {
    try {
      const res = await fetch('assets/data/guests.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      const list = await res.json();
      const hit = list.find(g => String(g.id).toLowerCase() === id.toLowerCase());
      if (hit) return hit;
    } catch (err) {
      console.warn('[invitation] guest list unavailable:', err.message);
      // fall through — an inline name or the generic greeting still works
    }
  }

  return inlineGuest();
}

function guestName(guest, lang) {
  if (!guest) return '';
  if (lang === 'ta' && guest.nameTa) return guest.nameTa;
  return guest.name || '';
}

/* ─── 3. Static string pass ───────────────────────────────────────────── */
function applyStrings(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  $$('[data-i18n]').forEach(el => {
    const val = t(lang, el.dataset.i18n);
    if (!val) return;
    if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
    else el.textContent = val;
  });

  const { bride, groom } = CONFIG.couple;
  document.title = `${t(lang, 'doc.title')} · ${groom.short[lang]} & ${bride.short[lang]}`;

  const btn = $('#langBtn');
  btn.setAttribute('aria-label', t(lang, 'lang.toggle.aria'));
  $('#langBtnLabel').textContent = t(lang, 'lang.toggle.label');

  $('#topbarMono').textContent = CONFIG.couple.monogram[lang];
}

/* ─── 4. Hero ─────────────────────────────────────────────────────────── */
function renderHero(lang) {
  const { couple } = CONFIG;
  const first  = couple.order === 'bride-first' ? couple.bride : couple.groom;
  const second = couple.order === 'bride-first' ? couple.groom : couple.bride;

  $('#nameA').textContent   = first.short[lang];
  $('#nameB').textContent   = second.short[lang];
  $('#nameAmp').textContent = t(lang, 'hero.and');

  $('#heroDate').textContent = DATE_FMT[lang].long;

  const venue = CONFIG.venues[CONFIG.events[0].venueId];
  $('#heroPlace').textContent =
    `${venue.name[lang]}, ${lang === 'ta' ? 'காஞ்சிபுரம்' : 'Kanchipuram'}`;

  // Personalised greeting
  const name = guestName(state.guest, lang);
  const line = $('#greetLine');
  const tag  = $('#greetTag');

  if (name) {
    const cat = state.guest.category || 'default';
    const key = STRINGS[lang][`greet.${cat}`] ? `greet.${cat}` : 'greet.default';
    line.textContent = t(lang, key, { name });

    const tagKey = `greet.tag.${cat}`;
    if (STRINGS[lang][tagKey]) { tag.textContent = t(lang, tagKey); tag.hidden = false; }
    else tag.hidden = true;
  } else {
    line.textContent = t(lang, 'greet.fallback');
    tag.hidden = true;
  }
}

/* ─── 5. Formal invitation body ───────────────────────────────────────── */
function renderInvitation(lang) {
  const p = CONFIG.panchangam;
  const flat = k => p[k][lang];

  $('#invBody').innerHTML = t(lang, 'inv.body', {
    deity: flat('deity'), year: flat('year'), month: flat('month'),
    paksham: flat('paksham'), thithi: flat('thithi'),
    natchathiram: flat('natchathiram'), yogam: flat('yogam'), lagnam: flat('lagnam')
  });

  const fill = (side, prefix) => {
    const f = CONFIG.families[side];
    $(`#${prefix}Child`).textContent       = f.child.formal[lang];
    $(`#${prefix}ParentLabel`).textContent = f.parents.label[lang];
    $(`#${prefix}Parents`).textContent     = f.parents.names[lang];
    $(`#${prefix}Place`).textContent       = f.place[lang];
    $(`#${prefix}Of`).textContent          = t(lang, `inv.${side}.of`);

    const meta = $(`#${prefix}Meta`);
    if (CONFIG.features.showQualifications) {
      meta.textContent = [f.child.quals, f.child.org].filter(Boolean).join(' · ');
      meta.hidden = !meta.textContent;
    } else {
      meta.textContent = '';
      meta.hidden = true;
    }
  };
  fill('bride', 'br');
  fill('groom', 'gr');

  const v = CONFIG.venues[CONFIG.events[0].venueId];
  $('#invClose').innerHTML = t(lang, 'inv.close', {
    venue: v.name[lang], venueSub: v.sub[lang], address: v.address[lang].join(', ')
  });
}

/* ─── 6. Schedule ─────────────────────────────────────────────────────── */
function fmtDate(iso, lang) {
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat(lang === 'ta' ? 'ta-IN' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(d);
  } catch {
    return DATE_FMT[lang].long;
  }
}

function calendarUrl(ev, lang) {
  const z = s => s.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const start = z(new Date(ev.start).toISOString());
  const end   = z(new Date(ev.end || new Date(new Date(ev.start).getTime() + 2 * 36e5)).toISOString());
  const v = CONFIG.venues[ev.venueId];
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${CONFIG.couple.groom.short.en} & ${CONFIG.couple.bride.short.en} — ${ev.name.en}`,
    dates: `${start}/${end}`,
    details: `${t(lang, 'doc.title')}\n${baseUrl()}`,
    location: [v.name.en, ...v.address.en].join(', ')
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

function renderEvents(lang) {
  const host = $('#events');
  host.dataset.count = CONFIG.events.length;
  host.innerHTML = CONFIG.events.map(ev => {
    const v = CONFIG.venues[ev.venueId];
    const cal = CONFIG.features.addToCalendar
      ? `<a class="btn btn--ghost ev__cal" href="${calendarUrl(ev, lang)}" target="_blank" rel="noopener">${t(lang, 'sch.addcal')}</a>`
      : '';
    // The muhurtham carries the lagnam; the reception carries the dinner time.
    const sub = ev.extra ? ev.extra[lang]
              : (ev.primary ? CONFIG.panchangam.lagnam[lang] : '');

    const timeline = ev.timeline?.length
      ? `<ol class="tl">${ev.timeline.map(step => `
           <li class="tl__step">
             <span class="tl__dot" aria-hidden="true"></span>
             <span class="tl__time">${step.time[lang]}</span>
             <span class="tl__what">${step.what[lang]}</span>
           </li>`).join('')}</ol>`
      : '';

    return `
      <article class="ev${ev.primary ? ' ev--primary' : ''}">
        <h3 class="ev__name">${ev.name[lang]}</h3>
        <p class="ev__note">${ev.note ? ev.note[lang] : ''}</p>
        <dl class="ev__rows">
          <div class="ev__row"><dt class="ev__k">${t(lang, 'sch.date')}</dt>
            <dd class="ev__v">${fmtDate(ev.start, lang)}</dd></div>
          <div class="ev__row"><dt class="ev__k">${t(lang, 'sch.time')}</dt>
            <dd class="ev__v">${ev.timeLabel[lang]}${sub ? `<small>${sub}</small>` : ''}</dd></div>
          <div class="ev__row"><dt class="ev__k">${t(lang, 'sch.where')}</dt>
            <dd class="ev__v">${v.name[lang]}<small>${v.address[lang].join(', ')}</small></dd></div>
        </dl>
        ${timeline}
        ${cal}
      </article>`;
  }).join('');
}

/* ─── 7. Countdown ────────────────────────────────────────────────────── */
let cdTimer = null;
function startCountdown(lang) {
  if (!CONFIG.features.countdown) return;
  const primary = CONFIG.events.find(e => e.primary) || CONFIG.events[0];
  const target = new Date(primary.start).getTime();
  const cd = $('#cd'), msg = $('#cdMsg');
  const pad = n => String(n).padStart(2, '0');

  /* Write a digit, and give it a tiny lift when the value actually changes.
     Skipped entirely under prefers-reduced-motion. */
  const put = (el, value) => {
    const next = String(value);
    if (el.textContent === next) return;
    el.textContent = next;
    if (REDUCED) return;
    el.classList.remove('is-tick');
    void el.offsetWidth;              // restart the animation
    el.classList.add('is-tick');
  };

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.hidden = true;
      msg.hidden = false;
      msg.textContent = diff > -36e5 * 24 ? t(lang, 'cd.today') : t(lang, 'cd.past');
      clearInterval(cdTimer);
      return;
    }
    cd.hidden = false; msg.hidden = true;
    const s = Math.floor(diff / 1000);
    put($('#cdD'), Math.floor(s / 86400));
    put($('#cdH'), pad(Math.floor(s / 3600) % 24));
    put($('#cdM'), pad(Math.floor(s / 60) % 60));
    put($('#cdS'), pad(s % 60));
  };

  clearInterval(cdTimer);
  tick();
  cdTimer = setInterval(tick, 1000);
}

/* ─── 8. Venue + map ──────────────────────────────────────────────────── */
function renderVenue(lang) {
  const v = CONFIG.venues[CONFIG.events[0].venueId];
  $('#vName').textContent = v.name[lang];
  $('#vSub').textContent  = v.sub[lang];
  $('#vAddr').innerHTML   = v.address[lang].map(l => `<span>${l}</span>`).join('');

  const q = encodeURIComponent(v.mapQuery);
  $('#vDir').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  $('#vMap').href = v.mapUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;

  if (!CONFIG.features.map) { $('#vMapBox').remove(); return; }
  $('#vMapBox').innerHTML =
    `<iframe title="${v.name[lang]} — ${t(lang, 'venue.maploading')}" loading="lazy"
             referrerpolicy="no-referrer-when-downgrade"
             src="https://www.google.com/maps?q=${q}&z=15&output=embed"></iframe>`;
}

/* ─── 9. Gallery ──────────────────────────────────────────────────────── */
function renderGallery(lang) {
  const sec = $('#gallery');
  if (!CONFIG.gallery.length) { sec.hidden = true; return; }
  sec.hidden = false;
  $('#galGrid').innerHTML = CONFIG.gallery.map((g, i) =>
    `<img src="${g.src}" alt="${g.alt?.[lang] || ''}" loading="lazy" decoding="async"
          width="600" height="800"${i < 2 ? '' : ' fetchpriority="low"'}>`
  ).join('');
}

/* ─── 10. Families ────────────────────────────────────────────────────── */
function renderFamilies(lang) {
  const order = CONFIG.couple.order === 'bride-first' ? ['bride', 'groom'] : ['groom', 'bride'];
  $('#fams').innerHTML = order.map(side => {
    const f = CONFIG.families[side];
    const tel = f.signature.phone
      ? `<a href="tel:+91${f.signature.phone}">+91 ${f.signature.phone}</a>` : '';
    return `
      <article class="fam">
        <p class="fam__side">${f.side[lang]}</p>
        <p class="fam__row"><span class="fam__k">${f.parents.label[lang]}</span>
          <span class="fam__v">${f.parents.names[lang]}</span></p>
        <p class="fam__row"><span class="fam__k">${f.place[lang]}</span></p>
        <div class="fam__sig">
          <em>${f.signature.salutation[lang]}</em>
          <strong>${f.signature.names[lang]}</strong>
          <span class="fam__k">${f.signature.place[lang]}</span>
          ${tel}
        </div>
      </article>`;
  }).join('');

  const lo = CONFIG.littleOne;
  $('#littleOne').innerHTML = `${lo.label[lang]} — <strong>${lo.name[lang]}</strong>`;
}

/* ─── 11. Contacts ────────────────────────────────────────────────────── */
function renderContacts(lang) {
  const sec = $('#contact');
  if (!CONFIG.features.contacts || !CONFIG.contacts.length) { sec.hidden = true; return; }
  sec.hidden = false;
  $('#contacts').innerHTML = CONFIG.contacts.map(c => {
    const call = c.phone
      ? `<a class="con__call" href="tel:+91${c.phone}">
           <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2A2 2 0 0 1 5 3z"/></svg>
           ${c.phone}
         </a>` : '';
    return `<div class="con">
              <p class="con__name">${c.name[lang]}${c.quals ? `<small>${c.quals}</small>` : ''}</p>
              ${call}
            </div>`;
  }).join('');
}

/* ─── 12. Share ───────────────────────────────────────────────────────── */
/** Where this invitation lives. Falls back to the current address, so the
 *  site needs no reconfiguring when it moves from localhost to GitHub Pages. */
function baseUrl() {
  if (CONFIG.siteUrl) return CONFIG.siteUrl;
  return location.origin + location.pathname.replace(/[^/]*$/, '');
}

function shareLink() {
  // Carry the personalisation through, so a forwarded link still greets
  // the same person — whether it came from an id or an inline name.
  const u = new URL(baseUrl());
  const p = new URLSearchParams(location.search);
  for (const k of ['id', 'n', 'nt', 'c']) {
    if (p.get(k)) u.searchParams.set(k, p.get(k));
  }
  u.searchParams.set('lang', state.lang);
  return u.toString();
}

function wireShare(lang) {
  if (!CONFIG.features.share) return;
  const { couple } = CONFIG;
  const text = t(lang, 'share.text', {
    groom: couple.groom.short[lang], bride: couple.bride.short[lang]
  });
  const link = shareLink();

  $('#shareWa').href =
    `https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}`;

  const native = $('#shareNative');
  if (navigator.share) {
    native.hidden = false;
    native.onclick = () => navigator.share({ title: document.title, text, url: link }).catch(() => {});
  }

  const copy = $('#shareCopy'), label = $('#shareCopyLabel');
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    label.textContent = t(lang, 'share.copied');
    setTimeout(() => { label.textContent = t(lang, 'share.copy'); }, 2200);
  };
}

/* ─── 14. Scroll reveal + sticky header ───────────────────────────────── */
function wireScroll() {
  const items = $$('.reveal');
  if (REDUCED || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    items.forEach(el => io.observe(el));
  }

  const bar = $('#topbar');
  const onScroll = () => bar.classList.toggle('is-stuck', window.scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── 15. Language toggle ─────────────────────────────────────────────── */
function wireLangToggle() {
  $('#langBtn').onclick = () => {
    const next = state.lang === 'en' ? 'ta' : 'en';
    state.lang = next;
    saveLang(next);
    const u = new URL(location.href);
    u.searchParams.set('lang', next);
    history.replaceState(null, '', u);
    render(next);
  };
}

/* ─── 16. Render everything for a language ────────────────────────────── */
function render(lang) {
  applyStrings(lang);
  renderHero(lang);
  renderInvitation(lang);
  renderEvents(lang);
  renderVenue(lang);
  renderGallery(lang);
  renderFamilies(lang);
  renderContacts(lang);
  wireShare(lang);
  startCountdown(lang);
}

/* ─── 17. Boot ────────────────────────────────────────────────────────── */
function hideLoader() {
  clearTimeout(window.__loaderFailsafe);          // the inline failsafe is no longer needed
  const el = $('#loader');
  if (!el) return;
  el.classList.add('is-done');
  document.body.classList.remove('is-loading');
  setTimeout(() => el.remove(), 800);
}

(async function boot() {
  try {
    const guest = await loadGuest();
    state.guest = guest;
    state.lang = resolveLang(guest);

    render(state.lang);
    wireLangToggle();
    wireScroll();
  } catch (err) {
    // Never leave a guest staring at the loader. Show the invitation regardless.
    console.error('[invitation] render failed:', err);
    hideLoader();
    return;
  }

  if (!CONFIG.features.loader || REDUCED) hideLoader();
  else {
    const min = new Promise(r => setTimeout(r, 1500));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    await Promise.race([Promise.all([min, fonts]), new Promise(r => setTimeout(r, 3500))]);
    hideLoader();
  }
})();
