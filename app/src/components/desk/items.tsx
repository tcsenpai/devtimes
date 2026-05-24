/**
 * Desk item registry — SVG renderers for the customizable desktop.
 * Each item has a canonical size (default w/h) and a renderer.
 */

const STROKE = "#2a2a26";
const PAPER = "#e9dfc4";
const COFFEE = "#4a2c1a";
const COFFEE_FOAM = "#c9a87a";
const ACCENT = "#cc785c";

function CoffeeMug() {
  return (
    <svg viewBox="0 0 120 130" className="h-full w-full" aria-hidden>
      <g stroke={STROKE} strokeWidth="1.5" fill="none" opacity="0.45">
        <path d="M 50 20 Q 55 12 50 4 Q 45 -4 50 -12" />
        <path d="M 62 22 Q 67 14 62 6 Q 57 -2 62 -10" />
        <path d="M 74 20 Q 79 12 74 4 Q 69 -4 74 -12" />
      </g>
      <path d="M 25 40 L 30 110 Q 30 120 40 120 L 80 120 Q 90 120 90 110 L 95 40 Z" fill="#1a1a17" stroke={STROKE} strokeWidth="2" />
      <ellipse cx="60" cy="42" rx="34" ry="6" fill={COFFEE} stroke={STROKE} strokeWidth="1.5" />
      <ellipse cx="60" cy="42" rx="28" ry="3" fill={COFFEE_FOAM} opacity="0.5" />
      <path d="M 90 50 Q 110 55 110 75 Q 110 95 90 95" fill="none" stroke={STROKE} strokeWidth="3" />
      <text x="60" y="85" textAnchor="middle" fill={PAPER} fontFamily="serif" fontSize="14" fontStyle="italic">dev</text>
    </svg>
  );
}

function Notebook() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <rect x="10" y="14" width="140" height="90" fill="#2a1f15" opacity="0.25" rx="2" />
      <rect x="6" y="10" width="140" height="90" fill="#7a5a3a" stroke={STROKE} strokeWidth="2" rx="3" />
      <g stroke={STROKE} strokeWidth="1.5" fill="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={18 + i * 13} cy="10" r="3" fill="#1a1a17" />
        ))}
      </g>
      <rect x="12" y="22" width="128" height="72" fill={PAPER} />
      <g stroke="#a08555" strokeWidth="0.6" opacity="0.6">
        {[35, 45, 55, 65, 75, 85].map((y) => (
          <line key={y} x1="18" y1={y} x2="134" y2={y} />
        ))}
      </g>
      <line x1="28" y1="22" x2="28" y2="94" stroke={ACCENT} strokeWidth="0.8" opacity="0.7" />
      <g stroke={STROKE} strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d="M 34 33 Q 50 30 60 34 T 90 33" />
        <path d="M 34 43 Q 60 41 80 44" />
        <path d="M 34 53 Q 55 50 75 53 T 110 52" />
        <path d="M 34 63 Q 50 61 70 63" />
      </g>
    </svg>
  );
}

function Pen() {
  return (
    <svg viewBox="0 0 200 30" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="26" rx="80" ry="3" fill="#1a1a17" opacity="0.2" />
      <rect x="20" y="10" width="140" height="10" fill={ACCENT} stroke={STROKE} strokeWidth="1.5" rx="2" />
      <rect x="160" y="9" width="28" height="12" fill="#1a1a17" stroke={STROKE} strokeWidth="1.5" rx="2" />
      <rect x="166" y="6" width="3" height="14" fill={STROKE} />
      <polygon points="20,10 10,15 20,20" fill="#1a1a17" stroke={STROKE} strokeWidth="1.5" />
      <line x1="14" y1="15" x2="20" y2="15" stroke={STROKE} strokeWidth="0.8" />
    </svg>
  );
}

