'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useModalStore } from '@/store/modal-store';
import { CopyButton } from '@/components/copy-button';

const toolHints: Record<string, string> = {
  chatgpt: 'Откройте ChatGPT, выберите режим GPT-4 или GPT-4 Turbo и вставьте промпт в диалог.',
  claude: 'В Claude лучше всего работает режим Claude 2.1. Вставьте промпт и дождитесь анализа.',
  gemini: 'Откройте Google Gemini в браузере, создайте новый чат и вставьте промпт.',
  midjourney: 'Скопируйте промпт и вставьте его в Discord-чат Midjourney с командой /imagine.',
  dalle: 'Перейдите в DALL·E, создайте новый генератор и вставьте промпт в поле описания.',
  sora: 'Сервис Sora ещё закрыт. Сохраните промпт и следите за обновлениями OpenAI.'
};

export function SendModal() {
  const { sendModal, closeSendModal } = useModalStore();
  const isOpen = Boolean(sendModal.prompt);

  const hint = sendModal.toolSlug ? toolHints[sendModal.toolSlug] ?? 'Используйте промпт в выбранном инструменте.' : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSendModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отправить в инструмент</DialogTitle>
          <DialogDescription>{hint}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <pre className="max-h-[220px] whitespace-pre-wrap rounded-3xl bg-muted/40 p-4 text-sm text-foreground">
            {sendModal.prompt}
          </pre>
          {sendModal.prompt ? <CopyButton value={sendModal.prompt} label="Копировать промпт" variant="secondary" /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
