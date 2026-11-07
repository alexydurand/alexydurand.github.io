import { useEffect, useRef, useState } from 'react';
import clsx from '../lib/clsx';

// The parts of Spotify's iFrame API used here
type Controller = {
  play(): void;
  pause(): void;
  togglePlay(): void;
  destroy(): void;
  addListener(event: 'ready' | 'playback_update', cb: (e: { data: { isPaused: boolean } }) => void): void;
};
type IFrameAPI = {
  createController(
    el: HTMLElement,
    options: { uri: string; width: string; height: number },
    cb: (c: Controller) => void,
  ): void;
};

let api: Promise<IFrameAPI> | undefined;
// Spotify's script is fetched on the first click only: nothing reaches Spotify before that
function spotify() {
  api ??= new Promise((resolve) => {
    (window as unknown as { onSpotifyIframeApiReady: (a: IFrameAPI) => void }).onSpotifyIframeApiReady = resolve;
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.body.append(script);
  });
  return api;
}

// One song at a time on the page
let current: Controller | null = null;

/**
 * A play/pause button for one song. The first click loads Spotify's own player under it (an excerpt
 * of about 30 s without a Spotify account), which then follows the button.
 */
export default function TrackPlayer({ title, spotify: id, open }: { title: string; spotify: string; open: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');

  // Closing the row stops the music
  useEffect(() => {
    if (!open) ctrl.current?.pause();
  }, [open]);

  useEffect(
    () => () => {
      if (current === ctrl.current) current = null;
      ctrl.current?.destroy();
    },
    [],
  );

  const click = async () => {
    if (ctrl.current) return ctrl.current.togglePlay();
    if (state !== 'idle' || !slot.current) return;
    setState('loading');
    const API = await spotify();
    // Spotify replaces the element it is given: hand it one React does not manage
    const el = document.createElement('div');
    slot.current.append(el);
    API.createController(el, { uri: `spotify:track:${id}`, width: '100%', height: 80 }, (c) => {
      ctrl.current = c;
      c.addListener('ready', () => c.play());
      c.addListener('playback_update', (e) => {
        setState(e.data.isPaused ? 'paused' : 'playing');
        if (!e.data.isPaused && current !== c) {
          current?.pause();
          current = c;
        }
      });
    });
  };

  const playing = state === 'playing';
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={click}
        aria-label={`${playing ? 'Mettre en pause' : 'Écouter'} « ${title} » (extrait Spotify)`}
        className="group/play flex items-center gap-3 text-left"
      >
        <span className="bg-accent text-accent-ink ease-out-expo grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover/play:scale-105 group-active/play:scale-95">
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
            {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
          </svg>
        </span>
        <span className="text-body">
          {title}
          <span className="text-small text-muted block">
            {state === 'loading' ? 'Chargement…' : 'Extrait · Spotify'}
          </span>
        </span>
      </button>
      <div ref={slot} className={clsx(state === 'idle' ? 'hidden' : 'mt-3')} />
    </div>
  );
}
