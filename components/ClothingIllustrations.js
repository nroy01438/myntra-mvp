/**
 * Flat vector clothing illustrations — hand-authored SVG, not photography
 * and not a stock-photo API (the two prior approaches; see
 * ProductThumb.js). No image-generation tool is available in this
 * environment, so these stand in for "AI-generated illustration": simple,
 * two-tone garment silhouettes that fill the card frame the way a real
 * product photo would, rather than a small centered glyph.
 */

export function DressIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M38 14 L44 26 L38 30 L34 20 Z" fill="currentColor" opacity="0.9" />
      <path d="M62 14 L56 26 L62 30 L66 20 Z" fill="currentColor" opacity="0.9" />
      <path
        d="M38 20 C38 20 34 26 34 32 L28 88 C28 91 31 93 34 93 L66 93 C69 93 72 91 72 88 L66 32 C66 26 62 20 62 20 C58 26 42 26 38 20 Z"
        fill="currentColor"
      />
      <path d="M40 34 L45 90 M60 34 L55 90" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
      <path d="M38 20 C42 26 58 26 62 20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </svg>
  );
}

export function EthnicWearIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 16 C44 16 40 20 40 24 L40 30 L30 40 L34 46 L40 40 L40 90 L60 90 L60 40 L66 46 L70 40 L60 30 L60 24 C60 20 56 16 50 16 Z" fill="currentColor" />
      <circle cx="50" cy="24" r="4" fill="rgba(255,255,255,0.55)" />
      <path d="M40 55 L60 55 M40 68 L60 68 M40 81 L60 81" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path d="M40 40 L60 40" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
    </svg>
  );
}

export function ShirtIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M40 18 L30 26 L22 34 L28 42 L36 36 L36 88 L64 88 L64 36 L72 42 L78 34 L70 26 L60 18 L54 24 L46 24 Z"
        fill="currentColor"
      />
      <path d="M46 24 L50 30 L54 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <line x1="50" y1="34" x2="50" y2="86" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      <circle cx="50" cy="46" r="1.6" fill="rgba(255,255,255,0.7)" />
      <circle cx="50" cy="58" r="1.6" fill="rgba(255,255,255,0.7)" />
      <circle cx="50" cy="70" r="1.6" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}

export function JeansIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M32 16 L68 16 L70 40 L74 90 L58 90 L52 46 L48 46 L42 90 L26 90 L30 40 Z"
        fill="currentColor"
      />
      <rect x="32" y="16" width="36" height="7" rx="1.5" fill="rgba(255,255,255,0.35)" />
      <line x1="50" y1="23" x2="50" y2="46" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="38" y1="30" x2="35" y2="88" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      <line x1="62" y1="30" x2="65" y2="88" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
    </svg>
  );
}

export function FootwearIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M18 66 C18 60 24 56 30 54 L46 48 C50 46 54 44 58 40 L66 32 C70 36 76 40 82 42 L82 60 C82 66 76 70 68 70 L24 70 C20 70 18 68 18 66 Z"
        fill="currentColor"
      />
      <path d="M18 66 L82 66 L82 72 C82 76 78 78 74 78 L26 78 C20 78 16 74 16 70 Z" fill="currentColor" opacity="0.65" />
      <path d="M46 48 L54 58 M58 40 L64 52" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="70" cy="50" r="1.6" fill="rgba(255,255,255,0.8)" />
      <circle cx="75" cy="55" r="1.6" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

export function BagIllustration({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M38 30 C38 20 44 14 50 14 C56 14 62 20 62 30" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="26" y="30" width="48" height="54" rx="6" fill="currentColor" />
      <line x1="26" y1="46" x2="74" y2="46" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    </svg>
  );
}

export const CATEGORY_ILLUSTRATIONS = {
  dresses: DressIllustration,
  ethnic_wear: EthnicWearIllustration,
  shirts: ShirtIllustration,
  jeans: JeansIllustration,
  footwear: FootwearIllustration,
};
