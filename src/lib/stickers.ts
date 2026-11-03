// Simple vector stickers. "{C}" is replaced with the sticker's chosen color.
// All use a 100×100 viewBox.

export interface StickerDef {
  id: string;
  name: string;
  defaultColor: string;
  tags: string[];
  svg: string; // inner SVG markup
}

export const STICKERS: StickerDef[] = [
  {
    id: "heart",
    name: "Heart",
    defaultColor: "#e0475b",
    tags: ["wedding", "anniversary", "love"],
    svg: `<path fill="{C}" d="M50 88 C18 64 6 46 10 30 C14 14 34 8 50 26 C66 8 86 14 90 30 C94 46 82 64 50 88 Z"/>`,
  },
  {
    id: "star",
    name: "Star",
    defaultColor: "#f2b705",
    tags: ["birthday", "graduation", "holiday"],
    svg: `<path fill="{C}" d="M50 6 L62 38 L96 39 L69 60 L79 93 L50 73 L21 93 L31 60 L4 39 L38 38 Z"/>`,
  },
  {
    id: "sparkle",
    name: "Sparkle",
    defaultColor: "#d4a017",
    tags: ["wedding", "birthday", "holiday"],
    svg: `<path fill="{C}" d="M50 4 C54 36 64 46 96 50 C64 54 54 64 50 96 C46 64 36 54 4 50 C36 46 46 36 50 4 Z"/><path fill="{C}" opacity=".6" d="M84 8 C85 16 88 19 96 20 C88 21 85 24 84 32 C83 24 80 21 72 20 C80 19 83 16 84 8 Z"/>`,
  },
  {
    id: "balloon",
    name: "Balloon",
    defaultColor: "#e94f64",
    tags: ["birthday", "baby"],
    svg: `<ellipse cx="50" cy="36" rx="26" ry="31" fill="{C}"/><path fill="{C}" d="M45 66 L55 66 L50 72 Z"/><path d="M50 72 C44 80 56 86 50 96" stroke="#555" stroke-width="1.6" fill="none"/><ellipse cx="40" cy="24" rx="6" ry="9" fill="#fff" opacity=".35"/>`,
  },
  {
    id: "cake",
    name: "Cake",
    defaultColor: "#f48fb1",
    tags: ["birthday"],
    svg: `<rect x="16" y="52" width="68" height="36" rx="5" fill="{C}"/><rect x="12" y="84" width="76" height="8" rx="4" fill="#8d6e63"/><path d="M16 60 Q24 68 33 60 T50 60 T67 60 T84 60" stroke="#fff" stroke-width="5" fill="none"/><rect x="30" y="34" width="5" height="18" fill="#90caf9"/><rect x="47.5" y="34" width="5" height="18" fill="#a5d6a7"/><rect x="65" y="34" width="5" height="18" fill="#ffe082"/><ellipse cx="32.5" cy="29" rx="3" ry="5" fill="#ff9800"/><ellipse cx="50" cy="29" rx="3" ry="5" fill="#ff9800"/><ellipse cx="67.5" cy="29" rx="3" ry="5" fill="#ff9800"/>`,
  },
  {
    id: "gift",
    name: "Gift",
    defaultColor: "#4a90d9",
    tags: ["birthday", "holiday"],
    svg: `<rect x="14" y="40" width="72" height="50" rx="4" fill="{C}"/><rect x="10" y="30" width="80" height="14" rx="3" fill="{C}"/><rect x="45" y="30" width="10" height="60" fill="#fff" opacity=".85"/><path d="M50 30 C38 12 22 18 30 28 Z M50 30 C62 12 78 18 70 28 Z" fill="#fff" opacity=".85"/>`,
  },
  {
    id: "party-hat",
    name: "Party hat",
    defaultColor: "#7e57c2",
    tags: ["birthday"],
    svg: `<path d="M50 10 L80 88 L20 88 Z" fill="{C}"/><path d="M38 41 L62 41 M30 62 L70 62" stroke="#fff" stroke-width="5"/><circle cx="50" cy="10" r="7" fill="#ffca28"/><rect x="16" y="84" width="68" height="8" rx="4" fill="#ffca28"/>`,
  },
  {
    id: "confetti",
    name: "Confetti",
    defaultColor: "#ef5350",
    tags: ["birthday", "graduation"],
    svg: `<rect x="10" y="14" width="10" height="5" fill="{C}" transform="rotate(30 15 16)"/><circle cx="44" cy="12" r="4" fill="#42a5f5"/><rect x="70" y="18" width="12" height="5" fill="#ffca28" transform="rotate(-25 76 20)"/><circle cx="24" cy="46" r="4" fill="#66bb6a"/><rect x="48" y="40" width="12" height="5" fill="{C}" transform="rotate(60 54 42)"/><circle cx="84" cy="48" r="4" fill="#ab47bc"/><rect x="14" y="76" width="12" height="5" fill="#42a5f5" transform="rotate(-40 20 78)"/><circle cx="52" cy="78" r="4" fill="#ffca28"/><rect x="74" y="80" width="12" height="5" fill="#66bb6a" transform="rotate(20 80 82)"/>`,
  },
  {
    id: "rings",
    name: "Rings",
    defaultColor: "#c9a227",
    tags: ["wedding", "anniversary"],
    svg: `<circle cx="38" cy="58" r="24" fill="none" stroke="{C}" stroke-width="7"/><circle cx="62" cy="58" r="24" fill="none" stroke="{C}" stroke-width="7"/><path d="M33 28 L38 20 L43 28 L38 34 Z" fill="#b3e5fc"/>`,
  },
  {
    id: "flower",
    name: "Flower",
    defaultColor: "#f06292",
    tags: ["wedding", "baby", "family"],
    svg: `<g fill="{C}"><ellipse cx="50" cy="26" rx="13" ry="20"/><ellipse cx="50" cy="74" rx="13" ry="20"/><ellipse cx="26" cy="50" rx="20" ry="13"/><ellipse cx="74" cy="50" rx="20" ry="13"/><ellipse cx="33" cy="33" rx="13" ry="20" transform="rotate(-45 33 33)"/><ellipse cx="67" cy="67" rx="13" ry="20" transform="rotate(-45 67 67)"/><ellipse cx="67" cy="33" rx="13" ry="20" transform="rotate(45 67 33)"/><ellipse cx="33" cy="67" rx="13" ry="20" transform="rotate(45 33 67)"/></g><circle cx="50" cy="50" r="12" fill="#ffd54f"/>`,
  },
  {
    id: "branch",
    name: "Leafy branch",
    defaultColor: "#6b8e5a",
    tags: ["wedding", "family", "anniversary"],
    svg: `<path d="M10 90 C35 65 60 40 90 10" stroke="{C}" stroke-width="3" fill="none"/><g fill="{C}"><ellipse cx="28" cy="64" rx="5" ry="12" transform="rotate(-60 28 64)"/><ellipse cx="34" cy="78" rx="5" ry="12" transform="rotate(20 34 78)"/><ellipse cx="46" cy="46" rx="5" ry="12" transform="rotate(-60 46 46)"/><ellipse cx="54" cy="60" rx="5" ry="12" transform="rotate(20 54 60)"/><ellipse cx="64" cy="28" rx="5" ry="12" transform="rotate(-60 64 28)"/><ellipse cx="72" cy="42" rx="5" ry="12" transform="rotate(20 72 42)"/><ellipse cx="86" cy="16" rx="4" ry="9" transform="rotate(45 86 16)"/></g>`,
  },
  {
    id: "palm",
    name: "Palm tree",
    defaultColor: "#2e7d32",
    tags: ["vacation", "travel"],
    svg: `<path d="M50 38 C54 58 52 78 46 96 L54 96 C60 76 60 56 54 38 Z" fill="#8d6e63"/><g fill="{C}"><path d="M52 38 C40 20 20 20 8 32 C24 28 38 30 52 38 Z"/><path d="M52 38 C64 20 84 20 94 32 C78 28 66 30 52 38 Z"/><path d="M52 38 C46 22 50 8 62 4 C56 16 56 28 52 38 Z"/><path d="M52 38 C34 34 18 46 16 62 C26 50 38 42 52 38 Z"/><path d="M52 38 C70 34 86 46 88 62 C78 50 66 42 52 38 Z"/></g><circle cx="48" cy="42" r="4" fill="#5d4037"/><circle cx="56" cy="42" r="4" fill="#5d4037"/>`,
  },
  {
    id: "sun",
    name: "Sun",
    defaultColor: "#ffb300",
    tags: ["vacation", "travel", "summer"],
    svg: `<circle cx="50" cy="50" r="20" fill="{C}"/><g stroke="{C}" stroke-width="6" stroke-linecap="round"><path d="M50 8 V20 M50 80 V92 M8 50 H20 M80 50 H92 M20 20 L28 28 M72 72 L80 80 M80 20 L72 28 M28 72 L20 80"/></g>`,
  },
  {
    id: "airplane",
    name: "Airplane",
    defaultColor: "#1e88e5",
    tags: ["vacation", "travel"],
    svg: `<path fill="{C}" d="M92 14 C88 10 82 12 76 18 L60 34 L18 22 L10 30 L44 50 L30 64 L18 62 L12 68 L28 76 L36 92 L42 86 L40 74 L54 60 L74 94 L82 86 L70 44 L86 28 C92 22 96 18 92 14 Z"/>`,
  },
  {
    id: "camera",
    name: "Camera",
    defaultColor: "#37474f",
    tags: ["vacation", "travel", "family"],
    svg: `<rect x="8" y="30" width="84" height="56" rx="8" fill="{C}"/><path d="M34 30 L40 18 L60 18 L66 30 Z" fill="{C}"/><circle cx="50" cy="58" r="20" fill="#fff"/><circle cx="50" cy="58" r="13" fill="{C}"/><circle cx="45" cy="53" r="4" fill="#fff" opacity=".6"/><rect x="74" y="36" width="10" height="6" rx="2" fill="#fff" opacity=".7"/>`,
  },
  {
    id: "wave",
    name: "Wave",
    defaultColor: "#26a69a",
    tags: ["vacation", "summer"],
    svg: `<path fill="{C}" d="M4 60 C18 44 30 44 40 56 C48 66 58 66 64 56 C70 44 84 40 96 52 L96 92 L4 92 Z"/><path fill="#fff" opacity=".5" d="M4 72 C18 62 28 62 38 70 C48 78 60 78 70 70 C80 62 90 62 96 68 L96 76 C88 72 80 72 70 78 C58 86 46 86 36 78 C26 70 16 70 4 80 Z"/>`,
  },
  {
    id: "map-pin",
    name: "Map pin",
    defaultColor: "#e53935",
    tags: ["vacation", "travel"],
    svg: `<path fill="{C}" d="M50 96 C30 66 18 52 18 36 C18 18 32 4 50 4 C68 4 82 18 82 36 C82 52 70 66 50 96 Z"/><circle cx="50" cy="36" r="12" fill="#fff"/>`,
  },
  {
    id: "grad-cap",
    name: "Graduation cap",
    defaultColor: "#1a237e",
    tags: ["graduation"],
    svg: `<path fill="{C}" d="M50 18 L96 38 L50 58 L4 38 Z"/><path fill="{C}" d="M24 48 L24 70 C34 80 66 80 76 70 L76 48 L50 60 Z"/><path d="M86 42 L86 70" stroke="#ffca28" stroke-width="3"/><circle cx="86" cy="74" r="5" fill="#ffca28"/>`,
  },
  {
    id: "diploma",
    name: "Diploma",
    defaultColor: "#c62828",
    tags: ["graduation"],
    svg: `<rect x="10" y="36" width="80" height="28" rx="14" fill="#fff4d6" stroke="#d7c49e" stroke-width="2"/><ellipse cx="18" cy="50" rx="8" ry="14" fill="#f3e3b8"/><rect x="46" y="34" width="10" height="32" fill="{C}"/><path d="M48 66 L42 86 L50 80 L54 88 L58 66 Z" fill="{C}"/>`,
  },
  {
    id: "footprints",
    name: "Baby feet",
    defaultColor: "#90caf9",
    tags: ["baby"],
    svg: `<g fill="{C}"><ellipse cx="32" cy="62" rx="12" ry="20"/><circle cx="22" cy="36" r="4"/><circle cx="30" cy="32" r="4"/><circle cx="38" cy="33" r="3.5"/><circle cx="44" cy="37" r="3"/><ellipse cx="68" cy="48" rx="12" ry="20"/><circle cx="78" cy="22" r="4"/><circle cx="70" cy="18" r="4"/><circle cx="62" cy="19" r="3.5"/><circle cx="56" cy="23" r="3"/></g>`,
  },
  {
    id: "crown",
    name: "Crown",
    defaultColor: "#fbc02d",
    tags: ["birthday", "baby"],
    svg: `<path fill="{C}" d="M10 78 L16 30 L36 52 L50 20 L64 52 L84 30 L90 78 Z"/><rect x="10" y="78" width="80" height="10" rx="3" fill="{C}"/><circle cx="50" cy="20" r="5" fill="#e53935"/><circle cx="16" cy="30" r="5" fill="#1e88e5"/><circle cx="84" cy="30" r="5" fill="#1e88e5"/>`,
  },
  {
    id: "tree",
    name: "Holiday tree",
    defaultColor: "#2e7d32",
    tags: ["holiday"],
    svg: `<path fill="{C}" d="M50 8 L70 36 L60 36 L78 60 L64 60 L84 84 L16 84 L36 60 L22 60 L40 36 L30 36 Z"/><rect x="44" y="84" width="12" height="10" fill="#6d4c41"/><circle cx="44" cy="44" r="3.5" fill="#e53935"/><circle cx="58" cy="56" r="3.5" fill="#ffca28"/><circle cx="40" cy="70" r="3.5" fill="#42a5f5"/><circle cx="62" cy="74" r="3.5" fill="#e53935"/><path d="M50 2 L52 7 L57 7 L53 10 L55 15 L50 12 L45 15 L47 10 L43 7 L48 7 Z" fill="#ffca28"/>`,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    defaultColor: "#64b5f6",
    tags: ["holiday", "winter"],
    svg: `<g stroke="{C}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M50 6 V94 M12 28 L88 72 M12 72 L88 28"/><path d="M40 14 L50 24 L60 14 M40 86 L50 76 L60 86 M14 40 L26 36 L22 24 M86 60 L74 64 L78 76 M14 60 L26 64 L22 76 M86 40 L74 36 L78 24"/></g>`,
  },
  {
    id: "ribbon",
    name: "Ribbon banner",
    defaultColor: "#c2593b",
    tags: ["birthday", "wedding", "graduation", "family"],
    svg: `<path fill="{C}" opacity=".75" d="M2 40 L18 40 L18 70 L2 70 L10 55 Z M98 40 L82 40 L82 70 L98 70 L90 55 Z"/><rect x="14" y="32" width="72" height="30" fill="{C}"/>`,
  },
  {
    id: "tape",
    name: "Photo tape",
    defaultColor: "#f5e6b8",
    tags: ["travel", "family", "scrapbook"],
    svg: `<path fill="{C}" opacity=".85" d="M4 38 L10 34 L6 30 L94 30 L90 34 L96 38 L90 42 L96 46 L92 50 L96 54 L90 58 L94 62 L94 70 L6 70 L10 66 L4 62 L10 58 L4 54 L8 50 L4 46 L10 42 Z"/>`,
  },
  {
    id: "paw",
    name: "Paw",
    defaultColor: "#8d6e63",
    tags: ["family", "pets"],
    svg: `<g fill="{C}"><ellipse cx="50" cy="66" rx="22" ry="18"/><ellipse cx="22" cy="42" rx="9" ry="12"/><ellipse cx="40" cy="26" rx="9" ry="12"/><ellipse cx="60" cy="26" rx="9" ry="12"/><ellipse cx="78" cy="42" rx="9" ry="12"/></g>`,
  },
];

export function stickerById(id: string) {
  return STICKERS.find((s) => s.id === id);
}

export function stickerSvg(id: string, color: string) {
  const def = stickerById(id);
  if (!def) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400">${def.svg.replaceAll("{C}", color)}</svg>`;
}

export function stickerDataUrl(id: string, color: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvg(id, color))}`;
}
