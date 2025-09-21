'use client';

import * as React from 'react';
import type { Session } from 'next-auth';
import { SessionProvider } from './session-provider';
import { ThemeProvider } from './theme-provider';
import { ReactQueryProvider } from './query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ReactQueryProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
