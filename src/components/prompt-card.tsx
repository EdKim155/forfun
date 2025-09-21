'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/copy-button';
import { useModalStore } from '@/store/modal-store';
import { cn } from '@/lib/utils';
import { Download, ExternalLink } from 'lucide-react';

interface PromptCardProps {
  prompt: string;
  toolSlug: string;
  categoryName?: string;
  categorySlug?: string;
  brief?: string;
  templateId?: string;
  onSave?: () => void;
  createdAt?: string;
  className?: string;
}

const toolLabels: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  midjourney: 'Midjourney',
  dalle: 'DALL·E',
  sora: 'Sora'
};

export function PromptCard({ prompt, toolSlug, categoryName, categorySlug, brief, templateId, onSave, createdAt, className }: PromptCardProps) {
  const { openSaveModal, openSendModal } = useModalStore();

  const handleSave = () => {
    onSave?.();
    openSaveModal({ prompt, toolSlug, categorySlug, brief, templateId });
  };

  const handleSend = () => {
    openSendModal({ prompt, toolSlug });
  };

  const label = toolLabels[toolSlug] ?? toolSlug;

  return (
    <Card className={cn('relative flex h-full flex-col gap-4', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Готовый промпт</CardTitle>
          <div className="flex items-center gap-2">
            <Badge>{label}</Badge>
            {categoryName ? <Badge className="bg-secondary/20 text-secondary">{categoryName}</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[320px] whitespace-pre-wrap rounded-3xl bg-muted/40 p-4 text-sm text-foreground">
          {prompt}
        </pre>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        <CopyButton value={prompt} />
        <Button variant="ghost" onClick={handleSave} className="gap-2">
          <Download className="size-4" /> Сохранить
        </Button>
        <Button variant="secondary" onClick={handleSend} className="gap-2">
          <ExternalLink className="size-4" /> Отправить в инструмент
        </Button>
        {createdAt ? (
          <span className="ml-auto text-xs text-muted-foreground">{createdAt}</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
