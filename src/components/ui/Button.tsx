import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "link";
type Size = "md" | "compact";

/* CTA noirs, accents violets ; cibles tactiles de 44 px minimum. */
const base =
  "btn inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-[16px] leading-tight text-center disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-[18px] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-[0_5px_12px_-6px_rgba(17,17,22,0.5)] hover:bg-[#2a2933] active:bg-[#2a2933]",
  secondary: "bg-card/60 text-ink ring-1 ring-line hover:bg-soft-tint active:bg-soft-tint",
  ghost: "bg-transparent text-brand hover:bg-brand/5 active:bg-brand/10",
  /** Sur fond coloré : bouton blanc, texte violet. */
  inverse: "bg-white text-brand hover:bg-page active:bg-page",
  /** Lien texte avec chevron, à la manière d'Apple. */
  link: "bg-transparent px-0 text-brand underline-offset-4 hover:underline [&_svg]:size-4",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 py-3",
  compact: "min-h-11 px-4 py-2 text-[13px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", fullWidth, className, children, ...rest } = props;
  const sizeClass = variant === "link" ? "min-h-11 py-2" : sizes[size];
  const classes = cn(base, variants[variant], sizeClass, fullWidth && "w-full", className);

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} className={classes} rel="noopener" {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
