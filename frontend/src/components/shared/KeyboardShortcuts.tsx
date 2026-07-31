'use client';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Shortcut = { key: string; description: string; action: () => void; enabled?: boolean };

const ShortcutsContext = createContext<{ register: (s: Shortcut) => () => void; shortcuts: Shortcut[] }>({
  register: () => () => {},
  shortcuts: [],
});

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  const register = (s: Shortcut) => {
    setShortcuts(prev => [...prev, s]);
    return () => setShortcuts(prev => prev.filter(x => x !== s));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      shortcuts.forEach(s => {
        if (s.enabled !== false && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault();
          s.action();
        }
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);

  return (
    <ShortcutsContext.Provider value={{ register, shortcuts }}>
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useShortcut(s: Shortcut) {
  const { register } = useContext(ShortcutsContext);
  const sRef = useRef(s);
  sRef.current = s;
  useEffect(() => {
    const handler = () => sRef.current.action();
    if (sRef.current.enabled !== false) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [s.key, s.enabled]);
}

export function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { shortcuts } = useContext(ShortcutsContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className={cn('px-2 py-0.5 rounded bg-secondary text-xs font-mono min-w-[24px] text-center')}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
