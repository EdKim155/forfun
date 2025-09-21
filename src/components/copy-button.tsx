'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  value: string;
  variant?: 'default' | 'ghost' | 'outline';
  label?: string;
}

export function CopyButton({ value, variant = 'outline', label = 'Копировать' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Скопировано');
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      toast.error('Не удалось скопировать');
    }
  };

  return (
    <Button onClick={handleCopy} variant={variant} className="gap-2">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Скопировано!' : label}
    </Button>
  );
}
