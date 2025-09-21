import OpenAI from 'openai';
import { env } from '@/config/env';
import { checkRateLimit } from '@/lib/rate-limit';

const isMock = !env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'sk-placeholder';

let client: OpenAI | null = null;
if (!isMock) {
  client = new OpenAI({ apiKey: env.OPENAI_API_KEY, organization: env.OPENAI_ORG_ID || undefined });
}

export async function callOpenAI({ system, user }: { system: string; user: string }): Promise<string | null> {
  if (!client || isMock) {
    return null;
  }

  const allowed = checkRateLimit('openai:generate');
  if (!allowed) {
    throw new Error('Превышен лимит генераций. Попробуйте позже.');
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.6
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error('OpenAI error', error);
    return null;
  }
}
