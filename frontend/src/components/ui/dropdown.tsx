'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';

export function Dropdown({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && <div className="absolute right-0 mt-1 w-32 rounded-lg bg-black/90 border border-white/10 shadow-xl z-50 py-1 backdrop-blur-xl">{children}</div>}
    </div>
  );
}
