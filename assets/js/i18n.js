/* =============================================================================
   i18n.js — All user-facing strings, in English and Tamil.
   Keys are referenced from index.html via data-i18n="key".
   ========================================================================== */

export const STRINGS = {

  en: {
    /* meta */
    'html.lang': 'en',
    'doc.title': 'Wedding Invitation',

    /* loader */
    'loader.line': 'Preparing your invitation…',

    /* header / nav */
    'nav.invitation': 'Invitation',
    'nav.schedule': 'Schedule',
    'nav.venue': 'Venue',
    'nav.family': 'Family',
    'nav.contact': 'Contact',
    'lang.toggle.aria': 'Switch language to Tamil',
    'lang.toggle.label': 'தமிழ்',
    'skip': 'Skip to invitation',

    /* hero */
    'hero.blessing': 'Sri Murugan Thunai',
    'hero.corner.left': 'A face in full bloom!',
    'hero.corner.right': 'The joy of a lifetime!',
    'hero.greeting.generic': 'You are warmly invited',
    'hero.and': '&',
    'hero.weare': 'are getting married',
    'hero.kural': 'A life lived in loving accord — that, they say,<br>is the glory attained by those who find joy in this world.',
    'hero.kural.src': '— Thirukkural 75',
    'hero.scroll': 'Scroll',

    /* greetings by category (use {name}) */
    'greet.Family':    'Welcome home, {name}',
    'greet.Relative':  'Welcome, {name}',
    'greet.Friend':    'Hey {name}, we’ve been waiting for you',
    'greet.Office':    'Welcome, {name}',
    'greet.Professor': 'Respected {name}',
    'greet.Student':   'Welcome, {name}',
    'greet.default':   'Welcome, {name}',
    'greet.fallback':  'Dear Guest, welcome',
    'greet.tag.Family':    'Family',
    'greet.tag.Relative':  'Family & Relatives',
    'greet.tag.Friend':    'Friends',
    'greet.tag.Office':    'Colleagues',
    'greet.tag.Professor': 'With respect',
    'greet.tag.Student':   'Students',

    /* invitation */
    'inv.eyebrow': 'The Invitation',
    'inv.salutation': 'Dear Ones, Greetings.',
    'inv.body': 'By the divine grace of <strong>{deity}</strong>, on the auspicious day of <strong>Sunday, 13 September 2026</strong> — {month}, {year} — {paksham}, {thithi}, {natchathiram}, blessed with {yogam}, during {lagnam}, between <strong>6:00 AM and 7:30 AM</strong>,',
    'inv.bride.of': 'the bride',
    'inv.groom.of': 'the groom',
    'inv.union': 'are to be united in marriage.',
    'inv.close': 'As decided by our elders, the wedding will take place at <strong>{venue}</strong>, {venueSub}, {address}. We warmly invite you to come with your family and friends, and bless the couple.',

    /* schedule */
    'sch.eyebrow': 'The Two Days',
    'sch.title': 'Wedding Schedule',
    'sch.date': 'Date',
    'sch.time': 'Time',
    'sch.where': 'Venue',
    'sch.addcal': 'Add to calendar',

    /* countdown */
    'cd.eyebrow': 'Counting down',
    'cd.title': 'Until the Muhurtham',
    'cd.days': 'Days',
    'cd.hours': 'Hours',
    'cd.minutes': 'Minutes',
    'cd.seconds': 'Seconds',
    'cd.today': 'It’s today. See you at the hall!',
    'cd.past': 'Thank you for being part of our joy.',

    /* venue */
    'venue.eyebrow': 'Finding us',
    'venue.title': 'Venue',
    'venue.directions': 'Get directions',
    'venue.openmap': 'Open in Google Maps',
    'venue.maploading': 'Map',

    /* gallery */
    'gal.eyebrow': 'Moments',
    'gal.title': 'Gallery',

    /* family */
    'fam.eyebrow': 'With blessings from',
    'fam.title': 'Our Families',

    /* contact */
    'con.eyebrow': 'Any help needed?',
    'con.title': 'Contact Us',
    'con.call': 'Call',
    'con.note': 'Do call us for directions, timings or anything at all.',

    /* share / footer */
    'share.title': 'Share this invitation',
    'share.copy': 'Copy link',
    'share.copied': 'Link copied',
    'share.whatsapp': 'WhatsApp',
    'share.native': 'Share',
    'share.text': 'You are invited to the wedding of {groom} & {bride} — Sunday, 13 September 2026, Kanchipuram.',
    'foot.blessing': 'With love and blessings',
    'foot.families': 'Udhayakumar–Valarmathi & Valli–Karthi families'
  },

  ta: {
    'html.lang': 'ta',
    'doc.title': 'திருமண அழைப்பிதழ்',

    'loader.line': 'உங்கள் அழைப்பிதழ் தயாராகிறது…',

    'nav.invitation': 'அழைப்பு',
    'nav.schedule': 'நிகழ்ச்சி',
    'nav.venue': 'இடம்',
    'nav.family': 'குடும்பம்',
    'nav.contact': 'தொடர்பு',
    'lang.toggle.aria': 'மொழியை ஆங்கிலத்திற்கு மாற்று',
    'lang.toggle.label': 'English',
    'skip': 'அழைப்பிதழுக்குச் செல்',

    'hero.blessing': 'ஸ்ரீ முருகன் துணை',
    'hero.corner.left': 'மலர்ந்த முகமே !',
    'hero.corner.right': 'வாழ்க்கையின் இன்பம் !!',
    'hero.greeting.generic': 'அன்புடன் அழைக்கின்றோம்',
    'hero.and': '—',
    'hero.weare': 'திருமணம்',
    'hero.kural': 'அன்புற்று அமர்ந்த வழக்கென்ப வையகத்து<br>இன்புற்றார் எய்தும் சிறப்பு.',
    'hero.kural.src': '— திருக்குறள் 75',
    'hero.scroll': 'கீழே',

    'greet.Family':    'இல்லம் வருக, {name}',
    'greet.Relative':  'வணக்கம், {name}',
    'greet.Friend':    '{name}, உங்களை எதிர்நோக்கியிருக்கிறோம்',
    'greet.Office':    'வணக்கம், {name}',
    'greet.Professor': 'மதிப்பிற்குரிய {name}',
    'greet.Student':   'வணக்கம், {name}',
    'greet.default':   'வணக்கம், {name}',
    'greet.fallback':  'அன்புடையீர் வணக்கம்',
    'greet.tag.Family':    'சொந்தம்',
    'greet.tag.Relative':  'உறவினர்கள்',
    'greet.tag.Friend':    'நண்பர்கள்',
    'greet.tag.Office':    'அலுவலக நண்பர்கள்',
    'greet.tag.Professor': 'மதிப்புடன்',
    'greet.tag.Student':   'மாணவர்கள்',

    'inv.eyebrow': 'அழைப்பு',
    'inv.salutation': 'அன்புடையீர் வணக்கம்,',
    'inv.body': '<strong>{deity}</strong> திருவருள் துணைக்கொண்டு நிகழும் மங்களகரமான {year} {month} <strong>(13.09.2026)</strong> ஞாயிற்றுக்கிழமை, {paksham}, {thithi}, {natchathiram}, {yogam} கூடிய சுபயோக சுபதினத்தில் <strong>காலை 6.00 மணிக்குமேல் 7.30 மணிக்குள்ளாக</strong> {lagnam},',
    'inv.bride.of': 'என்கிற கன்னிகைக்கும்',
    'inv.groom.of': 'என்கிற வரனுக்கும்',
    'inv.union': 'திருமணம் நடைபெற உள்ளது.',
    'inv.close': 'திருமணம் செய்ய பெரியோர்களால் நிச்சயித்தவண்ணம் <strong>{venue}</strong> ({venueSub}), {address} — நடைபெறும் திருமணத்திற்கு தாங்கள் தங்கள் சுற்றமும், நட்பும் சூழ வருகை தந்து மணமக்களை வாழ்த்தியருளுமாறு அன்புடன் அழைக்கின்றோம்.',

    'sch.eyebrow': 'நன்னாட்கள்',
    'sch.title': 'நிகழ்ச்சி நிரல்',
    'sch.date': 'நாள்',
    'sch.time': 'நேரம்',
    'sch.where': 'இடம்',
    'sch.addcal': 'நினைவூட்டல் சேர்',

    'cd.eyebrow': 'இன்னும்',
    'cd.title': 'முகூர்த்தத்திற்கு',
    'cd.days': 'நாட்கள்',
    'cd.hours': 'மணி',
    'cd.minutes': 'நிமிடம்',
    'cd.seconds': 'வினாடி',
    'cd.today': 'இன்றே அந்த நன்னாள். மண்டபத்தில் சந்திப்போம்!',
    'cd.past': 'எங்கள் மகிழ்வில் பங்கேற்றமைக்கு நன்றி.',

    'venue.eyebrow': 'வழி',
    'venue.title': 'திருமண இடம்',
    'venue.directions': 'வழி காட்டு',
    'venue.openmap': 'Google Maps-ல் திற',
    'venue.maploading': 'வரைபடம்',

    'gal.eyebrow': 'நினைவுகள்',
    'gal.title': 'படங்கள்',

    'fam.eyebrow': 'ஆசியுடன்',
    'fam.title': 'எங்கள் குடும்பம்',

    'con.eyebrow': 'உதவி தேவையா?',
    'con.title': 'தொடர்பு',
    'con.call': 'அழை',
    'con.note': 'வழி, நேரம் — எதற்கும் தயங்காமல் அழையுங்கள்.',

    'share.title': 'அழைப்பிதழைப் பகிர',
    'share.copy': 'இணைப்பை நகலெடு',
    'share.copied': 'நகலெடுக்கப்பட்டது',
    'share.whatsapp': 'WhatsApp',
    'share.native': 'பகிர்',
    'share.text': '{groom} – {bride} திருமண அழைப்பு — 13 செப்டம்பர் 2026, ஞாயிற்றுக்கிழமை, காஞ்சிபுரம்.',
    'foot.blessing': 'அன்பும் ஆசியும்',
    'foot.families': 'உதயகுமார்–வளர்மதி & வள்ளி–கார்த்தி குடும்பத்தார்'
  }
};

/* Date formatting helpers, locale-aware. */
export const DATE_FMT = {
  en: { weekday: 'Sunday', long: 'Sunday, 13 September 2026' },
  ta: { weekday: 'ஞாயிற்றுக்கிழமை', long: '13 செப்டம்பர் 2026, ஞாயிற்றுக்கிழமை' }
};

export function t(lang, key, vars) {
  const table = STRINGS[lang] || STRINGS.en;
  let s = table[key];
  if (s === undefined) s = STRINGS.en[key];
  if (s === undefined) return '';
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll('{' + k + '}', v);
    }
  }
  return s;
}

export default STRINGS;
