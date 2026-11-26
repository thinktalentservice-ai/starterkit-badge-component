import { useEffect, useRef, useState } from "react";
import { Badge } from "../Badge";
import type { BadgeFill, BadgePreset, BadgeShape, BadgeSize, BadgeTone } from "../axes";
import "./CodeSwatch.css";

/**
 * Storybook's "Show code" panel shows the SOURCE OF THE STORY, so a matrix
 * story documents the loop, not the badge. A Swatch prints each badge's own JSX
 * underneath it, derived from the very props that are spread onto `Badge`.
 *
 * Story-only scaffolding: tsup builds from `src/index.ts`, so nothing here
 * reaches consumers.
 */

export interface SwatchProps {
  variant?: BadgePreset;
  tone?: BadgeTone;
  fill?: BadgeFill;
  shape?: BadgeShape;
  size?: BadgeSize;
  dot?: boolean;
  uppercase?: boolean;
  /** Restricted to a string so the printed snippet is always the literal JSX. */
  children: string;
}

// Fixed print order: same axes, byte-identical snippet.
const STRING_PROPS = ["variant", "tone", "fill", "shape", "size"] as const;
const BOOLEAN_PROPS = ["dot", "uppercase"] as const;

export function formatBadgeSnippet(props: SwatchProps): string {
  const parts: string[] = [];

  for (const key of STRING_PROPS) {
    const value = props[key];
    if (value !== undefined) parts.push(`${key}="${value}"`);
  }
  for (const key of BOOLEAN_PROPS) {
    if (props[key]) parts.push(key);
  }

  const attrs = parts.length > 0 ? ` ${parts.join(" ")}` : "";
  return `<Badge${attrs}>${props.children}</Badge>`;
}

/** Non-secure contexts (plain-http Storybook on a LAN host) have no async clipboard. */
function copyFallback(text: string): void {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

/** One badge plus the exact JSX that produced it. Click the code to copy it. */
export function Swatch(props: SwatchProps) {
  const code = formatBadgeSnippet(props);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Without this, unmounting a swatch mid-flash (docs re-render on every args
  // change) leaves a timeout writing state into a dead component.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      copyFallback(code);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1200);
  };

  const { children, ...rest } = props;

  return (
    <article className="ibd-specimen">
      <div className="ibd-specimen__stage">
        <Badge {...rest}>{children}</Badge>
      </div>
      <button
        type="button"
        onClick={copy}
        className="ibd-specimen__code"
        data-copied={copied || undefined}
        aria-label={`Copy code: ${code}`}
      >
        <span className="ibd-specimen__code-meta" aria-hidden="true">
          <span>JSX</span>
          <span className="ibd-specimen__copy-state">
            {copied ? (
              <>
                <CheckIcon />
                Copied
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </span>
        </span>
        <code>{code}</code>
        <span className="ibd-visually-hidden" aria-live="polite">
          {copied ? "Code copied to clipboard" : ""}
        </span>
      </button>
    </article>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5.25" y="5.25" width="7.5" height="7.5" rx="1.5" />
      <path d="M10.75 5.25V4A1.75 1.75 0 0 0 9 2.25H4A1.75 1.75 0 0 0 2.25 4v5A1.75 1.75 0 0 0 4 10.75h1.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.25 3.1 3.1L13 4.65" />
    </svg>
  );
}
