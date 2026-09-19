import Image from "next/image";
import { cn } from "@/lib/cn";

/** Deux photos de démonstration générées : établissement et personne fictifs. */
export function DemoPhoto({ variant, className }: { variant: "salon" | "practitioner"; className?: string }) {
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden", className)}>
      <Image
        src="/images/demo-thumbnails.webp"
        alt=""
        fill
        sizes="80px"
        className="object-cover"
        style={{ objectPosition: variant === "salon" ? "left center" : "right center" }}
      />
    </span>
  );
}
