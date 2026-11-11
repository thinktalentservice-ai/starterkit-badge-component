/**
 * The badge has four orthogonal axes. Nothing else.
 *
 * The app-local badge this replaces had one `variant` list that mixed colour
 * identity (primary … accent-pink) with treatment (`ghost`), and two booleans
 * (`pill`, `uppercase`) for the rest. A list like that grows a row per
 * screenshot, and `ghost` could never be anything but grey. Axes cannot rot
 * that way: adding a tone costs one CSS rule and combines with every fill.
 *
 * tone  → colour identity. Publishes `--ibd-ink`, `--ibd-bg`, `--ibd-border`,
 *         `--ibd-mark`, `--ibd-solid` and `--ibd-on-solid` for the fills to read.
 * fill  → how that identity is applied to the surface.
 * shape → corner geometry. Independent of colour.
 * size  → padding / type scale.
 *
 * The tone vocabulary is deliberately byte-identical to button and card
 * (`@devopsnext/starterkit-button-component`, `…-card-component`): the nine
 * semantic roles of `@devopsnext/starterkit-theme` plus `neutral`.
 */

export const TONES = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
  "accent-green",
  "accent-pink",
  "neutral",
] as const;

export const FILLS = ["soft", "solid", "outline", "ghost"] as const;
export const SHAPES = ["chip", "pill"] as const;
export const SIZES = ["sm", "md", "lg"] as const;

export type BadgeTone = (typeof TONES)[number];
export type BadgeFill = (typeof FILLS)[number];
export type BadgeShape = (typeof SHAPES)[number];
export type BadgeSize = (typeof SIZES)[number];

export interface BadgeAxes {
  tone: BadgeTone;
  fill: BadgeFill;
  shape: BadgeShape;
}

export const DEFAULT_AXES: BadgeAxes = { tone: "neutral", fill: "soft", shape: "chip" };

/**
 * Presets are a convenience alias layer — a named point in axis space, never a
 * source of styling. `variant="danger"` and `tone="danger" fill="soft"` produce
 * byte-identical DOM; the preset only fills in axes the caller left unset.
 *
 * The key set equals the old app-local `variant` list on purpose, so the
 * migration is a rename of the import and not of 32 call sites.
 */
export const PRESETS = {
  primary: { tone: "primary", fill: "soft" },
  secondary: { tone: "secondary", fill: "soft" },
  accent: { tone: "accent", fill: "soft" },
  success: { tone: "success", fill: "soft" },
  warning: { tone: "warning", fill: "soft" },
  danger: { tone: "danger", fill: "soft" },
  info: { tone: "info", fill: "soft" },
  "accent-green": { tone: "accent-green", fill: "soft" },
  "accent-pink": { tone: "accent-pink", fill: "soft" },
  neutral: { tone: "neutral", fill: "soft" },
  ghost: { tone: "neutral", fill: "ghost" },
} as const satisfies Record<string, Partial<BadgeAxes>>;

export type BadgePreset = keyof typeof PRESETS;

// Declared locally rather than pulling in @types/node into the shipped types:
// this is a browser package, and every bundler replaces process.env.NODE_ENV at
// build time. The typeof guard keeps it safe in a runtime with no `process`.
declare const process: { env?: Record<string, string | undefined> } | undefined;

const isDev = () => typeof process !== "undefined" && process?.env?.NODE_ENV !== "production";

const warned = new Set<string>();

const warnOnce = (key: string, message: string) => {
  if (!isDev() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[@devopsnext/starterkit-badge-component] ${message}`);
};

/**
 * Explicit axis props beat the preset, and the preset beats the default —
 * resolved per axis, independently.
 *
 * Unlike button and card, an unknown `tone`, `fill` or `shape` does NOT pass
 * straight through to the DOM. Those two siblings let a typo reach `data-tone`,
 * where it matches no CSS rule and the component silently falls back to grey —
 * a plausible-looking wrong answer a plain-JS caller never sees. This package
 * is consumed from JS (the host app is JSX, with no type checker), so a bad
 * value is coerced to the default and warned about, dev-only, once per value.
 * In production it renders the default; it never renders an unstyled badge.
 */
export function resolveAxes(
  explicit: Partial<BadgeAxes>,
  preset: BadgePreset | undefined,
): BadgeAxes {
  if (preset !== undefined && PRESETS[preset] === undefined) {
    warnOnce(
      `variant:${preset}`,
      `Unknown variant "${preset}" — falling back to tone="${DEFAULT_AXES.tone}" ` +
        `fill="${DEFAULT_AXES.fill}". Valid: ${Object.keys(PRESETS).join(", ")}. ` +
        `Or set tone/fill/shape directly.`,
    );
  }

  const base: Partial<BadgeAxes> = (preset && PRESETS[preset]) || {};

  const pick = <K extends keyof BadgeAxes>(
    axis: K,
    allowed: readonly BadgeAxes[K][],
  ): BadgeAxes[K] => {
    const value = explicit[axis] ?? (base[axis] as BadgeAxes[K] | undefined);
    if (value === undefined) return DEFAULT_AXES[axis];
    if (allowed.includes(value)) return value;
    warnOnce(
      `${axis}:${String(value)}`,
      `Unknown ${axis} "${String(value)}" — falling back to "${DEFAULT_AXES[axis]}". ` +
        `Valid: ${allowed.join(", ")}.`,
    );
    return DEFAULT_AXES[axis];
  };

  return {
    tone: pick("tone", TONES),
    fill: pick("fill", FILLS),
    shape: pick("shape", SHAPES),
  };
}
