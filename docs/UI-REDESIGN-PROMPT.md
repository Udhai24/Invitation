# UI redesign prompt

Paste everything inside the fenced block below into another AI (Claude, ChatGPT, v0, Lovable, Gemini…). It asks for several complete visual directions that are **drop-in replacements** for `index.html` + `assets/css/main.css`, so the working logic, both languages and all the personalisation keep functioning untouched.

If the tool has a file-upload box, also attach `index.html`, `assets/css/main.css`, `assets/js/i18n.js` and `docs/printed-card.jpg` — it will do noticeably better with those in hand.

---

```
You are a senior web designer and front-end engineer. I have a working bilingual
(Tamil/English) digital wedding invitation. The logic is finished and I do not want
it changed. I want you to redesign the VISUALS only, and to show me several clearly
different directions so I can choose.

═══════════════════════════════════════════════════════════════════════
THE WEDDING (use these exact facts)
═══════════════════════════════════════════════════════════════════════
Bride:   Yuvasri  ·  யுவஸ்ரீ
         Daughter of R. Valli & S. Karthi
         (திருமதி R. வள்ளி – திரு S. கார்த்தி)
         No. 51, Ammangara Street, Chinna Kanchipuram

Groom:   Vignesh Kumar  ·  விக்னேஷ் குமார்
         Son of G. Udhayakumar & A. Valarmathi
         (திரு G. உதயகுமார் – திருமதி A. வளர்மதி)
         No. 13/5B, Ammangara Street, Chinna Kanchipuram

Reception:  Saturday 12 September 2026, 6:00 PM onwards; dinner 7:30 PM
            மணமக்கள் வரவேற்பு · மாலை 6.00 மணிக்கு மேல்
Muhurtham:  Sunday 13 September 2026, between 6:00 and 7:30 AM
            சுபமுகூர்த்தம் · காலை 6.00 – 7.30
            Parabhava year, 27th of Aavani, Shukla Paksha, Dvitiya Thithi,
            Hastham Nakshatra, Amrita Yoga, Kanni Lagnam
Venue:      S.S.P Bhavana Hall (Kanchi Sri Uthiradi Mutt)
            Vegavathi Street, Chinna Kanchipuram, Kanchipuram 631501
Blessing:   ஸ்ரீ முருகன் துணை  ("Sri Murugan Thunai")
Deity:      Sri Sampuraya Nallur Muthu Mariamman
Kural 75:   அன்புற்று அமர்ந்த வழக்கென்ப வையகத்து
            இன்புற்றார் எய்தும் சிறப்பு
Corners:    மலர்ந்த முகமே !   /   வாழ்க்கையின் இன்பம் !!

This is a South Indian Tamil Hindu wedding. Treat the cultural material with
respect — no generic "ethnic" pastiche, no mandala clip-art, no Sanskrit-looking
decorative fonts for Tamil text.

═══════════════════════════════════════════════════════════════════════
AUDIENCE — this is the real design constraint
═══════════════════════════════════════════════════════════════════════
Guests span close family, relatives, friends, office colleagues, professors and
students. Ages from young children to elderly grandparents. Most will open the
link on a mid-range Android phone, on mobile data, in daylight, and many will be
reading Tamil.

Therefore, non-negotiable:
- Phone-first. Design the 360px-wide view FIRST, then scale up.
- Body text never below 17px. Tamil needs more line-height than Latin (≈1.9).
- Strong contrast. Assume a cheap screen and sunlight. No grey-on-grey.
- Tap targets ≥ 44px.
- An elderly relative must be able to find the date, the venue and the phone
  numbers within seconds, without pinching or hunting.
- Legibility beats cleverness every single time.

═══════════════════════════════════════════════════════════════════════
HARD TECHNICAL CONSTRAINTS
═══════════════════════════════════════════════════════════════════════
- Output ONE `index.html` + ONE `assets/css/main.css` per design direction.
- Vanilla HTML and CSS only. NO React, Vue, Tailwind, Bootstrap, SASS, no build
  step, no npm. It must run by opening it on a static host (GitHub Pages).
- Do NOT write or modify any JavaScript. Do not add script tags. The existing
  `assets/js/app.js` is loaded as an ES module and does all the work.
- Total CSS under ~40 KB. At most 2 Google Font families (one must cover Tamil —
  e.g. Noto Serif Tamil, Anek Tamil, Mukta Malar, Catamaran). Use `display=swap`.
- All decorative artwork must be inline SVG or pure CSS. No image files, no icon
  libraries, no external requests beyond the fonts.
- Animation must sit behind `@media (prefers-reduced-motion: reduce)`.
- Include an `@media print` block that yields a clean one-page card.

═══════════════════════════════════════════════════════════════════════
DOM CONTRACT — BREAK THIS AND THE SITE BREAKS
═══════════════════════════════════════════════════════════════════════
JavaScript fills the page at runtime. You may restructure layout, nesting and
classes freely, but every id and hook below MUST still exist, and MUST be the
kind of element noted. Empty elements are correct — JS injects the text.

Elements JS writes into (keep every id):
  #loader  #topbar  #topbarMono
  #langBtn  #langBtnLabel          <- must be a <button>
  #greetTag  #greetLine            <- #greetLine must be the page's only <h1>
  #nameA  #nameAmp  #nameB
  #heroDate  #heroPlace
  #invBody  #invClose
  #brChild #brParentLabel #brParents #brPlace #brMeta #brOf   (bride column)
  #grChild #grParentLabel #grParents #grPlace #grMeta #grOf   (groom column)
  #events                          <- JS injects the event cards here
  #cd #cdD #cdH #cdM #cdS #cdMsg
  #vName #vSub #vAddr #vDir #vMap #vMapBox
  #gallery #galGrid
  #fams  #littleOne
  #contact #contacts
  #shareWa #shareNative #shareCopy #shareCopyLabel
  #fileWarn

Section ids used by the nav anchors — keep all of them:
  #hero #invitation #schedule #countdown #venue #gallery #family #contact

Static text uses `data-i18n="key"` attributes. Copy every one across exactly as
it appears in the current index.html; JS swaps the text by key. The full key list:
  skip · loader.line
  nav.invitation nav.schedule nav.venue nav.family nav.contact
  hero.blessing hero.corner.left hero.corner.right hero.kural hero.kural.src
  hero.scroll
  inv.eyebrow inv.salutation
  sch.eyebrow sch.title
  cd.eyebrow cd.title cd.days cd.hours cd.minutes cd.seconds
  venue.eyebrow venue.title venue.directions venue.openmap
  gal.eyebrow gal.title
  fam.eyebrow fam.title
  con.eyebrow con.title con.note
  share.title share.whatsapp share.native share.copy
  foot.blessing foot.families
One element carries `data-i18n-html` (the Kural, which contains a <br>) — keep it.

Classes JS generates inside #events, #fams and #contacts — you MUST style these,
they will appear in the DOM without you writing them:
  .ev  .ev--primary  .ev__name  .ev__note  .ev__rows  .ev__row  .ev__k  .ev__v
  .ev__cal  .btn  .btn--ghost
  .fam  .fam__side  .fam__row  .fam__k  .fam__v  .fam__sig
  .con  .con__name  .con__call

State classes JS toggles — give them meaning in CSS:
  body.is-loading      scroll locked while the loader shows
  #loader.is-done      loader fading out
  .reveal / .reveal.is-in   scroll-reveal (start hidden, .is-in = settled)
  #topbar.is-stuck     header has scrolled away from the top

Language switching works via `html[data-lang="ta"]` and `html[data-lang="en"]`
on the root element. Use these to swap the display font and loosen line-height
for Tamil. Tamil strings are longer than English — never fix a height that text
must fit inside, and test both.

Also keep, verbatim from the current index.html: the `.skip-link`, the inline
`<script>` loader failsafe, the `<noscript>` block, and the `#fileWarn` div.

