/**
 * Hand-curated "On this day in dev history" entries.
 * Key: "MM-DD". Each entry can have multiple events.
 * Years are best-effort; some are approximated by month.
 */

export type DevHistoryEvent = {
  year: number;
  text: string;
};

const ENTRIES: Record<string, DevHistoryEvent[]> = {
  "01-01": [
    { year: 1970, text: "The Unix epoch begins. Everything is, technically, a question of seconds." },
    { year: 1983, text: "ARPANET adopts TCP/IP. The Internet, as we know it, opens its doors." },
  ],
  "01-09": [
    { year: 2007, text: "Apple introduces the iPhone. The web, suddenly, has to learn manners." },
  ],
  "02-04": [
    { year: 2004, text: "Facebook launches at Harvard. The newsfeed waits its turn." },
  ],
  "02-15": [
    { year: 2005, text: "YouTube is registered. Bandwidth braces for the worst." },
  ],
  "03-09": [
    { year: 2009, text: "Node.js is introduced by Ryan Dahl at JSConf EU. The server learns to wait." },
  ],
  "03-12": [
    { year: 1989, text: "Tim Berners-Lee submits 'Information Management: A Proposal'. The Web is conceived." },
  ],
  "04-01": [
    { year: 2004, text: "Gmail launches. Everyone assumes April Fools'. It is not." },
  ],
  "04-07": [
    { year: 1969, text: "RFC 1 is published. Bureaucracy gets numbered." },
  ],
  "04-09": [
    { year: 2005, text: "Git's first version is released by Linus Torvalds. Branching opinions soon follow." },
  ],
  "05-07": [
    { year: 1998, text: "Apple introduces the iMac. CRTs everywhere prepare to be replaced." },
  ],
  "05-22": [
    { year: 1990, text: "Microsoft releases Windows 3.0. Solitaire wins the productivity war." },
  ],
  "05-23": [
    { year: 1995, text: "Sun Microsystems releases Java. 'Write once, run anywhere' begins its long career." },
  ],
  "05-24": [
    { year: 2026, text: "Vol. 1, No. 144 of The Dev Times goes to press. (You are reading it.)" },
  ],
  "06-23": [
    { year: 1912, text: "Alan Turing is born. Everything we do here, however indirectly, owes him." },
  ],
  "07-09": [
    { year: 1962, text: "ARPA awards the contract that will become ARPANET. The fuse is lit." },
  ],
  "07-15": [
    { year: 2006, text: "Twitter launches. Brevity becomes a competitive sport." },
  ],
  "07-17": [
    { year: 1980, text: "Commodore launches the VIC-20. Bedrooms become labs." },
  ],
  "08-06": [
    { year: 1991, text: "Tim Berners-Lee publishes the first website. It is, somehow, still up." },
  ],
  "08-15": [
    { year: 1995, text: "Internet Explorer 1.0 ships. The browser wars begin in earnest." },
  ],
  "08-25": [
    { year: 1991, text: "Linus Torvalds announces Linux on comp.os.minix. 'Just a hobby, won't be big.'" },
  ],
  "09-04": [
    { year: 1998, text: "Google is founded. Stack Overflow's future spouse, finally." },
  ],
  "09-09": [
    { year: 1947, text: "Grace Hopper logs the first computer 'bug' — a real moth, stuck in a relay." },
  ],
  "09-23": [
    { year: 2008, text: "Android 1.0 ships on the T-Mobile G1. The pull-down notification shade is born." },
  ],
  "09-27": [
    { year: 1983, text: "Richard Stallman announces the GNU Project. Freedom, recursively defined." },
  ],
  "10-04": [
    { year: 1957, text: "Sputnik launches. America panics, then invents ARPA." },
  ],
  "10-05": [
    { year: 1991, text: "Linus releases Linux 0.02. The world's most-shipped kernel takes a first step." },
  ],
  "10-23": [
    { year: 2001, text: "Apple unveils the iPod. '1000 songs in your pocket' starts a long war on the headphone jack." },
  ],
  "10-25": [
    { year: 2001, text: "Microsoft launches Windows XP. The Bliss wallpaper enters the canon." },
  ],
  "11-12": [
    { year: 1990, text: "Tim Berners-Lee writes the first WorldWideWeb browser. View source: <p>." },
  ],
  "11-15": [
    { year: 1971, text: "Intel ships the 4004. Four bits, big future." },
  ],
  "11-30": [
    { year: 2022, text: "ChatGPT launches publicly. Every developer's autocomplete suddenly has opinions." },
  ],
  "12-09": [
    { year: 1968, text: "Doug Engelbart gives 'The Mother of All Demos'. The mouse, hypertext, video conferencing — all at once." },
  ],
  "12-10": [
    { year: 1815, text: "Ada Lovelace is born. The first programmer arrives, slightly ahead of schedule." },
  ],
  "12-25": [
    { year: 1990, text: "Tim Berners-Lee successfully demos the first HTTP server-client exchange. Merry Web-mas." },
  ],
};

// universal evergreen entries used when MM-DD has nothing
const EVERGREEN: DevHistoryEvent[] = [
  { year: 1972, text: "Today, somewhere, a junior dev rediscovers regex and posts about it." },
  { year: 1986, text: "Today, someone shipped a fix that worked. They will, regrettably, never know why." },
  { year: 1999, text: "Today, a `console.log('here')` was committed to production. We do not speak of it." },
];

function todayKey(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

export function getOnThisDay(d: Date = new Date()): DevHistoryEvent[] {
  const key = todayKey(d);
  const found = ENTRIES[key];
  if (found && found.length > 0) return found;
  // pick deterministic evergreen based on day-of-year so it varies but is stable per-day
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return [EVERGREEN[doy % EVERGREEN.length]];
}
