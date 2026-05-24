const ADS = [
  {
    headline: "WANTED",
    body: "Senior Engineer with 10+ years React experience. Must know framework released 2 weeks ago. Pizza Fridays.",
    cta: "Apply within",
  },
  {
    headline: "DR. SEMICOLON'S",
    body: "Miracle Tonic for Tired Codebases! Removes Tech Debt in ONE WEEK. Side effects include refactor euphoria.",
    cta: "Try free for 14 days",
  },
  {
    headline: "FOR SALE",
    body: "One (1) lightly used JavaScript framework. Trendy in 2019. Best offer. Includes 47 transitive dependencies.",
    cta: "Inquire on GitHub",
  },
  {
    headline: "STANDUP ANONYMOUS",
    body: "Trapped in meetings? We can help. Meetings every Tuesday at 9 AM (mandatory). First standup free.",
    cta: "Yesterday I joined",
  },
  {
    headline: "THE COPILOT CIRCUS",
    body: "Marvel as our LLM hallucinates entire libraries! Watch in awe as it confidently invents APIs! One showing nightly.",
    cta: "Tickets at the door",
  },
  {
    headline: "LEGAL NOTICE",
    body: "If you or a loved one have written `// TODO: refactor later` between 2014 and present, you may be entitled to compensation.",
    cta: "Call 1-800-TECH-DEBT",
  },
  {
    headline: "RUST OR BUST",
    body: "Tired of segfaults? Rewrite it in Rust. Free borrow checker with every subscription. Lifetime guaranteed (literally).",
    cta: "cargo install peace",
  },
  {
    headline: "MISSING",
    body: "Have you seen this `node_modules/`? Last seen Tuesday. 1.2 GB. Reward offered for safe return. Do not approach without `rm -rf`.",
    cta: "Contact your registry",
  },
  {
    headline: "GENTLEMEN'S CLI",
    body: "A refined terminal for the discerning developer. Includes ASCII brandy snifter. No emojis on the menu. Tabs only.",
    cta: "Reservations: vim ~/.bashrc",
  },
  {
    headline: "SCHRÖDINGER'S DEPLOY",
    body: "Is it shipped? Is it broken? Until someone opens production, it is both. New from the makers of WORKS-ON-MY-MACHINE™.",
    cta: "Roll the dice",
  },
  {
    headline: "STRICT-MODE ASYLUM",
    body: "A peaceful retreat for developers traumatized by `useEffect` infinite loops. Counselors fluent in dependency arrays.",
    cta: "Visiting hours: 9 to 5",
  },
  {
    headline: "MERGE CONFLICT MEDIATOR",
    body: "Trained negotiator settles your binary disputes. References from Linus available on request. Cash, crypto, or rebases accepted.",
    cta: "Book a session",
  },
  {
    headline: "TEMPORAL TAVERN",
    body: "Where moment.js, date-fns, and Temporal walk into a bar. Happy hour every UTC noon. Local time results may vary.",
    cta: "BYO timezone",
  },
  {
    headline: "GENTLEMEN'S `man` PAGES",
    body: "An exclusive club for those who read documentation. Members-only `--help`. Dress code: terminal black.",
    cta: "Inquire via stdin",
  },
  {
    headline: "MISSING: ONE PRIVATE KEY",
    body: "Last seen committed to public GitHub repo. Has wallet attached. Finder may keep contents. Owner has accepted fate.",
    cta: "Don't bother",
  },
  {
    headline: "FOR HIRE: REGEX",
    body: "Professional pattern matcher will parse your HTML. Yes, I know. The price reflects the suffering.",
    cta: ".*",
  },
  {
    headline: "GRANDMA'S BACKUPS",
    body: "Old-fashioned backups, the way grandma made them. tar -cvzf and good intentions. No cloud, no consent forms.",
    cta: "rsync the family recipe",
  },
];

export function AdBlock({ seed }: { seed: number }) {
  const ad = ADS[seed % ADS.length];
  return (
    <aside className="break-inside-avoid border-2 border-double border-rule p-3 my-2 text-center bg-paper-shade/30">
      <div className="kicker">— Advertisement —</div>
      <div className="font-display text-xl font-black tracking-tight mt-1">
        {ad.headline}
      </div>
      <div className="my-1 h-px bg-rule/60" />
      <p className="text-[0.78rem] leading-snug italic">{ad.body}</p>
      <div className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
        {ad.cta}
      </div>
    </aside>
  );
}
