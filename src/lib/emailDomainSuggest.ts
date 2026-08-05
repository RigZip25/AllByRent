/** Popular mailbox domains — used only to catch common typos (e.g. gmal.com → gmail.com). */
const POPULAR_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "seznam.cz",
  "email.cz",
  "centrum.cz",
  "volny.cz",
  "msn.com",
] as const;

const EXACT_TYPOS: Record<string, string> = {
  "gmal.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.om": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "iclod.com": "icloud.com",
  "icoud.com": "icloud.com",
  "seznan.cz": "seznam.cz",
  "sezna.cz": "seznam.cz",
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

/**
 * If the domain looks like a common typo of a popular provider, return the corrected email.
 * Returns null when the address is empty, invalid-shaped, or already a known popular domain.
 */
export function suggestCorrectedEmail(rawEmail: string): string | null {
  const email = rawEmail.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || !domain.includes(".")) return null;

  const exact = EXACT_TYPOS[domain];
  if (exact) return `${local}@${exact}`;

  if ((POPULAR_DOMAINS as readonly string[]).includes(domain)) return null;

  let best: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const candidate of POPULAR_DOMAINS) {
    const dist = levenshtein(domain, candidate);
    const maxAllowed = candidate.length <= 8 ? 1 : 2;
    if (dist > 0 && dist <= maxAllowed && dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }

  return best ? `${local}@${best}` : null;
}
