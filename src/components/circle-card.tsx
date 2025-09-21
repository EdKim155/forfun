'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface CircleCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  selected?: boolean;
  description?: string;
}

export function CircleCard({ label, icon, selected, description, className, ...props }: CircleCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex size-32 flex-col items-center justify-center gap-2 rounded-full border-2 transition-all focus-visible:ring-2 focus-visible:ring-primary/60',
        'group',
        selected ? 'border-primary bg-primary/10 shadow-lg' : 'border-transparent bg-muted/30 hover:border-primary/40',
        className
      )}
      {...props}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-background shadow-md transition-transform group-hover:scale-105">
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
      {selected ? (
          <motion.span
            layoutId="selection"
            // eslint-disable-next-line tailwindcss/classnames-order
            className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg"
        >
          ✓
        </motion.span>
      ) : null}
    </motion.button>
  );
}
