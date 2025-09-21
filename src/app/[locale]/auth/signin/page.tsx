import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, signIn } from '@/auth';
export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Вы уже авторизованы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Перейдите к приложению.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Вход по email</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            action={async (formData: FormData) => {
              'use server';
              await signIn('email', formData);
            }}
          >
            <input type="email" name="email" required placeholder="you@example.com" className="w-full rounded-full border border-border/60 px-4 py-3" />
            <Button type="submit" className="w-full">
              Получить ссылку
            </Button>
          </form>
          {process.env.NODE_ENV !== 'production' ? (
            <form
              className="mt-6 space-y-4"
              action={async () => {
                'use server';
                await signIn('credentials', {
                  email: 'demo@example.com',
                  token: process.env.DEMO_LOGIN_TOKEN ?? 'demo'
                });
              }}
            >
              <Button type="submit" variant="secondary" className="w-full">
                Войти как демо-пользователь
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
