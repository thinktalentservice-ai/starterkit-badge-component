import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, FILLS, PRESETS, SHAPES, SIZES, TONES } from "./index";
import type { BadgePreset } from "./index";
import { Swatch } from "./stories/CodeSwatch";
import "./Badge.stories.css";

const presets = Object.keys(PRESETS) as BadgePreset[];

/* The two presets @devopsnext/starterkit-theme ships (its PRESET_IDS). Declared
   here rather than imported: .storybook/ is outside this project's tsconfig
   `include`. The ids must match the [data-brand="..."] scopes in
   brands.generated.css. */
const brands = [
  { id: "think", label: "Think" },
  { id: "elemetrik", label: "Elemetrik" },
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="ibd-story-section">
      <div className="ibd-story-section__header">
        <div>
          <h3 className="ibd-story-section__title">{title}</h3>
          {description ? <p className="ibd-story-section__description">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function StoryFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="ibd-story">
      <header className="ibd-story__hero">
        <div>
          <p className="ibd-story__eyebrow">IB / component specimen</p>
          <h2 className="ibd-story__title">{title}</h2>
          <p className="ibd-story__lede">{description}</p>
        </div>
        <div className="ibd-story__axes" aria-label="Badge design axes">
          <span>tone</span>
          <span>fill</span>
          <span>shape</span>
          <span>size</span>
        </div>
      </header>
      <div className="ibd-story__body">{children}</div>
    </main>
  );
}

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A token-driven status / label pill with independent tone, fill, shape, and size axes. " +
          "Explicit axis props override named presets.\n\n" +
          "Every badge below prints its own JSX underneath it — click the code to copy it.",
      },
    },
  },
  args: {
    children: "Deployed",
    size: "md",
    dot: false,
    uppercase: false,
  },
  argTypes: {
    // `table.type` is spelled out: docgen renders these unions as `unknown[number]`.
    tone: {
      control: "select",
      options: [...TONES],
      description: "Colour identity.",
      table: { type: { summary: TONES.join(" | ") } },
    },
    fill: {
      control: "select",
      options: [...FILLS],
      description: "How the tone is applied to the surface.",
      table: { type: { summary: FILLS.join(" | ") } },
    },
    shape: {
      control: "inline-radio",
      options: [...SHAPES],
      description: "Corner geometry.",
      table: { type: { summary: SHAPES.join(" | ") } },
    },
    size: {
      control: "inline-radio",
      options: [...SIZES],
      description: "Type scale and padding.",
      table: { type: { summary: SIZES.join(" | ") } },
    },
    variant: {
      control: "select",
      options: [undefined, ...presets],
      description: "Named preset. Explicit axis props take precedence.",
    },
    icon: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: ({ children, variant, tone, fill, shape, size, dot, uppercase }) => (
    <StoryFrame
      title="Badge workbench"
      description="Tune the axes in Controls. The specimen and its paste-ready JSX update together."
    >
      <Section title="Live specimen" description="Click the dark code panel to copy this exact setup.">
        <div className="ibd-story-grid">
          <Swatch
            variant={variant}
            tone={tone}
            fill={fill}
            shape={shape}
            size={size}
            dot={dot}
            uppercase={uppercase}
          >
            {typeof children === "string" ? children : "Deployed"}
          </Swatch>
        </div>
      </Section>
    </StoryFrame>
  ),
};

export const Presets: Story = {
  render: () => (
    <StoryFrame
      title="Preset index"
      description="Named shortcuts for common points in the same axis system, never a separate styling API."
    >
      <Section title="Named presets">
        <div className="ibd-story-grid">
          {presets.map((variant) => (
            <Swatch key={variant} variant={variant}>
              {variant}
            </Swatch>
          ))}
        </div>
      </Section>
    </StoryFrame>
  ),
};

export const AxisMatrix: Story = {
  render: () => (
    <StoryFrame
      title="Tone × fill atlas"
      description="Scan the full visual system by surface treatment. Each specimen exposes the exact JSX responsible for it."
    >
      {FILLS.map((fill) => (
        <Section key={fill} title={fill}>
          <div className="ibd-story-grid">
            {TONES.map((tone) => (
              <Swatch key={tone} tone={tone} fill={fill}>
                {tone}
              </Swatch>
            ))}
          </div>
        </Section>
      ))}
    </StoryFrame>
  ),
};

export const SizesAndShapes: Story = {
  render: () => (
    <StoryFrame
      title="Geometry scale"
      description="Compare size and silhouette without changing the badge's colour identity."
    >
      {SHAPES.map((shape) => (
        <Section key={shape} title={shape}>
          <div className="ibd-story-grid">
            {SIZES.map((size) => (
              <Swatch key={size} shape={shape} size={size} tone="primary">
                {size}
              </Swatch>
            ))}
          </div>
        </Section>
      ))}
    </StoryFrame>
  ),
};

const Check = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 8.25 3.1 3.1L13 4.65" />
  </svg>
);

export const DotsIconsAndCase: Story = {
  render: () => (
    <StoryFrame
      title="Modifiers"
      description="Dot and icon are decorative (aria-hidden): the label must say the state in words."
    >
      <Section title="Status dot">
        <div className="ibd-story-grid">
          <Swatch tone="success" dot>
            Deployed
          </Swatch>
          <Swatch tone="warning" shape="pill" dot>
            Degraded
          </Swatch>
          <Swatch tone="danger" fill="solid" dot>
            Failed
          </Swatch>
        </div>
      </Section>
      <Section title="Uppercase">
        <div className="ibd-story-grid">
          <Swatch tone="info" uppercase>
            In review
          </Swatch>
          <Swatch tone="neutral" fill="outline" uppercase>
            Draft
          </Swatch>
        </div>
      </Section>
      <Section title="Leading icon" description="Pass any node as icon.">
        <div>
          <Badge tone="success" icon={<Check />}>
            Verified
          </Badge>
        </div>
      </Section>
    </StoryFrame>
  ),
};

export const BrandComparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Both brand presets at once, at whichever scheme the toolbar is set to. " +
          "The Brand toggle switches the rest of the workshop; this story is the one " +
          "place you can see the delta without flipping back and forth.",
      },
    },
  },
  /* Plain <Badge> rather than <Swatch>: the JSX is identical across both
     columns, and the whole difference lives in the wrapper's data-brand. */
  render: (_args, { globals }) => {
    const scheme = globals.scheme === "dark" ? "dark" : "light";

    return (
      <StoryFrame
        title="Brand comparison"
        description="The same badges under both starterkit-theme presets, side by side at the current scheme."
      >
        <Section title={`Think vs Elemetrik — ${scheme} scheme`}>
          <div className="ibd-story-brands">
            {brands.map(({ id, label }) => (
              /* All attributes on THIS element, not split with an ancestor:
                 brands.generated.css scopes each preset's light block as
                 [data-brand="x"][data-mui-color-scheme="light"], a compound
                 selector. */
              <div
                key={id}
                className="ibd-story-brand"
                data-brand={id}
                data-mui-color-scheme={scheme}
                data-theme={scheme}
              >
                <p className="ibd-story-brand__label">
                  <span className="ibd-story-brand__dot" />
                  {label}
                </p>
                {FILLS.map((fill) => (
                  <div key={fill} className="ibd-story-brand__row">
                    <span className="ibd-story-brand__fill">{fill}</span>
                    <div className="ibd-story-grid">
                      {TONES.map((tone) => (
                        <div key={tone}>
                          <Badge tone={tone} fill={fill} dot>
                            {tone}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      </StoryFrame>
    );
  },
};
