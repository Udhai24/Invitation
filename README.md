# Digital Wedding Invitation — Vignesh Kumar & Yuvasri

A personalised, bilingual (English / Tamil), static wedding invitation.
No backend, no build step, no dependencies. Deploys to GitHub Pages by pushing.

**Reception:** Saturday, 12 September 2026 · 6:00 PM onwards, dinner at 7:30 PM
**Muhurtham:** Sunday, 13 September 2026 · between 6:00 and 7:30 AM
**Venue (both):** S.S.P Bhavana Hall (Kanchi Sri Uthiradi Mutt), Vegavathi Street, Chinna Kanchipuram, Kanchipuram 631501

---

## 1. Quick start

**You must serve the folder over HTTP.** Double-clicking `index.html` will not work: browsers block ES modules and `fetch()` on `file://` URLs, so the page would sit on the loading screen. If you open it that way anyway, the page now detects it and tells you — rather than hanging.

```bash
# from this folder
python -m http.server 8080     # or: python3 -m http.server 8080
```

Then open **http://localhost:8080**.

Any static server works — `npx serve`, VS Code's "Live Server" extension, etc. On GitHub Pages it just works, no setup.

Try these URLs:

| URL | What you see |
|---|---|
| `/` | Generic warm greeting, Tamil (default) |
| `/?lang=en` | Generic greeting, English |
| `/?id=A1001` | "Welcome, Dr. Ramesh Kumar" — English (his preference) |
| `/?id=A1002` | "இல்லம் வருக, R. சுரேஷ் குடும்பத்தார்" — Tamil |
| `/?id=A1003&lang=en` | "Respected Prof. Mohan Raj" |
| `/?id=NOPE` | Falls back gracefully to the generic greeting |

---

## 2. Deploying to GitHub Pages

See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions. Short version:

1. Create an empty repo on GitHub named `invitation` (no README, no .gitignore).
2. From this folder: `git remote add origin <url>` then `git push -u origin main`.
3. **Settings → Pages → Source:** *Deploy from a branch* → `main` / `(root)` → Save.

There is **nothing to configure afterwards.** All paths are relative and the share/QR base URL is read from the address bar, so the site works identically on `localhost:8080`, at `username.github.io/invitation/`, or on a custom domain.

`.nojekyll` is already included so GitHub doesn't process the folder as a Jekyll site.

---

## 3. Two ways to personalise a link

| | **Anyone can use** | **Curated list** |
|---|---|---|
| Page | `tools/create.html` | `tools/links.html` |
| Link looks like | `?n=Ramesh%20Mama&c=Relative` | `?id=A1001` |
| Who it's for | Any family member, on their phone | Whoever maintains the repo |
| Setup needed | **None** — the name travels inside the link | Guest must be added to `guests.json` and pushed |
| Good for | Spreading the work across the family | A tidy master list, short links, a CSV of everyone |

Both produce the same invitation experience. `?id=` wins if both are present; an unknown `?id=` quietly falls through to `?n=`, and if neither resolves the guest still sees a warm generic greeting.

### For family members: `tools/create.html`

Send them this one URL:

```
https://YOUR-USERNAME.github.io/invitation/tools/create.html
```

It's a phone-first page in Tamil and English. They type a name, tap who the person is (Family / Relative / Friend / Office / Professor / Student), see a live preview of the greeting that guest will get, then tap **WhatsApp** — the message is written for them, in the right language, with both event dates and the venue. There's also **Copy link**, **Preview it**, and a downloadable QR.

Nothing is saved anywhere and nothing needs publishing, so several relatives can work through their own lists at the same time without stepping on each other.

**The guest's name is visible in the link.** That's inherent to how it works — the name has to travel somewhere. It's the same information that's on the printed card, so it's fine; just don't type anything private into it.

---

## 4. Adding guests to the curated list

Edit `assets/data/guests.json`:

