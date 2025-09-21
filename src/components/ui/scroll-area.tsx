'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

export const ScrollArea = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>) => (
  <ScrollAreaPrimitive.Root className={cn('overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="size-full rounded-3xl">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex h-full w-2 touch-none select-none rounded-full bg-muted/40"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-primary/40" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
);
