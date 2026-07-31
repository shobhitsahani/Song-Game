'use client';
import { useCallback, useRef } from 'react';

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

export function useSound() {
  const enabled = useRef(true);

  const play = useCallback((sound: 'correct' | 'wrong' | 'click' | 'countdown' | 'levelup' | 'join' | 'start' | 'end') => {
    if (!enabled.current) return;
    if (audioContext?.state === 'suspended') audioContext.resume();
    switch (sound) {
      case 'correct': playTone(523, 0.15); setTimeout(() => playTone(659, 0.15), 100); setTimeout(() => playTone(784, 0.2), 200); break;
      case 'wrong': playTone(200, 0.3, 'sawtooth', 0.05); break;
      case 'click': playTone(800, 0.05, 'square', 0.02); break;
      case 'countdown': playTone(440, 0.1, 'square', 0.04); break;
      case 'levelup': playTone(523, 0.1); setTimeout(() => playTone(659, 0.1), 80); setTimeout(() => playTone(784, 0.1), 160); setTimeout(() => playTone(1047, 0.3), 240); break;
      case 'join': playTone(440, 0.1, 'sine', 0.06); setTimeout(() => playTone(660, 0.15), 80); break;
      case 'start': playTone(330, 0.1); setTimeout(() => playTone(440, 0.1), 100); setTimeout(() => playTone(550, 0.1), 200); setTimeout(() => playTone(660, 0.2), 300); break;
      case 'end': playTone(784, 0.15); setTimeout(() => playTone(659, 0.15), 150); setTimeout(() => playTone(523, 0.15), 300); setTimeout(() => playTone(659, 0.15), 450); setTimeout(() => playTone(784, 0.3), 600); break;
    }
  }, []);

  const stop = useCallback(() => { enabled.current = false; }, []);
  const resume = useCallback(() => { enabled.current = true; }, []);

  return { play, stop, resume };
}
