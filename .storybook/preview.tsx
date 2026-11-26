import { useLayoutEffect } from "react";
import type { Preview } from "@storybook/react-vite";
// The two brand presets, each scoped to [data-brand="<id>"] so both can be
// loaded at once — see scripts/gen-brands.mjs for why that rewrite is needed.
// Workshop-only: the published package still depends on no brand at all.
import "./brands.generated.css";
import "../styles.css";
import "./preview.css";

/** The roster from starterkit-theme's PRESET_IDS. Anything else is not a brand. */
const BRANDS = ["think", "elemetrik"] as const;
type Brand = (typeof BRANDS)[number];

/** Same posture as the scheme normalisation below: an unknown value is the default,
 *  never a broken render, so a hand-edited `?globals=brand:nonsense` URL is harmless. */
const asBrand = (value: unknown): Brand =>
  BRANDS.includes(value as Brand) ? (value as Brand) : "think";

const preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ["Components", ["Badge"]],
      },
    },
  },
  tags: ["autodocs"],
  // Declared without a `toolbar` block on purpose: the control for this global
  // is the one-click button registered in `.storybook/manager.tsx`. A dropdown
  // AND a button for a two-value axis is two ways to say the same thing, and
  // the one that disagrees with the canvas is the one nobody notices. The
  // global itself stays declared so `?globals=scheme:dark` keeps working as a
  // shareable link.
  globalTypes: {
    scheme: {
      description: "Colour scheme the badges render against",
    },
    brand: {
      description: "Which starterkit-theme preset supplies the tokens",
    },
  },
  // Light, matching the sibling component workshops — a reader moving between
  // the sibling docs and this one should not be handed a different-looking site.
  // The vendored token defaults are dark-first, so Dark is the other half of the
  // toolbar rather than an afterthought; only the workshop's resting state is
  // light.
  //
  // `think` is starterkit-theme's own DEFAULT_PRESET_ID, and it is also what
  // the vendored defaults in styles.css already are — so the workshop's resting
  // state is the one state where the brand sheet changes nothing. Elemetrik is
  // the setting that proves the tokens are actually flowing.
  initialGlobals: { scheme: "light", brand: "think" },
  decorators: [
    // Both attributes are set on purpose: `data-mui-color-scheme` is what the
    // Obsidian sheet itself keys off, `data-theme` is this library's alias for
    // hosts not running MUI — setting both exercises the pair that ships.
    //
    // They also go on <html>, and that placement is load-bearing rather than
    // belt-and-braces. styles.css carries a `prefers-color-scheme: light`
    // fallback guarded by `:root:not([data-mui-color-scheme]):not([data-theme])`
    // for hosts that declare no scheme at all. With the attributes only on this
    // wrapper div, <html> still has neither — so on a machine whose OS
    // preference is light, that block would match and paint light tokens onto
    // every .ibd-badge in DARK mode. Writing them to the root makes the guard fail,
    // which is the whole point of the guard.
    //
    // `data-scheme` is separate and workshop-only: preview.css keys the canvas
    // and the docs-block background off it.
    // `data-brand` rides along on the same two elements for the same reason,
    // with one extra constraint: brands.generated.css scopes each preset's
    // light block as `[data-brand="x"][data-mui-color-scheme="light"]` — a
    // COMPOUND selector, both attributes on ONE element. <html> carries both,
    // so it matches. The wrapper div carries both, so it matches too. Splitting
    // them across the two would silently serve dark brand tokens in light mode.
    (Story, context) => {
      const scheme = context.globals.scheme === "dark" ? "dark" : "light";
      const brand = asBrand(context.globals.brand);

      useLayoutEffect(() => {
        const root = document.documentElement;
        root.dataset.scheme = scheme;
        root.dataset.theme = scheme;
        root.dataset.muiColorScheme = scheme;
        root.dataset.brand = brand;
      }, [scheme, brand]);

      // `key` forces a remount when the brand changes, and it is a fix rather
      // than a precaution. Switching brand rewrites tokens that are INHERITED
      // from <html>; Chromium recomputes the custom property but does not
      // always re-run the `color` transition that depends on it, so a solid
      // button can keep the previous brand's label ink indefinitely while its
      // gradient updates. Measured: after switching Think -> Elemetrik,
      // --ibd-on-solid reads #fff while getComputedStyle(...).color still reads
      // rgb(11,15,25); a freshly cloned copy of the very same element in the
      // very same document computes #fff. New elements are correct, stale ones
      // are not — so remount them.
      //
      // Scheme is deliberately NOT in the key: it flips whole rule blocks
      // rather than only inherited values, it does not exhibit the stall, and
      // keeping it un-keyed preserves the light/dark cross-fade.
      return (
        <div key={brand} data-mui-color-scheme={scheme} data-theme={scheme} data-brand={brand}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Preview;

export default preview;
