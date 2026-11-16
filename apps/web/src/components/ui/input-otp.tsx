'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { Dot } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center has-disabled:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('inline-flex items-center -space-x-px', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] || {};

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-[var(--border)] bg-[var(--surface-1)] text-base sm:text-lg font-sans font-bold uppercase transition-[border-color,box-shadow,background-color] duration-100 ease-out first:rounded-l-[var(--radius-control,10px)] last:rounded-r-[var(--radius-control,10px)]',
        isActive && 'z-10 border-[var(--ring)] ring-2 ring-[var(--ring)]/50 bg-[var(--surface-2)] shadow-xs',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-caret-blink bg-[var(--foreground)] duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot size={20} className="text-[var(--muted-foreground)]" />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, REGEXP_ONLY_DIGITS_AND_CHARS };
