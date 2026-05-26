type Props = {
  slug: string;
  className?: string;
  title?: string;
};

const ICONS: Record<string, React.ReactNode> = {
  // Lounge-chair silhouette
  "frames-structural": (
    <>
      <path d="M18 70 L18 38 Q18 28 28 28 L60 28 Q70 28 70 38 L70 56 L82 56 L82 78 L70 78 L70 70 Z" />
      <path d="M18 70 L70 70" />
      <path d="M22 78 L22 88 M66 78 L66 88" />
      <path d="M30 28 L30 56 L70 56" />
    </>
  ),

  // Swivel caster: wheel + top plate
  "casters-glides": (
    <>
      <rect x="16" y="14" width="64" height="8" rx="1" />
      <circle cx="22" cy="18" r="1.5" />
      <circle cx="74" cy="18" r="1.5" />
      <path d="M30 22 L30 36 Q30 44 38 44 L58 44 Q66 44 66 36 L66 22" />
      <circle cx="48" cy="62" r="20" />
      <circle cx="48" cy="62" r="14" />
      <circle cx="48" cy="62" r="3" fill="currentColor" />
      <path d="M40 44 L40 50 M56 44 L56 50" />
    </>
  ),

  // Drawer slide rails, side view
  "slides-hinges": (
    <>
      <rect x="10" y="30" width="78" height="10" />
      <rect x="14" y="32" width="74" height="6" />
      <rect x="6" y="46" width="82" height="10" />
      <rect x="10" y="48" width="78" height="6" />
      <circle cx="22" cy="35" r="1.5" fill="currentColor" />
      <circle cx="48" cy="35" r="1.5" fill="currentColor" />
      <circle cx="74" cy="35" r="1.5" fill="currentColor" />
      <circle cx="18" cy="51" r="1.5" fill="currentColor" />
      <circle cx="44" cy="51" r="1.5" fill="currentColor" />
      <circle cx="70" cy="51" r="1.5" fill="currentColor" />
      <path d="M48 64 L48 78 M40 78 L56 78 M44 82 L52 82" />
    </>
  ),

  // Screw + cam lock
  "brackets-fasteners": (
    <>
      <circle cx="30" cy="34" r="14" />
      <path d="M30 20 L30 48 M16 34 L44 34 M20 24 L40 44 M40 24 L20 44" />
      <path d="M58 18 L74 18 L74 26 L70 26 L70 78 L62 78 L62 26 L58 26 Z" />
      <path d="M62 32 L70 32 M62 40 L70 40 M62 48 L70 48 M62 56 L70 56 M62 64 L70 64" />
    </>
  ),

  // Fabric swatch with weave
  "upholstery-fabric": (
    <>
      <rect x="14" y="16" width="68" height="64" />
      <path d="M14 26 L82 26 M14 36 L82 36 M14 46 L82 46 M14 56 L82 56 M14 66 L82 66" />
      <path d="M22 16 L22 80 M30 16 L30 80 M38 16 L38 80 M46 16 L46 80 M54 16 L54 80 M62 16 L62 80 M70 16 L70 80 M78 16 L78 80" />
      <path d="M82 16 L92 12 M82 80 L92 84" strokeDasharray="2 2" />
    </>
  ),

  // Foam block with hatched cross-section
  "foam-cushioning": (
    <>
      <path d="M14 28 L62 28 L82 16 L82 60 L62 72 L14 72 Z" />
      <path d="M62 28 L62 72 M14 28 L14 72 L62 72" />
      <path d="M14 36 L62 36 M14 44 L62 44 M14 52 L62 52 M14 60 L62 60" strokeOpacity="0.4" />
      <circle cx="24" cy="40" r="1" fill="currentColor" />
      <circle cx="40" cy="44" r="1" fill="currentColor" />
      <circle cx="50" cy="58" r="1" fill="currentColor" />
      <circle cx="30" cy="60" r="1" fill="currentColor" />
      <circle cx="44" cy="36" r="1" fill="currentColor" />
    </>
  ),

  // Stacked panels (side view)
  panels: (
    <>
      <rect x="10" y="24" width="76" height="8" />
      <rect x="10" y="38" width="76" height="6" />
      <rect x="10" y="50" width="76" height="10" />
      <rect x="10" y="66" width="76" height="4" />
      <path d="M86 32 L92 32 M86 44 L92 44 M86 60 L92 60 M86 70 L92 70" strokeOpacity="0.6" />
      <text x="95" y="34" fontSize="6" fill="currentColor" stroke="none">3/4"</text>
      <text x="95" y="46" fontSize="6" fill="currentColor" stroke="none">1/2"</text>
      <text x="95" y="62" fontSize="6" fill="currentColor" stroke="none">1"</text>
    </>
  ),

  // Roll of edge banding
  "edge-trim": (
    <>
      <ellipse cx="40" cy="48" rx="28" ry="28" />
      <ellipse cx="40" cy="48" rx="20" ry="20" />
      <ellipse cx="40" cy="48" rx="12" ry="12" />
      <ellipse cx="40" cy="48" rx="4" ry="4" fill="currentColor" />
      <path d="M68 48 L88 48 L88 54 L68 54" />
      <path d="M76 48 L76 54 M82 48 L82 54" strokeOpacity="0.5" />
    </>
  ),

  // Paint can with brush
  finishes: (
    <>
      <path d="M22 30 L62 30 L62 80 L22 80 Z" />
      <ellipse cx="42" cy="30" rx="20" ry="4" />
      <path d="M28 38 L56 38" strokeOpacity="0.6" />
      <path d="M22 26 Q42 22 62 26" />
      <path d="M70 14 L78 14 L78 46 L70 46 Z" />
      <path d="M68 46 L80 46 L78 56 L70 56 Z" />
      <path d="M70 20 L78 20 M70 26 L78 26" strokeOpacity="0.4" />
    </>
  ),

  // Tapered table leg
  "legs-bases": (
    <>
      <path d="M30 14 L66 14 L66 22 L30 22 Z" />
      <path d="M34 22 L42 78 L54 78 L62 22" />
      <path d="M40 78 L40 86 L56 86 L56 78" />
      <path d="M40 30 L56 32 M40 44 L56 46 M40 58 L56 60" strokeOpacity="0.4" />
    </>
  ),

  // Bar pull
  "knobs-pulls": (
    <>
      <path d="M14 50 L82 50" strokeWidth="6" strokeLinecap="round" />
      <path d="M24 50 L24 64 L20 64 L20 70 L28 70 L28 64 L24 64" />
      <path d="M72 50 L72 64 L68 64 L68 70 L76 70 L76 64 L72 64" />
      <path d="M14 78 L82 78" strokeDasharray="2 2" strokeOpacity="0.4" />
      <text x="42" y="90" fontSize="7" fill="currentColor" stroke="none">128mm</text>
    </>
  ),

  // Cardboard carton
  packaging: (
    <>
      <path d="M16 30 L48 18 L80 30 L80 74 L48 86 L16 74 Z" />
      <path d="M16 30 L48 42 L80 30 M48 42 L48 86" />
      <path d="M32 24 L32 60 M64 24 L64 60" strokeOpacity="0.4" />
      <path d="M30 50 L46 46 L46 52 L30 56 Z" fill="currentColor" fillOpacity="0.08" />
      <text x="33" y="52" fontSize="4" fill="currentColor" stroke="none">FRAGILE</text>
    </>
  ),
};

const DEFAULT_ICON = (
  <>
    <rect x="14" y="14" width="68" height="68" />
    <path d="M14 14 L82 82 M82 14 L14 82" strokeOpacity="0.3" />
  </>
);

export function CategoryIcon({ slug, className, title }: Props) {
  const content = ICONS[slug] ?? DEFAULT_ICON;
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinejoin="round"
      role="img"
      aria-label={title ?? slug}
    >
      {content}
    </svg>
  );
}
