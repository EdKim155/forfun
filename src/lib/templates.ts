import type { Template } from '@prisma/client';

export function parseVariables(variablesJson: string | null | undefined): string[] {
  if (!variablesJson) return [];
  try {
    const parsed = JSON.parse(variablesJson);
    return Array.isArray(parsed) ? (parsed.filter((item) => typeof item === 'string') as string[]) : [];
  } catch (error) {
    return [];
  }
}

export function serializeVariables(variables: string[]): string {
  return JSON.stringify(Array.from(new Set(variables.filter(Boolean))));
}

export function parseToolSlugs(toolSlugsJson: string | null | undefined): string[] {
  if (!toolSlugsJson) return [];
  try {
    const parsed = JSON.parse(toolSlugsJson);
    return Array.isArray(parsed) ? (parsed.filter((item) => typeof item === 'string') as string[]) : [];
  } catch (error) {
    return [];
  }
}

export function serializeToolSlugs(toolSlugs: string[]): string {
  return JSON.stringify(Array.from(new Set(toolSlugs.filter(Boolean))));
}

export function renderTemplate(body: string, values: Record<string, string>, variables: string[]): string {
  const sanitized = variables.reduce<Record<string, string>>((acc, key) => {
    acc[key] = values[key] ?? `[[${key.toUpperCase()}]]`;
    return acc;
  }, {});

  return body.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    if (key === 'brief' && values.brief) {
      return values.brief;
    }
    if (sanitized[key]) {
      return sanitized[key];
    }
    return `[[${key.toUpperCase()}]]`;
  });
}

export function decorateTemplate(template: Template) {
  return {
    ...template,
    variables: parseVariables(template.variablesJson),
    toolSlugs: parseToolSlugs(template.toolSlugsJson)
  };
}
