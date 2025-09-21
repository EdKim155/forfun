'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToolChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

export function ToolChip({ label, icon, active, className, ...props }: ToolChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/60',
        active && 'border-primary bg-primary/10 text-primary shadow-sm',
        className
      )}
      {...props}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-background shadow">
        {icon}
      </span>
      {label}
    </motion.button>
  );
}