```json
{
  "id": "A1007",
  "name": "Dr. Ramesh Kumar",
  "nameTa": "முனைவர் ரமேஷ் குமார்",
  "category": "Office",
  "language": "en"
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Anything URL-safe. Case-insensitive on lookup. Keep them non-guessable-ish (`A1042`, not `1`, `2`, `3`) if you'd rather people not browse each other's links. |
| `name` | yes | Shown in English mode |
| `nameTa` | no | Shown in Tamil mode; falls back to `name` |
| `category` | no | `Family` · `Relative` · `Friend` · `Office` · `Professor` · `Student` — changes the greeting wording and the small tag above it |
| `language` | no | `en` or `ta` — the guest's default; a `?lang=` in the URL always wins |

**Guest IDs are not authentication.** The whole list is a public JSON file. Don't put phone numbers, addresses or anything private in it.

### Generating the links

Open **`tools/links.html`** in a browser (via the local server, or use its "choose a JSON file" button). It gives you, per guest:

- the personal URL
- a ready-to-send WhatsApp message in the right language
- a downloadable QR code PNG
- a "Download CSV" of everything, for mail-merge or a spreadsheet

This tool is intentionally not linked from the invitation and carries `noindex`.

---

## 5. Editing the wedding details

Everything lives in **`assets/js/config.js`** — one file, heavily commented.

| I want to change… | Where |
|---|---|
| Names, monogram, name order | `couple` |
| Reception / muhurtham dates and times | `events` |
| Reception running order (welcome, dinner) | `events[0].timeline` |
| Add another ceremony | `events` — copy a block |
| Venue, address, map link | `venues` |
| Parents' names, family addresses, signatures | `families` |
| Contact numbers | `contacts` |
| Photo gallery | `gallery` |
| Turn off loader / countdown / map / contacts | `features` |
| Bring back degrees & employer lines | `features.showQualifications: true` |

Wording (both languages) lives in **`assets/js/i18n.js`**. Every visible string is a key; `data-i18n="key"` in `index.html` wires it up.

### What's deliberately left out

By request, the invitation names **the couple and their parents only**. Grandparents, and the `வணங்கும் பெரியோர்` list from the handwritten draft (M. Yasodhammal Gurusamy; R. Kasthuri Radhakrishnan; M. Sekar & Sivagami; S. Vijayakumar & V. Jayanthi) are not on the page. Degrees and employers are held in `config.js` but hidden behind `features.showQualifications`, so flipping one flag restores the printed card's fuller form.

There is **no RSVP**. Guests are pointed at the contact numbers instead.

### Countdown & time zones

`events[].start` is an ISO string **with the `+05:30` offset**, so the countdown is correct for guests abroad. Don't drop the offset. The countdown targets whichever event has `primary: true` — currently the muhurtham.

### Photo gallery

Drop images in `assets/img/gallery/`, then list them in `config.js`:

```js
gallery: [
  { src: 'assets/img/gallery/01.jpg', alt: { en: 'Engagement', ta: 'நிச்சயதார்த்தம்' } }
]
```

Keep them under ~250 KB each (resize to 1200px on the long edge) — many guests will open this on 3G. The section hides itself automatically while the array is empty.

---

## 6. How it's put together

```
index.html                  semantic skeleton, data-i18n hooks
.nojekyll                   tells GitHub Pages to serve files as-is
assets/
  css/main.css              design tokens + all styles, mobile-first
  js/config.js              ← wedding data (single source of truth)
  js/i18n.js                ← all EN/TA strings
  js/app.js                 guest lookup, language, render, interactions
  data/guests.json          guest list
  img/og.svg                link-preview image
tools/create.html           family-facing link creator (?n= links, no setup)
tools/links.html            curated ?id= links + QR + CSV, from guests.json
tools/test.mjs              263 automated checks (see below)
docs/printed-card.jpg       the original printed card, for proofreading
```

`docs/printed-card.jpg` is only there so you can check the transcription side by side. Delete it if you'd rather it weren't on the public site.

**Design:** ivory paper, deep maroon, gold leaf. Cormorant Garamond for English display, Noto Serif Tamil for Tamil — the Tamil face is swapped in for headings automatically via `html[data-lang="ta"]`.

**Flow:** kolam loader → personalised greeting → names/date/Kural → formal invitation → two-day schedule → countdown → venue + map → gallery → families → contacts → share.

**Accessibility**
- Body text never below 17px; Tamil gets extra line-height
- Skip link, visible focus rings, `aria-live` on the countdown
- Touch targets ≥ 44px
- All motion behind `prefers-reduced-motion` (loader skipped, reveals off, countdown still works)
- Semantic landmarks and heading order; map iframe is titled and lazy-loaded

**Performance**
- ~35 KB of CSS+JS, uncompressed, no libraries
- Two font families, `display=swap`, preconnected
- Paper texture and all artwork are inline SVG — no image requests before content
- Map iframe is `loading="lazy"`, gallery images too
- Loader waits for fonts but is hard-capped at 3.5s so it can never trap a slow connection

**The loader can't get stuck.** Three layers: a classic inline script arms a 5-second failsafe that dismisses it no matter what happens to the module; `boot()` catches any render error and dismisses it; and `file://` is detected up front and explained. A `<noscript>` rule hides it for anyone with JavaScript off.

