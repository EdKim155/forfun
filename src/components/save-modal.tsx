'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useModalStore } from '@/store/modal-store';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function SaveModal() {
  const { saveModal, closeSaveModal } = useModalStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!saveModal.prompt) return;
      await apiClient.post('/api/prompts', {
        title: title || 'Без названия',
        notes,
        content: saveModal.prompt,
        toolSlug: saveModal.toolSlug,
        categorySlug: saveModal.categorySlug,
        brief: saveModal.brief,
        templateId: saveModal.templateId
      });
    },
    onSuccess: async () => {
      toast.success('Промпт сохранён в библиотеку');
      setTitle('');
      setNotes('');
      await queryClient.invalidateQueries({ queryKey: ['prompts'] });
      closeSaveModal();
    },
    onError: () => {
      toast.error('Не удалось сохранить промпт');
    }
  });

  const isOpen = Boolean(saveModal.prompt);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSaveModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить промпт</DialogTitle>
          <DialogDescription>
            Задайте название и заметку, чтобы быстро найти промпт в библиотеке.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Название</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, лендинг для IT-продукта" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Заметка</label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Добавьте контекст или условия использования"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeSaveModal}>
              Отмена
            </Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Сохраняем…' : 'Сохранить промпт'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
