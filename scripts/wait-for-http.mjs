#!/usr/bin/env node

import http from 'node:http';
import https from 'node:https';
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

function requestOnce(targetUrl, requestTimeoutMs) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const request = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port ? Number(url.port) : isHttps ? 443 : 80,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          Accept: '*/*',
          Connection: 'close',
        },
      },
      (response) => {
        response.resume();
        resolve({ statusCode: response.statusCode ?? 0 });
      },
    );

    request.on('error', reject);

    if (requestTimeoutMs > 0) {
      request.setTimeout(requestTimeoutMs, () => {
        request.destroy(new Error('Request timeout'));
      });
    }

    request.end();
  });
}

async function waitForHttp(targetUrl, { timeoutMs, intervalMs, requestTimeoutMs }) {
  const startTime = Date.now();
  let lastError = null;

  while (Date.now() - startTime <= timeoutMs) {
    try {
      const result = await requestOnce(targetUrl, requestTimeoutMs);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const detail = lastError ? ` Last error: ${lastError.message}` : '';
  throw new Error(`Timed out waiting for ${targetUrl}.${detail}`.trim());
}

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  process.stdout.write(
    [
      'Usage:',
      '  node scripts/wait-for-http.mjs --url http://127.0.0.1:8081',
      '',
      'Options:',
      '  --url               Target URL (required)',
      '  --timeout-ms        Total timeout (default: 60000)',
      '  --interval-ms       Retry interval (default: 500)',
      '  --request-timeout-ms Single request timeout (default: 1500)',
      '',
    ].join('\n'),
  );
  process.exit(0);
}

const targetUrl = typeof args.url === 'string' ? args.url : '';

if (!targetUrl) {
  process.stderr.write('Missing required argument --url\n');
  process.exit(1);
}

const timeoutMs = toNumber(args['timeout-ms'], 60_000);
const intervalMs = toNumber(args['interval-ms'], 500);
const requestTimeoutMs = toNumber(args['request-timeout-ms'], 1500);

try {
  const result = await waitForHttp(targetUrl, { timeoutMs, intervalMs, requestTimeoutMs });
  process.stdout.write(`ready ${targetUrl} status=${result.statusCode}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

