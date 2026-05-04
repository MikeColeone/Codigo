#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument "${token}".`);
    }

    const withoutPrefix = token.slice(2);

    if (!withoutPrefix) {
      throw new Error('Empty flag name is not allowed.');
    }

    if (withoutPrefix.includes('=')) {
      const separatorIndex = withoutPrefix.indexOf('=');
      const key = withoutPrefix.slice(0, separatorIndex);
      const value = withoutPrefix.slice(separatorIndex + 1);
      parsed[key] = value;
      continue;
    }

    const nextToken = rawArgs[index + 1];
    const hasValue = nextToken && !nextToken.startsWith('--');

    if (!hasValue) {
      parsed[withoutPrefix] = true;
      continue;
    }

    parsed[withoutPrefix] = nextToken;
    index += 1;
  }

  return parsed;
}

function toNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function runCommand(command, { name }) {
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.stderr.write(`${name} exited with signal ${signal}\n`);
      return;
    }

    if (typeof code === 'number' && code !== 0) {
      process.stderr.write(`${name} exited with code ${code}\n`);
    }
  });

  return child;
}

async function waitForHttp(targetUrl, { timeoutMs, intervalMs, requestTimeoutMs }) {
  const command = [
    'node',
    'scripts/wait-for-http.mjs',
    `--url=${targetUrl}`,
    `--timeout-ms=${timeoutMs}`,
    `--interval-ms=${intervalMs}`,
    `--request-timeout-ms=${requestTimeoutMs}`,
  ].join(' ');

  await new Promise((resolve, reject) => {
    const child = runCommand(command, { name: 'wait-for-http' });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`wait-for-http failed with code ${code ?? 1}`));
      }
    });
    child.on('error', reject);
  });
}

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  process.stdout.write(
    [
      'Usage:',
      '  pnpm run run:client-with-ide',
      '',
      'Options:',
      '  --ide-url                 IDE URL to wait for (default: http://127.0.0.1:8081)',
      '  --timeout-ms              Wait timeout (default: 60000)',
      '  --interval-ms             Retry interval (default: 500)',
      '  --request-timeout-ms      Single request timeout (default: 1500)',
      '',
    ].join('\n'),
  );
  process.exit(0);
}

const ideUrl = typeof args['ide-url'] === 'string' ? args['ide-url'] : 'http://127.0.0.1:8081';
const timeoutMs = toNumber(args['timeout-ms'], 60_000);
const intervalMs = toNumber(args['interval-ms'], 500);
const requestTimeoutMs = toNumber(args['request-timeout-ms'], 1500);

const ideChild = runCommand('pnpm --filter @codigo/opensumi-app run dev', { name: 'ide' });

let shuttingDown = false;
const children = new Set([ideChild]);

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    try {
      child.kill('SIGINT');
    } catch {}
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

ideChild.on('exit', (code) => {
  if (!shuttingDown) {
    shutdown(typeof code === 'number' ? code : 1);
  }
});

try {
  await waitForHttp(ideUrl, { timeoutMs, intervalMs, requestTimeoutMs });
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  shutdown(1);
}

const clientChild = runCommand('pnpm --filter @codigo/client run dev', { name: 'client' });
children.add(clientChild);

clientChild.on('exit', (code) => {
  if (!shuttingDown) {
    shutdown(typeof code === 'number' ? code : 1);
  }
});