### Motion

Ambient background motion in three places: drifting lamp-glow orbs plus falling
jasmine petals in the hero, a slow pulsing glow behind the countdown, and a
dimmer version of both in the footer. Sections and their contents stagger in as
you scroll, the countdown digits lift each time they change, the gold lotus bud
breathes, and the last step of the reception timeline pulses.

All of it is decoration. Every ambient layer is `aria-hidden` and
`pointer-events:none`; only `transform`, `opacity`, `filter`, `box-shadow` and
`background-position` are animated, so nothing triggers layout. Petal count
halves below 560px. Everything switches off under `prefers-reduced-motion` and
under `prefers-reduced-data`, and the scroll-reveal falls back to showing all
content when `IntersectionObserver` is unavailable — the page can never be left
blank by the animation layer. Tests 27 and 28 enforce all of this.

**Print:** `Ctrl/Cmd+P` gives a clean one-page card — nav, countdown and map are dropped.

### Running the tests

```bash
npm install jsdom      # one-off
node tools/test.mjs
```

263 checks covering: personalised greetings per category and language, the `?lang=` / saved-choice / guest-record / browser-locale precedence chain, unknown guest ids and an unreachable `guests.json`, no unreplaced `{placeholders}` in either language, both event cards and their IST→UTC calendar conversions, countdown maths against `2026-09-13T06:00+05:30`, that RSVP is gone from markup/CSS/JS, that no grandparents or elders leak through, inline ?n= links including name sanitising and ?id= precedence, the creator page end to end, the reception running order, and that every ambient animation is decorative, aria-hidden, layout-free and fully disabled under reduced motion, the loader failsafe including the `file://` path, share links preserving the guest id, translation parity between `en` and `ta`, GitHub Pages path assumptions, and accessibility markup. Run it after editing `config.js` or `i18n.js`.

---

## 7. Growing this later

The seams are already there:

| Later | Where to cut in |
|---|---|
| RSVP, if you change your mind | Add a section, and one `wireRsvp(lang)` call inside `render()`. Everything it needs — the guest's name, id and category — is already on `state.guest`. Git history has the previous WhatsApp + Google Form version. |
| RSVP tracking & analytics | Same place — `fetch` POST `{id, category, answer}` to Cloudflare Workers / Firebase / Google Apps Script |
| Admin dashboard | New page under `tools/`; it already has the pattern for reading `guests.json` |
| Database instead of JSON | `loadGuest()` is a single `fetch` — point it at an API endpoint returning the same shape |
| Post-wedding photo gallery | Fill the `gallery` array; the section reveals itself |
| Live streaming | Add an event with a `streamUrl` and one card in `renderEvents()` |
| More ceremonies | Copy an `events` block |
| Multiple weddings / templates | `config.js` + `i18n.js` are the entire content layer. Duplicate the folder, swap those two files. |
| Category-specific content | Greetings already branch on `category`; the same `state.guest.category` is available anywhere in `app.js` |

---

## 8. Things to double-check before sending

- [ ] `siteUrl` in `config.js` matches the live GitHub Pages URL
- [ ] The Google Maps pin resolves to the correct hall — search-by-name is used; paste an exact `maps.app.goo.gl` link into `venues.sspbhavana.mapUrl` if it doesn't
- [ ] **Groom's house number** — printed card reads `13/5B`, the handwritten draft looks like `13/58`. Currently `13/5B`.
- [ ] Names, spellings and initials in **both** languages
- [ ] Send yourself one link and open it on an actual phone, on mobile data
