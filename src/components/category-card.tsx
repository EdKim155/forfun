'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  icon: React.ReactNode;
  selected?: boolean;
}

export function CategoryCard({ title, description, icon, selected, className, ...props }: CategoryCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex flex-col items-start gap-3 rounded-3xl border border-border/60 bg-app-card p-5 text-left transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/60',
        selected && 'border-primary bg-primary/10 shadow-lg',
        className
      )}
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
      <div className="space-y-1">
        <h4 className="text-lg font-semibold">{title}</h4>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </motion.button>
  );
}
