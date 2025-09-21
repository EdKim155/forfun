import { describe, expect, it } from 'vitest';
import { getToolStrategy } from '@/lib/tool-strategies';

describe('getToolStrategy', () => {
  it('returns specific strategy for known slug', () => {
    const strategy = getToolStrategy('chatgpt');
    expect(strategy.systemPrompt).toContain('ChatGPT');
  });

  it('returns fallback for unknown slug', () => {
    const strategy = getToolStrategy('unknown');
    expect(strategy.fallbackIntro).toBe('Промпт:');
  });
});
