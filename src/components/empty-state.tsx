import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import * as React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/60 bg-muted/20 p-10 text-center"
    >
      {icon ? <div className="text-4xl text-primary">{icon}</div> : null}
      <div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </motion.div>
  );
}
