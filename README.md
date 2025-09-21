# Prompt Engineer in Your Pocket

Полноценное веб-приложение для продвинутого конструирования промптов с учётом любимых AI-инструментов пользователя, направления задач и индивидуальных брифов.

## Основные возможности

- 🎯 **Онбординг в духе Яндекс.Музыки:** выбор инструментов (ChatGPT, Claude, Gemini, Midjourney и др.), направление задач и краткий бриф с плавными анимациями.
- ⚙️ **Конструктор промптов:** подбор шаблонов, генерация текста через OpenAI (или локальный фоллбек), мгновенное копирование, отправка и сохранение результатов.
- 📚 **Библиотека и история:** теги, заметки, поиск по сохранённым промптам, быстрые действия.
- 🧱 **Управление шаблонами:** встроенные seed-шаблоны + CRUD пользовательских, переменные, импорт/экспорт в JSON.
- 🎨 **Настройки:** светлая/тёмная тема, i18n (ru/en), API-ключи OpenAI, повторный онбординг.
- 🔐 **Аутентификация:** NextAuth с magic-link и демо-режимом в dev.

## Технологический стек

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, shadcn/ui, Framer Motion.
- **State:** Zustand (локальные предпочтения) + TanStack Query (серверные данные).
- **Backend:** Next.js Route Handlers, Prisma ORM.
- **База данных:** SQLite в development (по умолчанию), PostgreSQL в production.
- **Auth:** NextAuth (Email + Credentials demo).
- **i18n:** next-intl.
- **AI:** OpenAI API с серверной обёрткой, rate-limit и graceful fallback.
- **Тесты:** Vitest + Testing Library, Playwright e2e.
- **Инфраструктура:** ESLint, Prettier, GitHub Actions CI (lint/test/build).

## Быстрый старт

### Требования

- Node.js ≥ 18.17
- pnpm (предпочтительно) или npm/yarn

### Установка

```bash
pnpm install
cp .env.example .env
```

Отредактируйте `.env`:

- `DATABASE_URL` (по умолчанию SQLite `file:./dev.db`; для PostgreSQL укажите свой URL)
- `DATABASE_PROVIDER` (`sqlite` или `postgresql`; auto-дект по URL, но переменная помогает при билд-сценариях)
- `SHADOW_DATABASE_URL` (только для PostgreSQL, можно удалить строку для SQLite)
- `NEXTAUTH_SECRET`, SMTP-конфигурация для magic link (в dev можно оставить по умолчанию)
- `OPENAI_API_KEY` (опционально; без ключа используется фоллбек)
- `DEMO_LOGIN_TOKEN` — токен для демо-входа (по умолчанию `demo`)

### Миграции и сиды

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

Скрипт `pnpm prisma …` автоматически выбирает провайдера на основе `DATABASE_PROVIDER`/`DATABASE_URL`. Для SQLite команды `prisma migrate dev/deploy` прозрачно заменяются на `prisma db push`, чтобы держать схему в актуальном состоянии без конфликтов миграций. Для PostgreSQL применяется стандартный `migrate`. Новые миграции рекомендуется генерировать в окружении с `DATABASE_PROVIDER=postgresql`.

### Запуск дев-сервера

```bash
pnpm dev
```

Приложение доступно на `http://localhost:3000/ru`. Для быстрого входа в dev-режиме доступна кнопка «Войти как демо-пользователь» (`DEMO_LOGIN_TOKEN`).

### Сборка и запуск production-сборки

```bash
pnpm build
pnpm start
```

## Скрипты

| Команда | Назначение |
| --- | --- |
| `pnpm dev` | Запуск Next.js в режиме разработки |
| `pnpm build` | Production-сборка |
| `pnpm start` | Запуск production-сервера |
| `pnpm lint` | ESLint с настройками проекта |
| `pnpm test` | Unit-тесты (Vitest) |
| `pnpm test:watch` | Vitest в watch-режиме |
| `pnpm test:e2e` | Playwright e2e-сценарий |
| `pnpm prisma:dev` | Применение миграций (или `db push` для SQLite) |
| `pnpm prisma:seed` | Запуск сидера |
| `pnpm ci` | Локальный аналог GitHub Actions (lint + typecheck + test + build) |

## Структура проекта

```
src/
  app/               # App Router: страницы, API-роуты
  components/        # UI-kit, модули, модальные окна
  features/          # Фичи: онбординг, билдер, шаблоны, библиотека, настройки
  i18n/              # Конфигурация next-intl и переводов
  lib/               # Утилиты, OpenAI wrapper, Prisma client, шаблоны
  providers/         # Глобальные провайдеры (theme, session, query)
  store/             # Zustand-хранилища (онбординг, модалки)
  types/             # Общие типы (domain, NextAuth)
prisma/              # Prisma schema + сиды
public/              # Публичные ассеты (при необходимости)
tests/               # Playwright e2e
```

Более подробное описание потоков и архитектуры — в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Руководство по шаблонам и переменным — в [docs/TEMPLATES.md](docs/TEMPLATES.md).

## Тестирование

```bash
pnpm lint
pnpm test
pnpm test:e2e
```

Перед запуском e2e не забудьте применить миграции и сиды. Playwright использует `pnpm dev` как webServer и демо-вход по токену.

## Настройка OpenAI

- API-ключ хранится только на сервере (через `/api/settings/openai`), хэшируется и не возвращается клиенту.
- При отсутствии ключа генерация использует fallback (готовый шаблон + стратегии инструмента).
- В `env` можно настроить `RATE_LIMIT_MAX_REQUESTS` и `RATE_LIMIT_WINDOW_SECONDS`.

## Аутентификация

- Email magic link (SMTP обязательный для production; в dev ссылки логируются в консоль).
- Демо-вход через Credentials Provider (доступен вне production).

## Импорт/экспорт шаблонов

В настройках доступны кнопки экспорта в JSON и импорта пользовательских шаблонов. Формат описан в [docs/TEMPLATES.md](docs/TEMPLATES.md).

## CI/CD

В `.github/workflows/ci.yml` настроен пайплайн: установка зависимостей, миграции, `lint`, `test`, `build`. Для GitHub Actions достаточно настроить переменные окружения (`DATABASE_URL`, `NEXTAUTH_SECRET` и т.д.).

## Полезные заметки

- Zustand store для онбординга сохраняется в `localStorage`. Для сброса используйте кнопку в настройках или очистите хранилище.
- Rate limit реализован in-memory — подходит для dev/staging. Для production рекомендуется внешнее хранилище.
- Все основные UI-компоненты покрыты снапшотами/юнит-тестами (Vitest), e2e проходит сценарий «онбординг → генерация → сохранение → библиотека».

Удачных промптов! 🚀
