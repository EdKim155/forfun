'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = ({
  className,
  align = 'center',
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-3xl border border-border/60 bg-background p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
