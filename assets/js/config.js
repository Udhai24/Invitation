/* =============================================================================
   config.js — SINGLE SOURCE OF TRUTH for this wedding.
   Everything a non-developer might need to change lives in this one file.
   Sources: the printed Tamil card + the handwritten draft (docs/).
   ========================================================================== */

export const CONFIG = {

  /* --- Deployment -------------------------------------------------------- */
  // Base URL used for share links and QR codes.
  // Leave '' and it is read from the browser's address bar — so it is correct
  // on localhost and on GitHub Pages with no edit needed. Only set it if you
  // want share links to point somewhere other than where the page is served
  // from (e.g. a custom domain you haven't switched over to yet).
  siteUrl: '',

  /* --- Language ---------------------------------------------------------- */
  defaultLang: 'ta',        // 'en' | 'ta'  — used when guest record has none
  languages: ['en', 'ta'],

  /* --- The couple -------------------------------------------------------- */
  couple: {
    bride:  { short: { en: 'Yuvasri',       ta: 'யுவஸ்ரீ' } },
    groom:  { short: { en: 'Vignesh Kumar', ta: 'விக்னேஷ் குமார்' } },
    // 'bride-first' matches the printed card (bride on the left)
    order: 'bride-first',
    monogram: { en: 'Y · V', ta: 'யு · வி' }
  },

  /* --- Muhurtham / almanac details (from the card) ----------------------- */
  panchangam: {
    year:        { en: 'Parabhava year',      ta: 'பராபவ வருடம்' },
    month:       { en: '27th of Aavani',      ta: 'ஆவணி மாதம் 27-ஆம் தேதி' },
    paksham:     { en: 'Shukla Paksha',       ta: 'சுக்லபட்சம்' },
    thithi:      { en: 'Dvitiya Thithi',      ta: 'துவிதியை திதி' },
    natchathiram:{ en: 'Hastham Nakshatra',   ta: 'அஸ்தம் நட்சத்திரம்' },
    yogam:       { en: 'Amrita Yoga',         ta: 'அமிர்தயோகம்' },
    lagnam:      { en: 'Kanni Lagnam',        ta: 'கன்னிய லக்கனம்' },
    deity:       { en: 'Sri Sampuraya Nallur Muthu Mariamman',
                   ta: 'ஸ்ரீ சம்புராய நல்லூர் முத்து மாரியம்மன்' }
  },

  /* --- Events (நிகழ்ச்சி நிரல்) -------------------------------------------
     `start` carries the +05:30 offset so the countdown is right for guests in
     any time zone. `primary: true` is what the countdown counts down to.
     To add another ceremony, copy a block and edit it.
  ----------------------------------------------------------------------- */
  events: [
    {
      id: 'reception',
      name:  { en: 'Reception',                   ta: 'மணமக்கள் வரவேற்பு' },
      note:  { en: 'The evening before the wedding', ta: 'திருமணத்திற்கு முன் தினம் மாலை' },
      start: '2026-09-12T18:00:00+05:30',
      end:   '2026-09-12T22:00:00+05:30',
      timeLabel: { en: '6:00 PM onwards',  ta: 'மாலை 6.00 மணிக்கு மேல்' },
      extra:     null,
      // An optional running order, shown as a small timeline inside the card.
      timeline: [
        { time: { en: '6:00 PM', ta: 'மாலை 6.00' },
          what: { en: 'Welcoming the couple', ta: 'மணமக்கள் வரவேற்பு' } },
        { time: { en: '7:30 PM', ta: 'இரவு 7.30' },
          what: { en: 'Dinner is served',     ta: 'மணவிருந்து' } }
      ],
      venueId: 'sspbhavana'
    },
    {
      id: 'muhurtham',
      primary: true,                                  // drives the countdown
      name:  { en: 'Muhurtham',    ta: 'சுபமுகூர்த்தம்' },
      note:  { en: 'The wedding ceremony', ta: 'திருமண நிகழ்வு' },
      start: '2026-09-13T06:00:00+05:30',
      end:   '2026-09-13T07:30:00+05:30',
      timeLabel: { en: 'Between 6:00 and 7:30 in the morning',
                   ta: 'காலை 6.00 – 7.30 மணிக்குள்' },
      extra:     null,
      timeline: null,
      venueId: 'sspbhavana'
    }
  ],

  /* --- Venues ------------------------------------------------------------ */
  venues: {
    sspbhavana: {
      name: { en: 'S.S.P Bhavana Hall',  ta: 'S.S.P பாவனா ஹால்' },
      sub:  { en: 'Kanchi Sri Uthiradi Mutt', ta: 'காஞ்சி ஸ்ரீ உத்தராடி மடம்' },
      address: {
        en: ['Vegavathi Street', 'Chinna Kanchipuram', 'Kanchipuram – 631501',
             'Tamil Nadu, India'],
        ta: ['வேகவதி தெரு', 'சின்ன காஞ்சிபுரம்', 'காஞ்சிபுரம் – 631501',
             'தமிழ்நாடு']
      },
      // Plain-text query used to build the map + directions links.
      // If you have an exact Google Maps share link, paste it into `mapUrl`.
      mapQuery: 'S.S.P Bhavana Hall, Vegavathi Street, Chinna Kanchipuram, Kanchipuram 631501',
      mapUrl: ''   // optional override, e.g. 'https://maps.app.goo.gl/xxxx'
    }
  },

  /* --- Families ----------------------------------------------------------
     Parents only, by request. Grandparents and the wider elders list from the
     handwritten draft are deliberately left out.
  ----------------------------------------------------------------------- */
  families: {
    bride: {
      side:  { en: "Bride's Family", ta: 'மணமகள் வீட்டார்' },
      place: { en: 'No. 51, Ammangara Street, Chinna Kanchipuram',
               ta: 'எண். 51, அம்மங்காரத் தெரு, சின்ன காஞ்சிபுரம்' },
      parents: {
        label: { en: 'Daughter of', ta: 'தம்பதியரின் குமாரத்தி' },
        names: { en: 'R. Valli & S. Karthi',
                 ta: 'திருமதி R. வள்ளி – திரு S. கார்த்தி' }
      },
      child: {
        // Shown in the formal invitation. Kept plain by request.
        formal: { en: 'Yuvasri', ta: 'யுவஸ்ரீ' },
        // Shown only when features.showQualifications is true — the printed
        // card carried these, so they are kept here rather than deleted.
        quals:  'M.Sc., DMLT',
        org:    'Annamal Institute'
      },
      signature: {
        salutation: { en: 'With affection,', ta: 'தங்கள் அன்புள்ள,' },
        names: { en: 'R. Valli – S. Karthi', ta: 'R. வள்ளி – S. கார்த்தி' },
        place: { en: 'Chinna Kanchipuram', ta: 'சின்ன காஞ்சிபுரம்' },
        phone: '7708319668'
      }
    },
    groom: {
      side:  { en: "Groom's Family", ta: 'மணமகன் வீட்டார்' },
      place: { en: 'No. 13/5B, Ammangara Street, Chinna Kanchipuram',
               ta: 'எண். 13/5B, அம்மங்காரத் தெரு, சின்ன காஞ்சிபுரம்' },
      parents: {
        label: { en: 'Son of', ta: 'தம்பதியரின் குமாரன்' },
        names: { en: 'G. Udhayakumar & A. Valarmathi',
                 ta: 'திரு G. உதயகுமார் – திருமதி A. வளர்மதி' }
      },
      child: {
        formal: { en: 'Vignesh Kumar', ta: 'விக்னேஷ் குமார்' },
        quals:  'B.E.',
        org:    'Intellect Design Arena Ltd., Chennai'
      },
      signature: {
        salutation: { en: 'Requesting the same,', ta: 'யாதும் அவ்வண்ணமே கோரும்,' },
        names: { en: 'G. Udhayakumar – A. Valarmathi',
                 ta: 'G. உதயகுமார் – A. வளர்மதி' },
        place: { en: 'Chinna Kanchipuram', ta: 'சின்ன காஞ்சிபுரம்' },
        phone: ''
      }
    }
  },

  /* --- Contacts (the welcoming party from the card) ---------------------- */
  contacts: [
    { name: { en: 'K. Udhayakumar',   ta: 'K. உதயகுமார்' },       quals: 'B.E.',  phone: '8428493409' },
    { name: { en: 'R. Valli – S. Karthi', ta: 'R. வள்ளி – S. கார்த்தி' }, quals: '', phone: '7708319668' },
    { name: { en: 'R. Prasanth',      ta: 'திரு R. பிரசாந்த்' },   quals: 'B.A.',  phone: '' },
    { name: { en: 'P. Anisha',        ta: 'P. அனிஷா' },           quals: 'MCA',   phone: '' }
  ],

  // The lovely line at the foot of the card
  littleOne: {
    label: { en: 'Our home’s little angel', ta: 'எங்கள் வீட்டு குட்டி தேவதை' },
    name:  { en: 'P. Mounasri', ta: 'P. மௌனஸ்ரீ' }
  },

  /* --- Gallery -----------------------------------------------------------
     Drop images into assets/img/gallery/ and list them here.
     Leave the array empty and the whole Gallery section stays hidden.
  ----------------------------------------------------------------------- */
  gallery: [
    // { src: 'assets/img/gallery/01.jpg', alt: { en: 'Engagement', ta: 'நிச்சயதார்த்தம்' } }
  ],

  /* --- Feature flags ---------------------------------------------------- */
  features: {
    loader: true,
    countdown: true,
    map: true,
    addToCalendar: true,
    share: true,
    contacts: true,
    // Flip to true to bring back "M.Sc., DMLT · Annamal Institute" style lines
    showQualifications: false
  }
};

export default CONFIG;
