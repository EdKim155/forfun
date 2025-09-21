'use client';

import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      theme="system"
      toastOptions={{
        classNames: {
          toast: 'rounded-3xl border border-border/60 bg-background/95 backdrop-blur px-5 py-3 shadow-lg',
          description: 'text-sm text-muted-foreground'
        }
      }}
      visibleToasts={3}
    />
  );
}
