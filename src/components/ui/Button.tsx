import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "link";
type Size = "md" | "compact";

/* CTA noirs, accents violets ; cibles tactiles de 44 px minimum. */
const base =
  "btn inline-flex items-center justify-center gap-2 rounded-button font-semibold text-[15px] leading-tight text-center disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none [&_svg]:size-[18px] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-[0_1px_2px_rgba(23,23,27,0.12)] hover:bg-ink-hover hover:shadow-[0_6px_16px_-6px_rgba(23,23,27,0.35)]",
  secondary: "bg-card text-ink border border-line shadow-card hover:border-control/60 hover:shadow-lift",
  ghost: "bg-transparent text-ink hover:bg-ink/5 active:bg-ink/10",
  /** Sur fond sombre : bouton blanc, texte noir. */
  inverse: "bg-white text-ink hover:bg-page",
  /** Lien texte avec chevron. */
  link: "bg-transparent px-0 text-ink underline-offset-4 hover:underline hover:transform-none [&_svg]:size-4",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 py-3",
  compact: "min-h-10 px-4 py-2 text-[14px]",
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
