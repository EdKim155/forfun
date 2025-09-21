'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { SaveModal } from '@/components/save-modal';
import { SendModal } from '@/components/send-modal';
import { Button } from '@/components/ui/button';
import { usePathname, Link } from '@/i18n/routing';
import { type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BookOpen, FolderOpenDot, Library, Settings, Sparkles, Workflow } from 'lucide-react';

const navItems = [
  { href: '/onboarding', label: 'Онбординг', icon: Sparkles },
  { href: '/builder', label: 'Конструктор', icon: Workflow },
  { href: '/templates', label: 'Шаблоны', icon: FolderOpenDot },
  { href: '/library', label: 'Библиотека', icon: Library },
  { href: '/settings', label: 'Настройки', icon: Settings }
];

export function AppShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center justify-between gap-4 py-4">
          <Link href={{ pathname: '/builder', locale }} className="flex items-center gap-2 font-semibold">
            <motion.span
              layoutId="brand"
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg"
            >
              <BookOpen className="size-5" />
            </motion.span>
            Prompt Engineer
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <div key={item.href} className="relative">
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn('gap-2 rounded-full px-4 py-2 transition-all', isActive && 'shadow-lg')}
                  >
                    <Link href={{ pathname: item.href, locale }}>
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </Button>
                  {isActive ? (
                    <motion.span layoutId="nav-indicator" className="absolute inset-x-2 -bottom-1 h-1 rounded-full bg-primary" />
                  ) : null}
                </div>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
      <footer className="border-t border-border/60 bg-background/80 py-6 text-center text-sm text-muted-foreground">
        Сделано с ♥, чтобы выстреливали ваши промпты
      </footer>
      <SaveModal />
      <SendModal />
    </div>
  );
}
