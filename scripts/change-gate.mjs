import { execSync } from 'node:child_process';

/**
 * @param {string[]} args
 * @param {string} name
 */
function getArgValue(args, name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

/**
 * @param {string} cmd
 */
function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8').trim();
}

/**
 * @param {string} s
 */
function lines(s) {
  return s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * @param {string[]} changedFiles
 * @param {RegExp[]} patterns
 */
function matchesAny(changedFiles, patterns) {
  return changedFiles.some((f) => patterns.some((p) => p.test(f)));
}

/**
 * @param {string[]} changedFiles
 * @param {RegExp[]} requiredAnyOf
 */
function requireDocsChange(changedFiles, requiredAnyOf, message) {
  if (matchesAny(changedFiles, requiredAnyOf)) return [];
  return [message];
}

const argv = process.argv.slice(2);
const baseArg = getArgValue(argv, '--base') ?? process.env.BASE_SHA ?? process.env.GITHUB_BASE_SHA ?? null;
const headArg = getArgValue(argv, '--head') ?? process.env.HEAD_SHA ?? process.env.GITHUB_HEAD_SHA ?? null;

let base = baseArg;
let head = headArg;

try {
  if (!head) head = run('git rev-parse HEAD');
  if (!base) {
    const defaultBase = run('git merge-base origin/main HEAD');
    base = defaultBase || null;
  }
} catch {
  process.stdout.write('changes:gate skipped (git info not available)\n');
  process.exit(0);
}

if (!base || !head) {
  process.stdout.write('changes:gate skipped (missing base/head)\n');
  process.exit(0);
}

let diffNames = '';
try {
  diffNames = run(`git diff --name-only ${base} ${head}`);
} catch (e) {
  process.stderr.write(`changes:gate failed to diff: ${String(e)}\n`);
  process.exit(1);
}

const changedFiles = lines(diffNames);

if (changedFiles.length === 0) {
  process.stdout.write('changes:gate passed (no changes)\n');
  process.exit(0);
}

/** @type {string[]} */
const errors = [];

const apiSurfaceChanged = matchesAny(changedFiles, [
  /^apps\/server\/src\/modules\/.*\/controller\/.*\.(ts|tsx)$/,
  /^apps\/server\/src\/modules\/.*\/dto\/.*\.(ts|tsx)$/,
  /^apps\/server\/src\/core\/guard\/.*\.(ts|tsx)$/,
  /^apps\/server\/src\/core\/filter\/.*\.(ts|tsx)$/,
]);

const dataModelChanged = matchesAny(changedFiles, [
  /^apps\/server\/src\/modules\/.*\/entity\/.*\.(ts|tsx)$/,
  /^apps\/server\/src\/database\/.*\.(ts|tsx)$/,
]);

const workspaceOrArchitectureChanged = matchesAny(changedFiles, [
  /^pnpm-workspace\.yaml$/,
  /^turbo\.json$/,
  /^apps\/[^/]+\/package\.json$/,
  /^packages\/[^/]+\/package\.json$/,
]);

if (apiSurfaceChanged) {
  errors.push(
    ...requireDocsChange(
      changedFiles,
      [/^\.docs\/modules\/02-api-rest\.md$/, /^\.docs\/modules\/03-sequences\.md$/],
      'API 变更检测：修改了后端 Controller/DTO/Guard/Filter，但未更新 .docs/modules/02-api-rest.md 或 .docs/modules/03-sequences.md',
    ),
  );
}

if (dataModelChanged) {
  errors.push(
    ...requireDocsChange(
      changedFiles,
      [/^\.docs\/data\/02-er-and-schema\.md$/, /^\.docs\/data\/03-data-dictionary\.md$/],
      '数据模型变更检测：修改了实体/数据库配置，但未更新 .docs/data/02-er-and-schema.md 或 .docs/data/03-data-dictionary.md',
    ),
  );
}

if (workspaceOrArchitectureChanged) {
  errors.push(
    ...requireDocsChange(
      changedFiles,
      [/^\.trae\/rules\/ARCH\.md$/, /^\.docs\/architecture\/01-overview\.md$/],
      '架构/依赖变更检测：修改了 workspace/turbo/package.json，但未更新 .trae/rules/ARCH.md 或 .docs/architecture/01-overview.md',
    ),
  );
}

if (errors.length > 0) {
  process.stderr.write(`changes:gate failed (${errors.length} issues)\n`);
  for (const err of errors) process.stderr.write(`- ${err}\n`);
  process.stderr.write('\nChanged files:\n');
  for (const f of changedFiles) process.stderr.write(`- ${f}\n`);
  process.exit(1);
} else {
  process.stdout.write('changes:gate passed\n');
}

