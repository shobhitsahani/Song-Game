'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Loader2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  startSeconds?: number;
  duration?: number;
  onEnd?: () => void;
  onReady?: () => void;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = memo(function YouTubePlayer({
  videoId, startSeconds = 0, duration = 30, onEnd, onReady, className,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onEndRef = useRef(onEnd);
  const onReadyRef = useRef(onReady);
  onEndRef.current = onEnd;
  onReadyRef.current = onReady;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.YT?.Player) {
      setApiReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.loading = 'lazy';
    const first = document.getElementsByTagName('script')[0];
    first.parentNode?.insertBefore(tag, first);

    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, []);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try { playerRef.current?.pauseVideo(); } catch {}
  }, []);

  useEffect(() => {
    if (!apiReady || !containerRef.current || !videoId) return;

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }

    const container = containerRef.current;
    playerRef.current = new window.YT.Player(container, {
      videoId,
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        start: startSeconds,
      },
      events: {
        onReady: () => {
          setLoaded(true);
          onReadyRef.current?.();
          try { playerRef.current?.playVideo(); } catch {}
          timerRef.current = setTimeout(() => {
            try { playerRef.current?.pauseVideo(); } catch {}
            onEndRef.current?.();
          }, duration * 1000);
        },
        onStateChange: (event: any) => {
          if (event.data === 0) onEndRef.current?.();
        },
        onError: () => {
          setLoaded(true);
          onEndRef.current?.();
        },
      },
    });

    return () => {
      stopPlayback();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
      }
    };
  }, [apiReady, videoId, startSeconds, duration, stopPlayback]);

  return (
    <div className={`relative ${className || ''}`}>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      )}
    </div>
  );
});
