"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

type PromoVideoPlayerProps = {
  sources: { src: string; type: string }[];
  poster: string;
  captions: { src: string; label: string };
  playLabel: string;
  duration: string;
  ariaLabel: string;
};

/**
 * Lecteur de la vidéo de présentation : affiche l'image d'aperçu et un bouton
 * de lecture ; au clic, la vidéo démarre avec le son et les contrôles natifs.
 * Rien n'est téléchargé avant le clic (preload="none").
 */
export function PromoVideoPlayer({ sources, poster, captions, playLabel, duration, ariaLabel }: PromoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    // Lecture refusée (navigateur, économie de données) : les contrôles natifs restent affichés.
    videoRef.current?.play().catch(() => undefined);
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-[16px] bg-ink md:rounded-[20px]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={poster}
        preload="none"
        playsInline
        controls={started}
        aria-label={ariaLabel}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        <track kind="captions" src={captions.src} srcLang="fr" label={captions.label} />
      </video>
      {started ? null : (
        <button
          type="button"
          onClick={start}
          className="group absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(31,39,51,0.08),rgba(31,39,51,0.32))] focus-visible:outline-none"
        >
          <span className="flex items-center gap-3 rounded-full bg-page/95 py-3 pl-3 pr-5 text-[15px] font-medium text-ink shadow-card ring-1 ring-line transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:ring-2 group-focus-visible:ring-brand md:py-4 md:pl-4 md:pr-6 md:text-[16px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-page md:h-12 md:w-12">
              <Play aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current md:h-5 md:w-5" />
            </span>
            {playLabel}
            <span className="font-mono text-[13px] text-ink-muted">{duration}</span>
          </span>
        </button>
      )}
    </div>
  );
}