═══════════════════════════════════════════════════════════════════════
PAGE ORDER (keep this narrative)
═══════════════════════════════════════════════════════════════════════
loader → hero (personal greeting, both names, date, Kural) → formal invitation
→ two-day schedule → countdown → venue + embedded map → gallery (hidden while
empty) → families → contacts → footer with share buttons

The hero greeting is the emotional hook: each guest sees their own name
("Welcome home, Ramesh Mama" / "இல்லம் வருக, ரமேஷ் மாமா"). Make that line feel
like it was written for one person, not merged from a spreadsheet. Names can be
long — up to 70 characters — so it must wrap gracefully, never clip.

═══════════════════════════════════════════════════════════════════════
WHAT I WANT FROM YOU
═══════════════════════════════════════════════════════════════════════
Give me FOUR genuinely different directions. Not four palettes of the same
layout — different structure, typographic scale, rhythm and personality. For
each one:

  1. A name and a two-sentence idea.
  2. The palette as hex values, the font pairing, and the type scale.
  3. What makes it structurally different from the others.
  4. Complete, runnable `index.html` and `assets/css/main.css`.
  5. One honest sentence on who it suits least well.

Suggested starting points — replace any you find dull:
  A. Temple stone      — granite greys, kumkumam red, carved-relief depth,
                         architectural and solid.
  B. Palm manuscript   — aged ivory, ink brown, letterpress texture, the
                         invitation as a document you unroll.
  C. Modern Tamil      — high-contrast white and black with one saturated
                         accent, big confident Tamil type, almost editorial
                         magazine.
  D. Night celebration — deep indigo, oil-lamp gold, quiet glow, jasmine
                         motifs, cinematic.

Avoid: centred-everything with a script font and a photo behind it. That's the
default wedding-template look and I don't want it.

Show one direction at a time and wait for me before moving to the next, so I can
react. Start with a short comparison table of all four so I know what's coming.

Before you write any code, tell me in one paragraph how you plan to handle Tamil
typography at these sizes, since that is where most designs fail.
```

---

## How to use the results

Each direction is a swap of two files. To try one:

```powershell
copy assets\css\main.css assets\css\main.css.backup
copy index.html index.html.backup
# paste the new files over the top, then reload
python -m http.server 8080
```

Then verify nothing broke. Run through this quickly:

- `?n=Ramesh%20Mama&c=Relative` — does the greeting show the name?
- Language button — do both languages fit, with no clipped or overlapping text?
- `?lang=ta` on a 360px-wide window — is the Tamil still comfortable to read?
- Countdown, both event cards, map, contacts — all present?
- `node tools/test.mjs` — 231 checks; failures here mean the DOM contract was broken.

That last one is the real safety net. If a design breaks an id or a `data-i18n`
key, the test suite says exactly which.

## A note on the prompt

The DOM contract section is the part that matters. Most AI tools, asked to
"redesign this page", will quietly rewrite the markup and drop the ids — and you
get something that looks lovely and greets nobody by name. Keep that section
intact when you edit the prompt.
