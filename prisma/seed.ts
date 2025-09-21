import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tools = [
  { slug: 'chatgpt', name: 'ChatGPT', icon: '💬' },
  { slug: 'claude', name: 'Claude', icon: '🧠' },
  { slug: 'gemini', name: 'Gemini', icon: '🌐' },
  { slug: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { slug: 'dalle', name: 'DALL·E', icon: '🖼️' },
  { slug: 'sora', name: 'Sora', icon: '🎬' },
  { slug: 'notion', name: 'Notion AI', icon: '📚' },
  { slug: 'perplexity', name: 'Perplexity', icon: '🔎' }
];

const categories = [
  { slug: 'marketing', name: 'Маркетинг' },
  { slug: 'education', name: 'Обучение' },
  { slug: 'development', name: 'Программирование' },
  { slug: 'design', name: 'Дизайн' },
  { slug: 'analytics', name: 'Аналитика' },
  { slug: 'research', name: 'Исследования' },
  { slug: 'visual', name: 'Визуал-генерации' },
  { slug: 'support', name: 'Техподдержка' },
  { slug: 'other', name: 'Другое' }
];

const templates = [
  {
    title: 'Маркетинговый контент-план',
    description: 'Структурирует идеи для постов в соцсетях и рассылок',
    body:
      'Ты — маркетолог мирового уровня. Цель: {{brief}}. Сформируй план на 4 недели по каналам (Telegram, email, блог). Для каждого указать: тему, хук, формат, CTA.',
    variables: [],
    toolSlugs: ['chatgpt', 'claude'],
    categorySlug: 'marketing'
  },
  {
    title: 'Анализ пользовательских интервью',
    description: 'Сводит инсайты и боли клиентов по интервью',
    body:
      'Проанализируй интервью: {{brief}}. Выдели ключевые боли, цитаты, рекомендации и приоритет по воздействию.',
    variables: [],
    toolSlugs: ['chatgpt', 'claude', 'perplexity'],
    categorySlug: 'research'
  },
  {
    title: 'Техническое задание для разработчиков',
    description: 'Формирует структурированное ТЗ на основе описания идеи',
    body:
      'Сформируй ТЗ. Бриф: {{brief}}. Включи разделы: цель, юзкейсы, функционал, API/интеграции, критерии приёмки, риски.',
    variables: [],
    toolSlugs: ['chatgpt', 'claude'],
    categorySlug: 'development'
  },
  {
    title: 'AI-арт Midjourney',
    description: 'Создаёт художественный промпт для Midjourney',
    body:
      'Создай промпт Midjourney для задачи: {{brief}}. Формат: "<сцена>, <детали окружения>, <стиль>, <освещение>, <параметры --ar>".',
    variables: [],
    toolSlugs: ['midjourney'],
    categorySlug: 'visual'
  },
  {
    title: 'Бриф на лендинг',
    description: 'Структура для лендинга: блоки, УТП, доверие, CTA',
    body:
      'Составь структуру лендинга. Контекст: {{brief}}. Выведи таблицу с колонками: блок, цель, содержание, формат доказательства.',
    variables: [],
    toolSlugs: ['chatgpt', 'claude'],
    categorySlug: 'marketing'
  },
  {
    title: 'Программа обучения',
    description: 'Помогает разработать учебный курс с модулями и заданиями',
    body:
      'Разработай учебную программу по теме: {{brief}}. Укажи модули, цели, формат уроков, практические задания, критерии оценки.',
    variables: [],
    toolSlugs: ['chatgpt', 'gemini'],
    categorySlug: 'education'
  },
  {
    title: 'Сценарий видеоролика',
    description: 'Создаёт сценарий для динамичного видео с таймингами',
    body:
      'Создай сценарий видео. Задача: {{brief}}. Укажи таймкоды, визуальные сцены, закадровый текст, саунд-дизайн.',
    variables: [],
    toolSlugs: ['sora', 'chatgpt'],
    categorySlug: 'visual'
  },
  {
    title: 'FAQ для поддержки',
    description: 'Генерирует FAQ и скрипт для службы поддержки',
    body:
      'На основе описания продукта {{brief}} составь FAQ: вопрос, краткий ответ, расширенный ответ, теги.',
    variables: [],
    toolSlugs: ['chatgpt'],
    categorySlug: 'support'
  },
  {
    title: 'SQL-аналитика',
    description: 'Формирует SQL-запрос и интерпретацию результатов',
    body:
      'Опиши SQL запрос для задачи: {{brief}}. Верни: запрос, предположения о таблицах, как интерпретировать результаты, дополнительные метрики.',
    variables: [],
    toolSlugs: ['chatgpt', 'claude'],
    categorySlug: 'analytics'
  },
  {
    title: 'Product discovery исследование',
    description: 'План исследования с гипотезами и методами',
    body:
      'Сформируй план discovery. Контекст: {{brief}}. Укажи гипотезы, методы проверки, метрики успеха, риски.',
    variables: [],
    toolSlugs: ['perplexity', 'chatgpt'],
    categorySlug: 'research'
  }
];

function serialize(values: string[]) {
  return JSON.stringify(Array.from(new Set(values)));
}

async function main() {
  await prisma.tool.createMany({
    data: tools.map((tool) => ({ ...tool })),
    skipDuplicates: true
  });

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true
  });

  for (const template of templates) {
    const category = await prisma.category.findUnique({ where: { slug: template.categorySlug } });
    const existing = await prisma.template.findFirst({ where: { title: template.title, userId: null } });
    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: {
          description: template.description,
          body: template.body,
          variablesJson: serialize(template.variables),
          toolSlugsJson: serialize(template.toolSlugs),
          categoryId: category?.id ?? null
        }
      });
    } else {
      await prisma.template.create({
        data: {
          title: template.title,
          description: template.description,
          body: template.body,
          variablesJson: serialize(template.variables),
          toolSlugsJson: serialize(template.toolSlugs),
          categoryId: category?.id ?? null,
          userId: null
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
