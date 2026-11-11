# @devopsnext/starterkit-badge-component

Obsidian design-system **Badge** — a status / label pill. Token-driven, styled entirely in CSS,
zero runtime dependencies, React as a peer.

```bash
pnpm add @devopsnext/starterkit-badge-component@<exact-version>   # pin exact, never a caret
```

```jsx
// once, at the app root
import "@devopsnext/starterkit-badge-component/styles.css";

import { Badge } from "@devopsnext/starterkit-badge-component";

<Badge tone="success" dot>Deployed</Badge>
<Badge variant="danger" uppercase>Failed</Badge>
<Badge tone="primary" fill="solid" shape="chip" size="sm">New</Badge>
```

## Axes

| Axis    | Values                                                                                                | Default   |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- |
| `tone`  | `primary` `secondary` `accent` `success` `warning` `danger` `info` `accent-green` `accent-pink` `neutral` | `neutral` |
| `fill`  | `soft` `solid` `outline` `ghost`                                                                      | `soft`    |
| `shape` | `chip` `pill`                                                                                         | `chip`    |
| `size`  | `sm` `md` `lg`                                                                                        | `md`      |

`variant` is a preset alias for a point in axis space — `variant="danger"` is
`tone="danger" fill="soft"` — and an explicit axis prop beats it. Presets: the nine roles,
`neutral`, and `ghost` (`neutral` + `ghost` fill).

Other props: `dot`, `icon`, `uppercase` (default `false`), `className`, `style`, `ref`, and any
native `<span>` attribute.

An **unknown** `tone` / `fill` / `shape` / `variant` is coerced to the default and warned about
(dev only, once per value). Unlike the button and card packages it is never passed through to
`data-*`, where it would match no CSS rule and render a plausible-looking wrong colour.

## Rules this package keeps

- **Colour is never the only signal.** `dot` and `icon` are `aria-hidden`; the label must say the
  state in words.
- **No type below 11px.** The app-local badge this replaces shipped a 9px `sm`.
- **The label uses the family `-text` token (4.5:1), never the bare `--<role>` mark token (3:1).**
  Marks (the dot, the outline border) use the bare token.
- **Ink on a solid fill is the measured `--<role>-on-solid`**, never a literal `#fff`.
- **Do not restyle `.ibd-*` or select on its `data-*` attributes from app CSS.** Override a token.

## Tokens — this package chooses no colour

`@devopsnext/starterkit-theme` is a **devDependency** and the only colour source. No hex, no
`rgb()`, no typed alpha appears in the hand-written CSS (a test enforces it); every colour is a
theme role token — `--<role>-text`, `-bg`, `-border`, `-solid`, `-on-solid`, plus `--fg1`, `--fg2`,
`--fg-muted`, `--border`, `--btn-ghost-bg`, `--surface` for `neutral`.

Each one is aliased once on `.ibd-badge` as `--ibd-t-x: var(--x, <vendored default>)`. The host's
sheet wins wherever it defines the token; `styles.css` declares nothing on `:root`. The vendored
defaults are **generated** from the installed theme's `presets/think.css` by `pnpm sync:tokens`
(never typed), and `pnpm sync:tokens:check` fails on drift. A token a rule consumes that the theme
does not define is a hard failure, not a silent default.

Import the theme's preset sheet once in the host, before this one:

```jsx
import "@devopsnext/starterkit-theme/presets/think.css";
import "@devopsnext/starterkit-badge-component/styles.css";
```

The prefix is `ibd-` / `--ibd-`, not `ib-` — `ib-` is the button's, and a badge is routinely
placed inside a button.

## Scope

A badge is a **label**: status, role, tag, category. It is deliberately **not** the count / dot
overlay anchored to an icon (the MUI `<Badge>` meaning), not a dismissible chip, and not
interactive. Domain compositions such as `StatusBadge` and `RoleBadge` belong in the host app.

## Develop

```bash
pnpm verify          # sync:tokens:check, typecheck, test, build
```

The theme is installed from a packed tarball (`file:../starterkit-theme/…-1.5.0.tgz`) until it is
published; repin to the exact registry version then. Consume this package the same way — a packed
tarball, never `link:` — a link yields two Reacts.
