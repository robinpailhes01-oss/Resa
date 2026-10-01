import { Section, SectionHeading } from "@/components/ui/Section";
import { byMode, promoVideo } from "@/content/fr/landing";
import { PromoVideoPlayer } from "./PromoVideoPlayer";

/** Vidéo de présentation sous le hero (mode live uniquement : elle cite l'essai et le tarif). */
export function PromoVideo() {
  if (!byMode(promoVideo.visible)) return null;

  return (
    <Section id="video" labelledBy="video-title" className="!pb-6 md:!pb-10">
      <SectionHeading id="video-title" eyebrow={promoVideo.eyebrow} title={promoVideo.title} intro={promoVideo.text} />

      <figure className="reveal relative mt-10 md:mt-14">
        <div className="rounded-[22px] bg-stone p-2 sm:p-3 md:rounded-[28px] md:p-4">
          <PromoVideoPlayer
            sources={promoVideo.sources}
            poster={promoVideo.poster}
            captions={promoVideo.captions}
            playLabel={promoVideo.playLabel}
            duration={promoVideo.duration}
            ariaLabel={promoVideo.ariaLabel}
          />
        </div>
        <figcaption className="pt-4 text-center text-[12px] text-ink-muted md:text-[13px]">{promoVideo.caption}</figcaption>
      </figure>
    </Section>
  );
}
