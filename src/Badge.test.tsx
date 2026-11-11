import { createRef } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Badge } from "./Badge";
import { DEFAULT_AXES, FILLS, PRESETS, SHAPES, SIZES, TONES, resolveAxes } from "./axes";

/**
 * These tests assert BEHAVIOUR and the DOM contract the CSS selects on — not
 * appearance. Rename `data-fill` here and every rule in styles.css silently
 * stops matching, producing an unstyled chip no type checker would catch.
 */

// import.meta.url is not a file: URL under the jsdom environment, so resolve
// from the package root — `vitest run` always executes there.
const css = readFileSync(resolve(process.cwd(), "styles.css"), "utf8");

const badgeIn = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const attrs = (el: HTMLElement) => ({
  tone: el.getAttribute("data-tone"),
  fill: el.getAttribute("data-fill"),
  shape: el.getAttribute("data-shape"),
  size: el.getAttribute("data-size"),
});

describe("axis resolution", () => {
  it("defaults to neutral / soft / chip / md", () => {
    const { container } = render(<Badge>Draft</Badge>);
    expect(attrs(badgeIn(container))).toEqual({
      tone: "neutral",
      fill: "soft",
      shape: "chip",
      size: "md",
    });
  });

  it("maps every preset onto axes without styling anything itself", () => {
    for (const name of Object.keys(PRESETS) as Array<keyof typeof PRESETS>) {
      const { container, unmount } = render(<Badge variant={name}>{name}</Badge>);
      expect(attrs(badgeIn(container))).toEqual({ ...resolveAxes({}, name), size: "md" });
      unmount();
    }
  });

  it("produces identical DOM for a preset and its explicit equivalent", () => {
    const { container: viaPreset } = render(<Badge variant="danger">A</Badge>);
    const { container: viaAxes } = render(
      <Badge tone="danger" fill="soft">
        A
      </Badge>,
    );
    expect(viaPreset.innerHTML).toBe(viaAxes.innerHTML);
  });

  it("lets an explicit axis override the preset, per axis", () => {
    const { container } = render(
      <Badge variant="danger" fill="solid">
        A
      </Badge>,
    );
    expect(attrs(badgeIn(container))).toMatchObject({ tone: "danger", fill: "solid" });
  });

  it("coerces an unknown axis value to the default instead of leaking it to the DOM", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      // @ts-expect-error — a plain-JS caller can send anything
      <Badge tone="dnager" fill="soild" shape="blob">
        A
      </Badge>,
    );
    expect(attrs(badgeIn(container))).toMatchObject({
      tone: DEFAULT_AXES.tone,
      fill: DEFAULT_AXES.fill,
      shape: DEFAULT_AXES.shape,
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("degrades an unknown variant to the defaults", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error — not a preset
    const { container } = render(<Badge variant="sky">A</Badge>);
    expect(attrs(badgeIn(container))).toMatchObject({ tone: "neutral", fill: "soft" });
    warn.mockRestore();
  });
});

describe("stylesheet contract", () => {
  it("has a rule for every tone, fill, shape and size the types allow", () => {
    for (const tone of TONES) expect(css).toContain(`.ibd-badge[data-tone="${tone}"]`);
    // `soft` is the base rule and intentionally has no selector of its own.
    for (const fill of FILLS.filter((f) => f !== "soft")) {
      expect(css).toContain(`.ibd-badge[data-fill="${fill}"]`);
    }
    for (const shape of SHAPES) expect(css).toContain(`.ibd-badge[data-shape="${shape}"]`);
    for (const size of SIZES) expect(css).toContain(`.ibd-badge[data-size="${size}"]`);
  });

  it("chooses no colour of its own — every colour comes from a theme token", () => {
    const start = css.indexOf("/* @tokens:start");
    const end = css.indexOf("/* @tokens:end */");
    const handWritten = css.slice(0, start) + css.slice(end);
    // Strip comments: they may legitimately say "#fff" while explaining the rule.
    const code = handWritten.replace(/\/\*[\s\S]*?\*\//g, "");
    // No hex, no rgb()/rgba()/hsl()/hwb()/oklch() literal, no named colour that
    // is not a system keyword. `rgb(var(--x) / a)` is also rejected: an alpha
    // typed here is a colour decision the theme should own.
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(code).not.toMatch(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i);
    expect(code).not.toMatch(/:\s*(?:white|black|red|green|blue|gray|grey|transparent\s+\d)\b/i);
  });

  it("reads every colour through a --ibd-t-* alias of a theme token", () => {
    const start = css.indexOf("/* @tokens:start");
    const end = css.indexOf("/* @tokens:end */");
    const code = (css.slice(0, start) + css.slice(end)).replace(/\/\*[\s\S]*?\*\//g, "");
    // Every `var(--x)` a colour property uses must be one of this package's own
    // properties (--ibd-*) — a bare `var(--primary)` would skip the vendored
    // fallback and render nothing when the host has no theme sheet.
    const bare = [...code.matchAll(/var\(\s*(--[\w-]+)/g)]
      .map((m) => m[1] as string)
      .filter((name) => !name.startsWith("--ibd-"));
    expect(bare).toEqual([]);
  });

  it("uses no type smaller than 11px", () => {
    const sizes = [...css.matchAll(/--ibd-fs:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
  });
});

describe("rendering", () => {
  it("renders a span with the base class and merges className", () => {
    const { container } = render(<Badge className="extra">Live</Badge>);
    const el = badgeIn(container);
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("ibd-badge", "extra");
  });

  it("marks the dot and the icon decorative", () => {
    render(
      <Badge dot icon={<svg data-testid="ic" />}>
        Live
      </Badge>,
    );
    expect(document.querySelector(".ibd-badge__dot")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector(".ibd-badge__icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders neither wrapper when dot and icon are absent", () => {
    render(<Badge>Live</Badge>);
    expect(document.querySelector(".ibd-badge__dot")).toBeNull();
    expect(document.querySelector(".ibd-badge__icon")).toBeNull();
  });

  it("is not uppercase by default, and an explicit false is the same as the default", () => {
    const { container: byDefault } = render(<Badge>a</Badge>);
    const { container: explicit } = render(<Badge uppercase={false}>a</Badge>);
    expect(badgeIn(byDefault)).not.toHaveAttribute("data-uppercase");
    expect(explicit.innerHTML).toBe(byDefault.innerHTML);
  });

  it("resets text-transform on the base rule so a host's uppercase cannot leak in", () => {
    // The generated token block also opens with `.ibd-badge {` — start after it.
    const open = css.indexOf("\n.ibd-badge {", css.indexOf("── Base"));
    const base = css.slice(open, css.indexOf("\n}", open));
    expect(open).toBeGreaterThan(-1);
    expect(base).toMatch(/text-transform:\s*none/);
  });

  it("sets data-uppercase only when asked", () => {
    const { container, rerender } = render(<Badge>a</Badge>);
    expect(badgeIn(container)).not.toHaveAttribute("data-uppercase");
    rerender(<Badge uppercase>a</Badge>);
    expect(badgeIn(container)).toHaveAttribute("data-uppercase");
  });

  it("spreads native span attributes and lets the caller's style through", () => {
    render(
      <Badge data-testid="b" title="hint" style={{ marginLeft: 4 }}>
        x
      </Badge>,
    );
    const el = screen.getByTestId("b");
    expect(el).toHaveAttribute("title", "hint");
    expect(el.style.marginLeft).toBe("4px");
  });

  it("forwards its ref to the underlying span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("accessibility", () => {
  it("has no axe violations across the tone × fill matrix", async () => {
    const { container } = render(
      <div>
        {TONES.flatMap((tone) =>
          FILLS.map((fill) => (
            <Badge key={`${tone}-${fill}`} tone={tone} fill={fill} dot>
              {tone} {fill}
            </Badge>
          )),
        )}
      </div>,
    );
    // jsdom computes no real colours, so colour-contrast is a stylesheet
    // concern (verified visually / per brand) and is disabled here.
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
