'use client';

import { useEffect, useRef, useState } from 'react';

export default function AmbientSound() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.12;
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/krishna-flute.mp3"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        aria-pressed={playing}
        title={playing ? 'Pause music' : 'Play music'}
        className="fixed right-4 top-[4.8rem] z-[105] flex h-10 items-center gap-2 rounded-full border border-white/70 bg-paper/80 px-3.5 text-ink shadow-card backdrop-blur-xl transition-all duration-500 hover:bg-paper md:right-6 md:top-[5.25rem]"
      >
        <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2].map((bar) => (
            <span
              key={bar}
              className={`block w-[2px] rounded-full bg-gold ${playing ? 'sound-wave-bar' : 'h-1'}`}
              style={playing ? { animationDelay: `${bar * 140}ms` } : undefined}
            />
          ))}
        </span>
        <span className="text-[8px] font-semibold tracking-[0.18em]">
          {playing ? 'SOUND ON' : 'SOUND OFF'}
        </span>
      </button>
    </>
  );
}