function Glasses() {
  return (
    <svg viewBox="0 0 180 70" className="h-full w-full" aria-hidden>
      <ellipse cx="90" cy="55" rx="70" ry="4" fill="#1a1a17" opacity="0.15" />
      <circle cx="40" cy="30" r="24" fill="rgba(180,180,180,0.18)" stroke={STROKE} strokeWidth="2.5" />
      <circle cx="140" cy="30" r="24" fill="rgba(180,180,180,0.18)" stroke={STROKE} strokeWidth="2.5" />
      <path d="M 64 28 Q 90 22 116 28" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <line x1="16" y1="30" x2="2" y2="36" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="164" y1="30" x2="178" y2="36" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Stamp() {
  return (
    <svg viewBox="0 0 110 70" className="h-full w-full" aria-hidden>
      <ellipse cx="55" cy="62" rx="40" ry="3" fill="#1a1a17" opacity="0.2" />
      <rect x="20" y="22" width="70" height="14" fill="#3a2d20" stroke={STROKE} strokeWidth="1.5" />
      <rect x="15" y="36" width="80" height="20" fill="#5a3d20" stroke={STROKE} strokeWidth="1.5" />
      <rect x="42" y="8" width="26" height="16" fill={ACCENT} stroke={STROKE} strokeWidth="1.5" rx="3" />
      <line x1="55" y1="8" x2="55" y2="22" stroke={STROKE} strokeWidth="1" />
      <text x="55" y="51" textAnchor="middle" fill={PAPER} fontFamily="serif" fontSize="9" fontWeight="bold" opacity="0.7">PRESS</text>
    </svg>
  );
}

function Paperclip() {
  return (
    <svg viewBox="0 0 50 90" className="h-full w-full" aria-hidden>
      <path d="M 25 8 Q 38 8 38 22 L 38 65 Q 38 80 25 80 Q 12 80 12 65 L 12 25 Q 12 18 19 18 Q 26 18 26 25 L 26 60" fill="none" stroke="#888" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Keyboard() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="72" rx="90" ry="4" fill="#1a1a17" opacity="0.2" />
      <rect x="8" y="14" width="184" height="54" fill="#2a2a26" stroke={STROKE} strokeWidth="2" rx="4" />
      <rect x="12" y="18" width="176" height="46" fill="#1a1a17" rx="2" />
      <g fill="#3a3a36">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`r1-${i}`} x={16 + i * 14} y={22} width="11" height="10" rx="1.5" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`r2-${i}`} x={18 + i * 14} y={34} width="11" height="10" rx="1.5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={`r3-${i}`} x={22 + i * 14} y={46} width="11" height="10" rx="1.5" />
        ))}
      </g>
      <rect x="60" y="58" width="80" height="6" fill="#3a3a36" rx="1.5" />
    </svg>
  );
}

function Cassette() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <ellipse cx="80" cy="100" rx="60" ry="4" fill="#1a1a17" opacity="0.2" />
      <rect x="8" y="8" width="144" height="90" fill="#cc785c" stroke={STROKE} strokeWidth="2" rx="4" />
      <rect x="20" y="20" width="120" height="38" fill={PAPER} stroke={STROKE} strokeWidth="1.5" />
      <text x="80" y="34" textAnchor="middle" fontFamily="serif" fontSize="11" fontStyle="italic">MIX 1996</text>
      <line x1="22" y1="42" x2="138" y2="42" stroke={STROKE} strokeWidth="0.5" />
      <line x1="22" y1="50" x2="138" y2="50" stroke={STROKE} strokeWidth="0.5" />
      <circle cx="50" cy="78" r="14" fill="#1a1a17" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="50" cy="78" r="5" fill="#666" />
      <circle cx="110" cy="78" r="14" fill="#1a1a17" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="110" cy="78" r="5" fill="#666" />
      <rect x="64" y="74" width="32" height="8" fill="#1a1a17" stroke={STROKE} strokeWidth="1" />
    </svg>
  );
}

function Floppy() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <ellipse cx="50" cy="92" rx="40" ry="3" fill="#1a1a17" opacity="0.2" />
      <rect x="6" y="6" width="88" height="88" fill="#1a1a17" stroke={STROKE} strokeWidth="2" rx="2" />
      <rect x="18" y="10" width="64" height="34" fill="#888" stroke={STROKE} strokeWidth="1" />
      <rect x="22" y="14" width="10" height="26" fill="#1a1a17" />
      <rect x="14" y="54" width="72" height="36" fill={PAPER} stroke={STROKE} strokeWidth="1.5" />
      <text x="50" y="74" textAnchor="middle" fontFamily="serif" fontSize="10" fontStyle="italic">backup.bak</text>
      <text x="50" y="86" textAnchor="middle" fontFamily="serif" fontSize="7" fill="#666">do not erase</text>
    </svg>
  );
}

