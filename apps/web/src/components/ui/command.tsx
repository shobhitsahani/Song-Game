'use client';

import * as React from 'react';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { MagnifyingGlass, Check, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

export { useCommandState };

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-transparent text-[var(--foreground)] outline-none',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

export interface CommandDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const CommandDialog = ({
  children,
  open,
  onOpenChange,
  title = 'Search genres or music eras',
  description = 'Filter and select music genres or eras with keyboard navigation',
}: CommandDialogProps) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [viewportBottomOffset, setViewportBottomOffset] = React.useState(0);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!isMobile || !open || typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const handleVisualViewport = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const bottom = window.innerHeight - (vv.height + vv.offsetTop);
      setViewportBottomOffset(Math.max(0, bottom));
    };

    window.visualViewport.addEventListener('resize', handleVisualViewport);
    window.visualViewport.addEventListener('scroll', handleVisualViewport);
    handleVisualViewport();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewport);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewport);
    };
  }, [isMobile, open]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          hideClose
          style={{ bottom: `${viewportBottomOffset}px` }}
          className="h-[min(560px,85dvh)] rounded-t-[24px] border-t border-[var(--glass-border)] bg-[var(--card)]/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden focus-within:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_24px_var(--glow)]"
        >
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          <DrawerDescription className="sr-only">{description}</DrawerDescription>
          <Command className="flex flex-col h-full">
            {children}
          </Command>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-w-[min(560px,92vw)] h-[521px] flex flex-col overflow-hidden p-0 rounded-[24px] border border-[var(--glass-border)] bg-[var(--card)]/90 backdrop-blur-2xl shadow-2xl focus-within:border-[var(--glass-highlight)] focus-within:shadow-[inset_0_1px_0_var(--glass-highlight),0_0_24px_var(--glow)]"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command className="flex flex-col h-full">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    onClear?: () => void;
  }
>(({ className, value, onClear, style, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const search = useCommandState((state) => state.search);

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      inputRef.current.focus();
    }
    onClear?.();
  };

  const showClear = Boolean(value !== undefined ? value : search);

  return (
    <div
      className="flex items-center border-b border-[var(--glass-border)] px-4 py-1 shrink-0"
      cmdk-input-wrapper=""
    >
      <MagnifyingGlass size={18} className="mr-3 shrink-0 text-[var(--muted-foreground)]" />
      <CommandPrimitive.Input
        ref={inputRef}
        value={value}
        autoFocus
        style={{ outline: 'none', boxShadow: 'none', border: 'none', ...style }}
        className={cn(
          'flex h-12 w-full rounded-none bg-transparent py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--glass-bg)] transition-colors duration-[80ms] cursor-pointer shrink-0"
          aria-label="Clear search input"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'h-[min(420px,60dvh)] min-h-[min(420px,60dvh)] max-h-[min(420px,60dvh)] overflow-y-auto overflow-x-hidden p-2 [scrollbar-width:thin] [scrollbar-color:var(--glass-border)_transparent] [scrollbar-gutter:stable] [overscroll-behavior:contain] [scroll-behavior:auto]',
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & {
    onClear?: () => void;
  }
>(({ children, onClear, className, ...props }, ref) => {
  const search = useCommandState((state) => state.search);
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn(
        'h-[min(380px,50dvh)] text-center text-sm text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-2 select-none',
        className
      )}
      {...props}
    >
      {children || (
        <>
          <p>
            No results for &ldquo;
            <span className="font-semibold text-[var(--foreground)]">{search}</span>
            &rdquo;
          </p>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 text-xs font-semibold text-[var(--primary)] hover:underline px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--glass-border)] cursor-pointer transition-colors duration-[80ms]"
            >
              Clear search
            </button>
          )}
        </>
      )}
    </CommandPrimitive.Empty>
  );
});
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-[var(--foreground)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--muted-foreground)]',
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    isCurrent?: boolean;
  }
>(({ className, children, value, isCurrent, ...props }, ref) => {
  return (
    <CommandPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        'relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-sm outline-none border border-transparent transition-[background-color,border-color] duration-[80ms] ease-out data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 text-[var(--foreground)] hover:bg-[var(--surface-2)]/60 data-[selected=true]:bg-[var(--nav-lens-bg)] data-[selected=true]:border-[var(--nav-lens-border)] data-[selected=true]:shadow-[inset_0_1px_0_var(--glass-highlight)]',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {children}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {isCurrent && (
          <Check size={14} weight="bold" className="text-[var(--primary)] shrink-0" />
        )}
        <kbd className="hidden [.group[data-selected=true]_&]:inline-flex [[data-selected=true]_&]:inline-flex font-mono text-[10px] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded border border-[var(--glass-border)] bg-[var(--surface-1)]/70">
          ↵
        </kbd>
      </div>
    </CommandPrimitive.Item>
  );
});
CommandItem.displayName = CommandPrimitive.Item.displayName;

export const CommandFooter = () => (
  <div className="flex items-center justify-between border-t border-[var(--glass-border)] px-4 py-2.5 text-[11px] text-[var(--muted-foreground)] bg-[var(--surface-1)]/40 rounded-b-[24px] shrink-0">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1">
        <kbd className="font-mono rounded border border-[var(--glass-border)] bg-[var(--surface-1)] px-1 py-0.5 text-[10px]">↑</kbd>
        <kbd className="font-mono rounded border border-[var(--glass-border)] bg-[var(--surface-1)] px-1 py-0.5 text-[10px]">↓</kbd>
        <span>Navigate</span>
      </span>
      <span className="flex items-center gap-1">
        <kbd className="font-mono rounded border border-[var(--glass-border)] bg-[var(--surface-1)] px-1 py-0.5 text-[10px]">↵</kbd>
        <span>Select</span>
      </span>
    </div>
    <span className="flex items-center gap-1">
      <kbd className="font-mono rounded border border-[var(--glass-border)] bg-[var(--surface-1)] px-1.5 py-0.5 text-[10px]">Esc</kbd>
      <span>Close</span>
    </span>
  </div>
);
