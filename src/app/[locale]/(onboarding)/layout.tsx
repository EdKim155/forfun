export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <main className="container flex flex-1 flex-col justify-center py-10">{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        Можно вернуться к онбордингу через настройки.
      </footer>
    </div>
  );
}