function Newspaper2() {
  return (
    <svg viewBox="0 0 140 100" className="h-full w-full" aria-hidden>
      <ellipse cx="70" cy="94" rx="55" ry="3" fill="#1a1a17" opacity="0.2" />
      <rect x="6" y="8" width="128" height="84" fill={PAPER} stroke={STROKE} strokeWidth="1.5" />
      <text x="70" y="22" textAnchor="middle" fontFamily="serif" fontSize="9" fontStyle="italic" fontWeight="bold">YESTERDAY</text>
      <line x1="14" y1="28" x2="126" y2="28" stroke={STROKE} strokeWidth="0.5" />
      <g stroke={STROKE} strokeWidth="0.5">
        {[34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86].map((y) => (
          <line key={y} x1="14" y1={y} x2="68" y2={y} opacity="0.5" />
        ))}
        {[34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86].map((y) => (
          <line key={`r-${y}`} x1="72" y1={y} x2="126" y2={y} opacity="0.5" />
        ))}
      </g>
    </svg>
  );
}

function CompactDisc() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <ellipse cx="50" cy="92" rx="40" ry="3" fill="#1a1a17" opacity="0.2" />
      <circle cx="50" cy="50" r="44" fill="url(#cdgrad)" stroke={STROKE} strokeWidth="1.5" />
      <defs>
        <radialGradient id="cdgrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#aaa" />
          <stop offset="40%" stopColor="#ddd" />
          <stop offset="60%" stopColor="#bbb" />
          <stop offset="100%" stopColor="#666" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#888" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#888" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="#888" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="12" fill={PAPER} stroke={STROKE} strokeWidth="1" />
      <circle cx="50" cy="50" r="4" fill="#1a1a17" />
    </svg>
  );
}

export type DeskItemType =
  | "mug"
  | "notebook"
  | "pen"
  | "glasses"
  | "stamp"
  | "paperclip"
  | "keyboard"
  | "cassette"
  | "floppy"
  | "newspaper"
  | "cd";

export type ItemSpec = {
  type: DeskItemType;
  label: string;
  width: number;
  height: number;
  render: () => React.ReactNode;
};

export const ITEM_LIBRARY: Record<DeskItemType, ItemSpec> = {
  mug:        { type: "mug",        label: "Coffee Mug",   width: 90,  height: 100, render: () => <CoffeeMug /> },
  notebook:   { type: "notebook",   label: "Notebook",     width: 180, height: 130, render: () => <Notebook /> },
  pen:        { type: "pen",        label: "Pen",          width: 200, height: 30,  render: () => <Pen /> },
  glasses:    { type: "glasses",    label: "Reading Specs",width: 130, height: 50,  render: () => <Glasses /> },
  stamp:      { type: "stamp",      label: "PRESS Stamp",  width: 110, height: 70,  render: () => <Stamp /> },
  paperclip:  { type: "paperclip",  label: "Paperclip",    width: 30,  height: 60,  render: () => <Paperclip /> },
  keyboard:   { type: "keyboard",   label: "Keyboard",     width: 220, height: 80,  render: () => <Keyboard /> },
  cassette:   { type: "cassette",   label: "Mix Tape",     width: 160, height: 110, render: () => <Cassette /> },
  floppy:     { type: "floppy",     label: "Floppy Disk",  width: 100, height: 100, render: () => <Floppy /> },
  newspaper:  { type: "newspaper",  label: "Old Edition",  width: 140, height: 100, render: () => <Newspaper2 /> },
  cd:         { type: "cd",         label: "CD-ROM",       width: 100, height: 100, render: () => <CompactDisc /> },
};

export const ITEM_TYPES = Object.keys(ITEM_LIBRARY) as DeskItemType[];
