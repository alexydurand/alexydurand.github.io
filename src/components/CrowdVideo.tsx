/**
 * A short YouTube excerpt of the crowd at a big event. Until clicked it is only the game's logo:
 * nothing is requested from YouTube before that, then the privacy-enhanced player loads and plays.
 */
export default function CrowdVideo({
  name,
  logo,
  video,
  active,
  onPlay,
}: {
  name: string;
  logo: string;
  video: { id: string; start: number; end: number };
  active: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="bg-surface-2 relative aspect-video overflow-hidden rounded-md">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?start=${video.start}&end=${video.end}&autoplay=1&rel=0&playsinline=1`}
          title={`Ambiance esport : ${name}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Voir l’ambiance d’un grand événement ${name} (vidéo YouTube)`}
          className="group/video absolute inset-0 grid place-items-center p-6"
        >
          <img
            src={logo}
            alt=""
            width={160}
            height={60}
            loading="lazy"
            className="ease-out-expo max-h-[45%] w-auto max-w-[70%] object-contain transition-transform duration-500 group-hover/video:scale-105 motion-reduce:transition-none"
          />
          <span className="bg-ink text-small text-bg absolute bottom-3 left-3 flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-3">
            <svg aria-hidden viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
            Ambiance
          </span>
        </button>
      )}
    </div>
  );
}
