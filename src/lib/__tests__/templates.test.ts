import { describe, expect, it } from 'vitest';
import { renderTemplate, serializeToolSlugs, serializeVariables } from '@/lib/templates';

describe('renderTemplate', () => {
  it('replaces known variables and keeps placeholders for missing', () => {
    const body = 'Goal: {{brief}}\nAudience: {{audience}}\nCTA: {{cta}}';
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const output = renderTemplate(body, { brief: 'Launch product', audience: 'developers' }, ['audience', 'cta']);
    expect(output).toContain('Launch product');
    expect(output).toContain('developers');
    expect(output).toContain('[[CTA]]');
  });
});

describe('serialize helpers', () => {
  it('removes duplicates and keeps order', () => {
    expect(JSON.parse(serializeVariables(['one', 'one', 'two']))).toEqual(['one', 'two']);
    expect(JSON.parse(serializeToolSlugs(['a', 'b', 'a']))).toEqual(['a', 'b']);
  });
});
