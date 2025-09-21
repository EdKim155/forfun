'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

export function SettingsScreen() {
  const t = useTranslations('settings');
  const toast = useToast();
  const { setTheme, theme } = useTheme();
  const onboarding = useOnboardingStore();
  const [apiKey, setApiKey] = useState('');
  const [language, setLanguage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { apiKey: string }) => apiClient.post('/api/settings/openai', payload),
    onSuccess: () => {
      toast.success(t('messages.saved'));
      setApiKey('');
    },
    onError: () => toast.error(t('messages.error'))
  });

  const preferenceMutation = useMutation({
    mutationFn: (payload: { language?: string | null; theme?: string | null }) =>
      apiClient.post('/api/settings/preferences', payload),
    onSuccess: () => toast.success(t('messages.saved')),
    onError: () => toast.error(t('messages.error'))
  });

  const applyTheme = (value: string) => {
    setTheme(value);
    preferenceMutation.mutate({ theme: value, language });
  };

  const applyLanguage = (value: string | null) => {
    setLanguage(value);
    preferenceMutation.mutate({ language: value, theme });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('appearance.description')}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('appearance.theme')}</p>
              <p className="text-sm text-muted-foreground">{t('appearance.themeHint')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={theme === 'light' ? 'secondary' : 'outline'} onClick={() => applyTheme('light')}>
                {t('appearance.light')}
              </Button>
              <Button variant={theme === 'dark' ? 'secondary' : 'outline'} onClick={() => applyTheme('dark')}>
                {t('appearance.dark')}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('appearance.onboarding')}</p>
              <p className="text-sm text-muted-foreground">{t('appearance.onboardingHint')}</p>
            </div>
            <Button variant="outline" onClick={() => onboarding.reset()}>
              {t('appearance.resetOnboarding')}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('api.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('api.description')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('api.label')}</label>
            <Input
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-..."
              type="password"
            />
            <p className="text-xs text-muted-foreground">{t('api.hint')}</p>
          </div>
          <Button disabled={!apiKey} onClick={() => mutation.mutate({ apiKey })}>
            {mutation.isPending ? t('api.saving') : t('api.save')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('language.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('language.description')}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('language.auto')}</span>
            <Switch checked={language === null} onCheckedChange={(checked) => applyLanguage(checked ? null : 'ru')} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Русский</span>
            <Switch checked={language === 'ru'} onCheckedChange={(checked) => applyLanguage(checked ? 'ru' : null)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">English</span>
            <Switch checked={language === 'en'} onCheckedChange={(checked) => applyLanguage(checked ? 'en' : null)} />
          </div>
          <p className="text-xs text-muted-foreground">{t('language.hint')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('data.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('data.description')}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => apiClient.get('/api/templates/export').then((data) => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'templates-export.json';
            link.click();
          })}>
            {t('data.export')}
          </Button>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border/60 px-4 py-2 text-sm">
            {t('data.import')}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const content = await file.text();
                try {
                  const json = JSON.parse(content);
                  await apiClient.post('/api/templates/import', { templates: json });
                  toast.success(t('data.imported'));
                  event.target.value = '';
                } catch (error) {
                  toast.error(t('data.importError'));
                }
              }}
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
