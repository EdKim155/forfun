import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Prompt Engineer in Your Pocket',
  description:
    'Личный ассистент для создания идеальных промптов на базе любимых AI-инструментов.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} bg-app-background font-sans text-app-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
