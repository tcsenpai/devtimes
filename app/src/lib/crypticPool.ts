/**
 * A rotating pool of hand-written dev crypticesque puzzles.
 * Picked deterministically by day-of-year.
 */

export type Cryptic = {
  number: number;
  grid: string[]; // ascii art
  across: string[];
  down: string[];
  note: string;
};

const POOL: Cryptic[] = [
  {
    number: 1,
    grid: [
      "G I T B R A N C H",
      ". . O . . . . . .",
      ". V I M . D R Y .",
      ". . . . . . . . .",
      ". L I N T . S S H",
      ". . . . . . . . .",
      ". K U B E C T L .",
    ],
    across: [
      "1. ___ commit -m 'wip' (3)",
      "5. Editor whose users won't shut up (3)",
      "6. Don't Repeat Yourself, acronym (3)",
      "9. JS linter you ignore (4)",
      "10. Pod-wrangling CLI (7)",
    ],
    down: [
      "2. Whitespace religion (4)",
      "3. Schrödinger's deploy target (3)",
      "4. Two of these and a wrapper (3)",
    ],
    note: "(Solution next edition. Probably.)",
  },
  {
    number: 2,
    grid: [
      "R U S T C A R G O",
      ". . . . . . . . .",
      "C R A T E . T O M",
      ". . . . . . . . .",
      "B O R R O W . . .",
      ". . . . . . . . .",
      "L I F E T I M E S",
    ],
    across: [
      "1. The compiler that loves you (4)",
      "2. Rust's package boss (5)",
      "5. Rust unit of distribution (5)",
      "6. Config file extension (3)",
      "7. The checker that bites (6)",
      "9. Bounded by these (9)",
    ],
    down: [
      "3. The owner, not the renter (3)",
      "4. Single quote: ___ (4)",
      "8. Move, copy, ___ (5)",
    ],
    note: "(Solution rewritten in Rust.)",
  },
  {
    number: 3,
    grid: [
      "S T A C K T R A C E",
      ". . . . . . . . . .",
      "H E A P . G C . . .",
      ". . . . . . . . . .",
      "N I L . . . F O O .",
      ". . . . . . . . . .",
      "T H R E A D L O C K",
    ],
    across: [
      "1. Read it from the bottom (10)",
      "5. Where new() goes (4)",
      "6. Memory janitor (2)",
      "8. The null with attitude (3)",
      "9. Placeholder of placeholders (3)",
      "10. Multi-core curse (10)",
    ],
    down: [
      "2. Process container (6)",
      "3. Pointer to nothing (3)",
      "4. Concurrent disagreement (4)",
    ],
    note: "(Solutions on the merge branch.)",
  },
  {
    number: 4,
    grid: [
      "M O N O R E P O .",
      ". . . . . . . . .",
      "L E R N A . N P M",
      ". . . . . . . . .",
      "T U R B O . W S P",
      ". . . . . . . . .",
      "C I . . . . . . .",
    ],
    across: [
      "1. One repo to rule them all (8)",
      "3. The bun's predecessor (5)",
      "4. The registry that fell (3)",
      "5. Build tool with a wind theme (5)",
      "7. Workspace, abbreviated (3)",
      "8. Continuous what's-its-name (2)",
    ],
    down: [
      "2. The package, when it weeps (3)",
      "6. Where the bug is, always (3)",
    ],
    note: "(Submit corrections via PR.)",
  },
];

export function getCrypticForDay(d: Date = new Date()): Cryptic {
  const start = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return POOL[doy % POOL.length];
}
