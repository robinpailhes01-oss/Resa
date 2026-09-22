import { cn } from "@/lib/cn";

type LogoProps = {
  /** Hauteur en pixels ; le logotype reste lisible à 22 px. */
  height?: number;
  tone?: "brand" | "white" | "black";
  className?: string;
  title?: string;
};

const tones = {
  brand: "text-ink",
  white: "text-white",
  black: "text-black",
};

/**
 * Logo final Reso : symbole violet (feuille dans un carré arrondi) et mot « reso » noir.
 * Composé en SVG pour garantir le rendu quel que soit le chargement des polices.
 */
export function Logo({ height = 28, tone = "brand", className, title = "Reso" }: LogoProps) {
  const width = Math.round(height * (122 / 32));
  const symbol = tone === "white" ? "#ffffff" : "#7557e8";
  const leaf = tone === "white" ? "#e3dcff" : "#5b3fd6";
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 122 32"
      role="img"
      aria-label={title}
      className={cn(tones[tone], className)}
      fill="currentColor"
    >
      <rect x="0" y="3" width="26" height="26" rx="8" fill={symbol} />
      <path d="M2 29C3 16 11 6 26 3V18C26 24.1 21.1 29 15 29Z" fill={leaf} />
      <g transform="translate(37 -3) scale(1.15)">
        {/* r */}
        <path d="M4 26V9.6h4.3v2.9c1-2.1 2.9-3.3 5.4-3.3.6 0 1.1.1 1.6.2v4.3c-.6-.2-1.3-.3-2-.3-3 0-4.9 2-4.9 5.5V26H4z" />
        {/* e */}
        <path d="M25.2 26.4c-5.1 0-8.6-3.5-8.6-8.6 0-5 3.5-8.6 8.4-8.6 5 0 8.2 3.4 8.2 8.4v1.4H20.9c.3 2.5 2 3.9 4.4 3.9 1.9 0 3.2-.8 3.8-2.1h4.2c-.9 3.5-4 5.6-8.1 5.6zm-4.2-10.4h8c-.3-2.1-1.8-3.4-3.9-3.4-2.2 0-3.7 1.3-4.1 3.4z" />
        {/* s */}
        <path d="M42.4 26.4c-4.4 0-7.2-2.1-7.5-5.6h4.2c.2 1.5 1.5 2.3 3.4 2.3 1.7 0 2.8-.7 2.8-1.8 0-1.2-.9-1.6-3.6-2.2-3.9-.8-6.2-1.9-6.2-5 0-3 2.7-4.9 6.6-4.9 4.1 0 6.7 2 7 5.3H45c-.2-1.3-1.3-2.1-3-2.1-1.6 0-2.5.7-2.5 1.7 0 1.1 1 1.4 3.5 2 3.9.8 6.3 1.8 6.3 5.1 0 3.2-2.8 5.2-6.9 5.2z" />
        {/* o */}
        <path d="M60 26.4c-5.1 0-8.7-3.6-8.7-8.6s3.6-8.6 8.7-8.6 8.7 3.6 8.7 8.6-3.6 8.6-8.7 8.6zm0-3.7c2.6 0 4.4-2 4.4-4.9s-1.8-4.9-4.4-4.9-4.4 2-4.4 4.9 1.8 4.9 4.4 4.9z" />
      </g>
    </svg>
  );
}
