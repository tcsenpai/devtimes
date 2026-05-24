/**
 * Easter-egg "secrets" the user can stumble on.
 * State persists in localStorage. Triggers dispatch a CustomEvent.
 */

export const SECRET_KEY = "devtimes.secrets.v1";

export type SecretId =
  | "moved-mug"
  | "pen-on-notebook"
  | "glasses-on-notebook"
  | "cassette-spin"
  | "cd-on-clip"
  | "konami"
  | "stained-five"
  | "all-page-numbers"
  | "midnight-late"
  | "spurelation-clicked"
  | "compose-edition"
  | "letter-sent"
  | "sfx-toggled-many"
  | "type-secret-word"
  | "perfectly-vertical-mug";

export type Difficulty = "trivial" | "easy" | "medium" | "hard" | "impossible";

export const SECRETS: Record<
  SecretId,
  { number: number; title: string; body: string; difficulty: Difficulty; hint?: string }
> = {
  "moved-mug": {
    number: 1,
    difficulty: "trivial",
    title: "The Coffee Always Knows",
    body: "You stirred the desk. Across the world, a junior dev mistypes `\\:wq` for the seventeenth time today.",
    hint: "Drag the coffee mug.",
  },
  "pen-on-notebook": {
    number: 2,
    difficulty: "easy",
    title: "Caught in the Act of Writing",
    body: "Pen meets paper. The Editor would like to remind you that the best changelog is the one you actually write.",
    hint: "Drop a writing implement onto a writing surface.",
  },
  "glasses-on-notebook": {
    number: 3,
    difficulty: "easy",
    title: "Reading Between the Lines",
    body: "Glasses on the notebook. Somewhere, a senior dev just realised the bug is, in fact, a feature.",
    hint: "Help the notebook see itself.",
  },
  "cassette-spin": {
    number: 4,
    difficulty: "medium",
    title: "Spinning the B-Side",
    body: "Round and round. The tape squeaks like an old git rebase. Side B is, of course, all the deprecation notices.",
    hint: "Some objects ask to be wound.",
  },
  "cd-on-clip": {
    number: 5,
    difficulty: "medium",
    title: "Held Together by Faith",
    body: "A CD-ROM on a paperclip. The original distributed system — before someone invented Kubernetes.",
    hint: "Two redundancies that wish to meet.",
  },
  "compose-edition": {
    number: 6,
    difficulty: "easy",
    title: "Editor-in-Chief, Briefly",
    body: "You composed your own edition. The press operators salute you, then ask for coffee.",
    hint: "Take a turn at the desk.",
  },
  "letter-sent": {
    number: 7,
    difficulty: "easy",
    title: "Yours, Sincerely",
    body: "Your letter is in the morning mail. The Editor reads every one. (No, they don't. But your inner Editor does.)",
    hint: "Write to the Editor.",
  },
  "stained-five": {
    number: 8,
    difficulty: "medium",
    title: "The Five Rings",
    body: "Five coffee stains, one careful reader. Marie Kondo would have words.",
    hint: "Coffee rings, collected.",
  },
  konami: {
    number: 9,
    difficulty: "medium",
    title: "↑ ↑ ↓ ↓ ← → ← → B A",
    body: "Of course you tried it. The newspaper does, in fact, remember every cheat code ever entered into a Konami arcade.",
    hint: "Old fingers remember old patterns.",
  },
  "all-page-numbers": {
    number: 10,
    difficulty: "hard",
    title: "Cover to Cover",
    body: "Every single page, visited. The Editor has lit a candle in your honour. (Then blown it out — fire hazard.)",
    hint: "Every page deserves a turn.",
  },
  "spurelation-clicked": {
    number: 11,
    difficulty: "easy",
    title: "Sceptic at the Statistics Desk",
    body: "You investigated the source. Good. Always investigate the source.",
    hint: "Trust, but verify the chart.",
  },
  "sfx-toggled-many": {
    number: 12,
    difficulty: "medium",
    title: "The Sound Engineer",
    body: "You toggled the typewriter sound enough times that the Editor heard it from down the hall.",
    hint: "Make up your mind, audibly.",
  },
  "midnight-late": {
    number: 13,
    difficulty: "hard",
    title: "Stamped Whilst the Town Slept",
    body: "You held this edition past midnight. The presses are still warm. The night editor approves.",
    hint: "Late, in the local sense.",
  },
  "perfectly-vertical-mug": {
    number: 14,
    difficulty: "impossible",
    title: "The Cup is Upright",
    body: "You aligned the mug to within a degree of true vertical. This is, statistically, almost impossible. Well done.",
    hint: "Find the still point of the turning desk.",
  },
  "type-secret-word": {
    number: 15,
    difficulty: "impossible",
    title: "The Magic Word",
    body: "You typed the word. The Editor will not tell anyone. The Editor cannot help but be impressed.",
    hint: "Old printers had a word. So did old hackers. They were the same word.",
  },
};

export const TOTAL_SECRETS = Object.keys(SECRETS).length;

export function loadFound(): SecretId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SECRET_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is SecretId => typeof x === "string" && x in SECRETS);
  } catch {
    return [];
  }
}

export function markFound(id: SecretId): boolean {
  if (typeof window === "undefined") return false;
  const found = loadFound();
  if (found.includes(id)) return false;
  found.push(id);
  try {
    localStorage.setItem(SECRET_KEY, JSON.stringify(found));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("devtimes:secret-found", { detail: id }));
  return true;
}

export function isFound(id: SecretId): boolean {
  return loadFound().includes(id);
}
