interface ToolStrategy {
  systemPrompt: string;
  fallbackIntro: string;
}

const strategies: Record<string, ToolStrategy> = {
  chatgpt: {
    systemPrompt:
      'You are a senior prompt engineer crafting detailed instructions for ChatGPT. Always optimize for clarity, roles, tone and structured output.',
    fallbackIntro: 'Сконструированный промпт для ChatGPT:'
  },
  claude: {
    systemPrompt:
      'You design prompts for Anthropic Claude. Focus on safety, explicit context, and request step-by-step reasoning in the answer.',
    fallbackIntro: 'Промпт для Claude:'
  },
  gemini: {
    systemPrompt:
      'You design prompts for Google Gemini. Ensure instructions mention multimodal ability and request concise yet insightful output.',
    fallbackIntro: 'Промпт для Gemini:'
  },
  midjourney: {
    systemPrompt:
      'You craft prompts for Midjourney image generation. Use descriptive adjectives, composition hints, camera and lighting details. Return a single line prompt.',
    fallbackIntro: 'Промпт для Midjourney:'
  },
  dalle: {
    systemPrompt:
      'You craft prompts for DALL·E. Highlight visual style, scene description, mood, and level of detail. Output one paragraph.',
    fallbackIntro: 'Промпт для DALL·E:'
  },
  sora: {
    systemPrompt:
      'You craft prompts for OpenAI Sora video generation. Include pacing, shots, transitions and cinematic tone.',
    fallbackIntro: 'Промпт для Sora:'
  }
};

export function getToolStrategy(slug: string): ToolStrategy {
  return strategies[slug] ?? {
    systemPrompt: 'You design prompts for a general AI assistant. Focus on clarity and actionable instructions.',
    fallbackIntro: 'Промпт:'
  };
}
