/**
 * The Devil's Dev Dictionary — definitions in the spirit of Ambrose Bierce.
 */

export type Definition = {
  word: string;
  part: string; // (n.), (v.), (adj.), etc
  body: string;
};

const ENTRIES: Definition[] = [
  { word: "Microservice", part: "(n.)", body: "A monolith that got tired of being in the same room as itself." },
  { word: "Tech Debt", part: "(n.)", body: "A loan taken out by past-you, repayable by present-you, with interest collected by future-you." },
  { word: "Refactor", part: "(v.)", body: "To rearrange code so that the bugs are in different places." },
  { word: "Linter", part: "(n.)", body: "A pedantic stranger who insists you use single quotes." },
  { word: "Cache", part: "(n.)", body: "A fast place to keep wrong answers." },
  { word: "Deadline", part: "(n.)", body: "A line, drawn arbitrarily, that, once crossed, becomes a guideline." },
  { word: "Documentation", part: "(n.)", body: "An aspirational fiction, beloved of all who do not have to write it." },
  { word: "MVP", part: "(n.)", body: "What ships. Often, alas, exactly what stays in production for seven years." },
  { word: "Standup", part: "(n.)", body: "A meeting whose chief output is the discovery that it could have been an email." },
  { word: "Pair Programming", part: "(n.)", body: "Two devs typing one mistake twice as fast." },
  { word: "Code Review", part: "(n.)", body: "The art of finding objection to a working program." },
  { word: "Force Push", part: "(v.)", body: "The decisive use of authority over events that have already happened." },
  { word: "Open Source", part: "(adj.)", body: "Free, as in puppy." },
  { word: "Latency", part: "(n.)", body: "The price of bandwidth, paid retail." },
  { word: "Hotfix", part: "(n.)", body: "A cold-sweat patch deployed in haste, repented at leisure." },
  { word: "Idempotent", part: "(adj.)", body: "Of an operation: said reverently when one is uncertain." },
  { word: "Senior Engineer", part: "(n.)", body: "One who has, with sufficient patience, made every mistake at least twice." },
  { word: "Cloud", part: "(n.)", body: "Someone else's computer, billed by the second to be reassuring." },
  { word: "Distributed System", part: "(n.)", body: "A system in which a computer you didn't know existed has rendered yours unusable." },
  { word: "Production", part: "(n.)", body: "The only true test environment. See also: panic." },
  { word: "Type Safety", part: "(n.)", body: "A pious wish, partially answered." },
  { word: "Naming", part: "(n.)", body: "Together with cache invalidation and off-by-one errors, one of the two hard problems in computer science." },
  { word: "Yak Shaving", part: "(v. n.)", body: "Any sequence of perfectly reasonable steps, the last of which makes you weep." },
  { word: "Backwards Compatibility", part: "(n.)", body: "A vow of celibacy taken with one's own past decisions." },
  { word: "Schema", part: "(n.)", body: "What it would have been, had anyone known." },
  { word: "Async", part: "(adj.)", body: "Of an operation that has consented to be forgotten." },
  { word: "Webhook", part: "(n.)", body: "A polite knock, delivered in triplicate, at three in the morning." },
  { word: "Microfrontend", part: "(n.)", body: "Like a microservice, but with even more JavaScript." },
  { word: "Eventually Consistent", part: "(adj.)", body: "Wrong, but only briefly. (Brevity varies.)" },
  { word: "Magic Number", part: "(n.)", body: "A constant whose origin is lost, like a family heirloom no one quite recognizes." },
];

export function getDailyDefinitions(d: Date = new Date(), n = 12): Definition[] {
  const start = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  const out: Definition[] = [];
  for (let i = 0; i < n; i++) {
    out.push(ENTRIES[(doy * 7 + i) % ENTRIES.length]);
  }
  return out;
}
