/**
 * Générateur PDF minimal (une page, texte Helvetica, encodage WinAnsi) sans
 * dépendance : suffisant pour une facture lisible et imprimable.
 */

export interface PdfText {
  text: string;
  x: number;
  y: number;
  size?: number;
  bold?: boolean;
  /** Aligné à droite sur x. */
  right?: boolean;
  color?: [number, number, number];
}

export interface PdfLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  color?: [number, number, number];
}

const WINANSI: Record<string, number> = { "\u20ac": 0x80, "\u2019": 0x92, "\u2018": 0x91, "\u201c": 0x93, "\u201d": 0x94, "\u2013": 0x96, "\u2014": 0x97, "\u2026": 0x85, "\u2022": 0x95, "\u0153": 0x9c, "\u0152": 0x8c, "\u00a0": 0xa0, "\u202f": 0xa0 };

/** Encode une chaîne en WinAnsi (Latin-1 + quelques signes), avec échappement PDF. */
export function encodePdfText(text: string): string {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const code = WINANSI[ch] ?? ch.charCodeAt(0);
    if (code === 0x28 || code === 0x29 || code === 0x5c) out += `\\${String.fromCharCode(code)}`;
    else if (code < 0x20) out += " ";
    else if (code <= 0xff) out += code >= 0x7f ? `\\${code.toString(8).padStart(3, "0")}` : String.fromCharCode(code);
    else out += "?";
  }
  return out;
}

/** Largeur approximative d'un texte Helvetica (pour l'alignement à droite). */
export function approxWidth(text: string, size: number, bold = false): number {
  let w = 0;
  for (const ch of text) {
    if (/[ilj.,:;'|!I]/.test(ch)) w += 0.28;
    else if (/[mwMW]/.test(ch)) w += 0.85;
    else if (/[A-Z0-9€]/.test(ch)) w += 0.62;
    else if (ch === " ") w += 0.28;
    else w += 0.52;
  }
  return w * size * (bold ? 1.05 : 1);
}

export function buildPdf(input: { texts: PdfText[]; lines?: PdfLine[]; title?: string }): Uint8Array {
  const parts: string[] = [];
  for (const line of input.lines ?? []) {
    const [r, g, b] = line.color ?? [0.85, 0.85, 0.9];
    parts.push(`${r} ${g} ${b} RG ${line.width ?? 0.8} w ${line.x1} ${line.y1} m ${line.x2} ${line.y2} l S`);
  }
  for (const t of input.texts) {
    const size = t.size ?? 10;
    const font = t.bold ? "/F2" : "/F1";
    const x = t.right ? t.x - approxWidth(t.text, size, t.bold) : t.x;
    const [r, g, b] = t.color ?? [0.07, 0.07, 0.09];
    parts.push(`BT ${r} ${g} ${b} rg ${font} ${size} Tf ${x.toFixed(2)} ${t.y.toFixed(2)} Td (${encodePdfText(t.text)}) Tj ET`);
  }
  const content = parts.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    `<< /Title (${encodePdfText(input.title ?? "Document")}) /Producer (Reso) >>`,
  ];
  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}
