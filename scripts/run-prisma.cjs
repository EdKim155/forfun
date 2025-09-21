#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);

const hasSchemaFlag = args.some(
  (arg, index) =>
    arg === '--schema' ||
    arg.startsWith('--schema=') ||
    (arg === '-s' && typeof args[index + 1] === 'string')
);

const prismaBinary = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

if (!fs.existsSync(prismaBinary)) {
  console.error('Prisma CLI is not installed. Did you run pnpm install?');
  process.exit(1);
}

if (hasSchemaFlag) {
  const result = spawnSync(prismaBinary, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_HIDE_UPDATE_MESSAGE: '1',
    },
  });
  process.exit(result.status ?? 1);
}

const baseDir = path.join(__dirname, '..', 'prisma');
const baseSchemaPath = path.join(baseDir, 'schema.prisma');

if (!fs.existsSync(baseSchemaPath)) {
  console.error('Could not find prisma/schema.prisma');
  process.exit(1);
}

const provider = resolveProvider();

const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');
const providerPattern = /provider\s*=\s*"(sqlite|postgresql)"/;

if (!providerPattern.test(baseSchema)) {
  console.error(
    'Unable to locate provider declaration in prisma/schema.prisma. Expected a line like `provider = "sqlite"`.'
  );
  process.exit(1);
}

const renderedSchema = baseSchema.replace(providerPattern, `provider = "${provider}"`);
const generatedRoot = path.join(baseDir, '.generated', provider);
const generatedSchemaPath = path.join(generatedRoot, 'schema.prisma');

fs.rmSync(generatedRoot, { recursive: true, force: true });
fs.mkdirSync(generatedRoot, { recursive: true });
fs.writeFileSync(generatedSchemaPath, renderedSchema);

const baseMigrationsDir = path.join(baseDir, 'migrations');
if (fs.existsSync(baseMigrationsDir)) {
  const generatedMigrationsDir = path.join(generatedRoot, 'migrations');
  fs.cpSync(baseMigrationsDir, generatedMigrationsDir, { recursive: true });

  const lockPath = path.join(generatedMigrationsDir, 'migration_lock.toml');
  if (fs.existsSync(lockPath)) {
    const lockContent = fs.readFileSync(lockPath, 'utf8');
    const updatedLock = lockContent.replace(
      /provider\s*=\s*"(sqlite|postgresql)"/,
      `provider = "${provider}"`
    );
    fs.writeFileSync(lockPath, updatedLock);
  }
}

const prismaArgs = transformArgsForProvider(provider, args);

const result = spawnSync(prismaBinary, [...prismaArgs, '--schema', generatedSchemaPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PRISMA_HIDE_UPDATE_MESSAGE: '1',
    PRISMA_SCHEMA_PATH: generatedSchemaPath,
  },
});

process.exit(result.status ?? 1);

function resolveProvider() {
  const explicit = process.env.DATABASE_PROVIDER;
  if (explicit && isSupportedProvider(explicit)) {
    return explicit;
  }

  if (explicit && !isSupportedProvider(explicit)) {
    console.warn(
      `Unsupported DATABASE_PROVIDER "${explicit}". Falling back to auto-detection.`
    );
  }

  const url = process.env.DATABASE_URL;
  if (typeof url === 'string' && url.length > 0) {
    if (url.startsWith('file:')) return 'sqlite';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      return 'postgresql';
    }
  }

  return process.env.NODE_ENV === 'production' ? 'postgresql' : 'sqlite';
}

function isSupportedProvider(value) {
  return value === 'sqlite' || value === 'postgresql';
}

function transformArgsForProvider(provider, originalArgs) {
  if (provider !== 'sqlite') {
    return originalArgs;
  }

  if (originalArgs[0] === 'migrate') {
    const subcommand = originalArgs[1];
    if (subcommand === 'dev' || subcommand === 'deploy') {
      const rest = originalArgs.slice(2);
      console.info(
        `SQLite datasource detected. Substituting \`prisma migrate ${subcommand}\` with \`prisma db push\` to keep the schema in sync.`
      );
      return ['db', 'push', ...rest];
    }
  }

  return originalArgs;
}
