/* The manager bundle is compiled with the CLASSIC JSX runtime, so `React` has
   to be in scope by name — an unused-looking import that the toolbar button
   crashes without. React itself is a manager global, so this resolves against
   Storybook's own copy rather than pulling a second one into the bundle. */
import React from "react";
import { addons, types, useGlobals } from "storybook/manager-api";
import { ToggleButton } from "storybook/internal/components";

const ADDON_ID = "ibd/scheme-toggle";
const BRAND_ADDON_ID = "ibd/brand-toggle";

/* The two presets starterkit-theme ships (PRESET_IDS), with each one's
   `--primary` seed. The manager is its own bundle and never loads the preview's
   stylesheets, so the swatch colour cannot be read from a token here — these
   are literals, copied from presets/<id>.css, and they are the only place in
   this repo where a brand hex is hand-written. A third preset would be added
   here, in preview.tsx, and in scripts/gen-brands.mjs. */
const BRANDS = [
  { id: "think", label: "Think", seed: "#0099FF" },
  { id: "elemetrik", label: "Elemetrik", seed: "#6832FF" },
] as const;

/* Sun and moon are drawn here rather than imported from @storybook/icons.
   That package ships with Storybook as a TRANSITIVE dependency, so under
   pnpm's strict node_modules layout it is not resolvable from this file —
   importing it would mean adding a direct devDependency to obtain two paths
   the manager already has to download. Inline SVG costs nothing and cannot
   drift out of step with a version bump. */

const Sun = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="7" cy="7" r="2.8" />
    <path d="M7 .8v1.4M7 11.8v1.4M13.2 7h-1.4M2.2 7H.8M11.4 2.6l-1 1M3.6 10.4l-1 1M11.4 11.4l-1-1M3.6 3.6l-1-1" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden fill="currentColor">
    <path d="M12.3 8.6A5.6 5.6 0 0 1 5.4 1.7a5.6 5.6 0 1 0 6.9 6.9Z" />
  </svg>
);

/* A named component rather than an inline `render` body: Storybook mounts the
   tool as a component and hooks work either way, but only this form is one to
   React's own naming rule, and the linter is right to hold the line. */
const SchemeToggle = () => {
  const [globals, updateGlobals] = useGlobals();
  /* Anything that is not the string "dark" is light. Same normalisation the
     preview decorator applies, so a hand-edited `?globals=scheme:nonsense` URL
     cannot leave the button and the canvas disagreeing. */
  const dark = globals.scheme === "dark";

  return (
    <ToggleButton
      pressed={dark}
      ariaLabel={false}
      tooltip={dark ? "Switch to light scheme" : "Switch to dark scheme"}
      onClick={() => updateGlobals({ scheme: dark ? "light" : "dark" })}
    >
      {dark ? <Moon /> : <Sun />}
      <span style={{ marginLeft: 6 }}>{dark ? "Dark" : "Light"}</span>
    </ToggleButton>
  );
};

/* A filled circle rather than a letter or an icon: the whole point of the brand
   axis is the colour, so the control shows the colour. Rendered from the seed
   hex above, not from a token — see the note on BRANDS. */
const Dot = ({ seed }: { seed: string }) => (
  <span
    aria-hidden
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: seed,
      display: "inline-block",
      /* The seeds are saturated enough to vanish against Storybook's own dark
         chrome at this size; a hairline keeps the edge readable in both. */
      boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.25)",
    }}
  />
);

/* Two brands, so this is a toggle rather than a dropdown — same shape as the
   scheme control, and the same reasoning: a menu for a binary choice costs a
   click to tell you what a label already says. It cycles rather than selects,
   which stops reading as "pick one" the moment a third preset ships; that is
   the point at which this should become a WithTooltip/TooltipLinkList. */
const BrandToggle = () => {
  const [globals, updateGlobals] = useGlobals();
  const index = Math.max(
    0,
    BRANDS.findIndex((brand) => brand.id === globals.brand),
  );
  const current = BRANDS[index];
  const next = BRANDS[(index + 1) % BRANDS.length];

  return (
    <ToggleButton
      pressed={current.id !== BRANDS[0].id}
      ariaLabel={false}
      tooltip={`Switch to the ${next.label} brand`}
      onClick={() => updateGlobals({ brand: next.id })}
    >
      <Dot seed={current.seed} />
      <span style={{ marginLeft: 6 }}>{current.label}</span>
    </ToggleButton>
  );
};

addons.register(BRAND_ADDON_ID, () => {
  addons.add(BRAND_ADDON_ID, {
    type: types.TOOL,
    title: "Brand",
    match: ({ tabId, viewMode }) => !tabId && (viewMode === "story" || viewMode === "docs"),
    render: () => <BrandToggle />,
  });
});

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    type: types.TOOL,
    title: "Scheme",
    /* Docs pages render stories too, and the whole point of this component is
       that its surfaces flip — so the toggle has to be reachable from the docs
       view, not just the isolated-story view. */
    match: ({ tabId, viewMode }) => !tabId && (viewMode === "story" || viewMode === "docs"),
    render: () => <SchemeToggle />,
  });
});
