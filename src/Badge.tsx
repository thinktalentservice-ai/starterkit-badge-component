import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes, ReactNode } from "react";
import { resolveAxes } from "./axes";
import type { BadgeFill, BadgePreset, BadgeShape, BadgeSize, BadgeTone } from "./axes";

interface BadgeOwnProps {
  /** Colour identity. Default `neutral`. */
  tone?: BadgeTone;
  /** How the identity is applied. Default `soft`. */
  fill?: BadgeFill;
  /** Corner geometry. Default `chip`. */
  shape?: BadgeShape;
  /** Type scale and padding. Default `md`. */
  size?: BadgeSize;
  /**
   * A named point in axis space — `variant="danger"` is `tone="danger"
   * fill="soft"`. An explicit axis prop beats it.
   */
  variant?: BadgePreset;
  /**
   * A status dot before the label, in the tone's mark colour. Decorative
   * (`aria-hidden`): colour alone must never carry the meaning, so the label
   * has to say it in words.
   */
  dot?: boolean;
  /** Leading icon. Decorative (`aria-hidden`) — the label carries the meaning. */
  icon?: ReactNode;
  /** UPPERCASE with wide tracking. Default `false`. */
  uppercase?: boolean;
  children?: ReactNode;
}

export type BadgeProps = BadgeOwnProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeOwnProps>;

const cx = (...parts: Array<string | undefined | false>): string => parts.filter(Boolean).join(" ");

function BadgeImpl(props: BadgeProps, ref: ForwardedRef<HTMLSpanElement>) {
  const {
    tone,
    fill,
    shape,
    size = "md",
    variant,
    dot = false,
    icon,
    uppercase = false,
    children,
    className,
    ...rest
  } = props;

  const axes = resolveAxes({ tone, fill, shape }, variant);

  return (
    <span
      ref={ref}
      {...rest}
      className={cx("ibd-badge", className)}
      data-tone={axes.tone}
      data-fill={axes.fill}
      data-shape={axes.shape}
      data-size={size}
      {...(uppercase ? { "data-uppercase": "" } : {})}
    >
      {dot && <span className="ibd-badge__dot" aria-hidden="true" />}
      {icon != null && icon !== false && (
        <span className="ibd-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

/**
 * Ref forwarding is required, not decorative: MUI Tooltip/Popper and
 * scroll-into-view all reach for the underlying node. A badge that swallows its
 * ref silently breaks every one of them.
 */
export const Badge = forwardRef(BadgeImpl);
Badge.displayName = "Badge";
