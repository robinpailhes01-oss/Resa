import { cn } from "@/lib/cn";

/**
 * Découpe un texte en mots qui sortent d'un léger flou, l'un après l'autre
 * (entrée de titre à la manière d'Apple). CSS uniquement : sans JavaScript ou
 * en mouvement réduit, le texte est affiché tel quel.
 */
export function BlurWords({ text, delay = 0, stagger = 45, className }: { text: string; delay?: number; stagger?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={cn("blur-words", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="blur-word" style={{ "--d": `${delay + i * stagger}ms` } as React.CSSProperties}>
          {word}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
