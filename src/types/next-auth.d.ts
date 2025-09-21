import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
  }
}

export {};
