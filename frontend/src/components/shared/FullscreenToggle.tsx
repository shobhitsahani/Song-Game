'use client';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFullscreen } from '@/hooks/useFullscreen';

export function FullscreenToggle() {
  const { isFullscreen, toggle } = useFullscreen();
  return (
      <Button variant="ghost" size="icon" onClick={() => toggle()} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </Button>
  );
}
