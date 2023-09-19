/* eslint-disable no-console */
/// <reference lib="dom" />

import { test, expect, describe, beforeAll, beforeEach, afterAll } from 'bun:test';

import { rmSync } from 'node:fs';

import { bunStimulusPlugin } from '../src';

const importDefinitions = (name: string) => {
  try {
    const definitions = JSON.parse(
      document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? '[]',
    ) as string[];

    return definitions;
  } catch (error) {
    return [];
  }
};

// Build the app before running tests
beforeAll(async () => {
  await Bun.build({
    entrypoints: ['./test/src/app.ts'],
    outdir: './test/dist',
    target: 'browser',
    splitting: true,
    format: 'esm',
    minify: true,
    naming: '[dir]/[name].[ext]',
    plugins: [
      bunStimulusPlugin({
        strict: false,
      }),
    ],
  });

  const app = Bun.file('./test/dist/app.js');
  const appContent = await app.text();

  // Setup the DOM
  document.write(`
    <html>
      <head>
        <script type="text/javascript">${appContent}</script>
      </head>
      <body></body>
    </html>
  `);
});

// Delete the built app after running tests
afterAll(() => {
  rmSync('./test/dist', { recursive: true });
});

// Reset the DOM before each test
beforeEach(() => {
  document.body.innerHTML = '';
  // document.head.querySelectorAll<HTMLMetaElement>('meta').forEach((meta) => meta.remove());
});

// Ensure controllers are registered and work properly
describe('Controllers', () => {
  test('Non-nested relative controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="relative"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Relative controller!');
  });

  test('Nested relative controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="nested--relative"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Nested relative controller!');
  });

  // TODO: Remove skip once custom paths are supported
  test.skip('Non-nested custom controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="custom"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Custom controller!');
  });

  // TODO: Remove skip once custom paths are supported
  test.skip('Nested custom controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="nested--custom"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Nested custom controller!');
  });

  test('Non-nested absolute controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="absolute"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Absolute controller!');
  });

  test('Nested absolute controller is registered and works', () => {
    document.body.innerHTML = `<p data-controller="nested--absolute"></p>`;

    const result = document.querySelector('p');

    expect(result?.textContent).toBe('Nested absolute controller!');
  });
});

// Ensure controller definitions match the expected values
describe('Controller definitions', () => {
  const relativeDefinitions = ['relative', 'nested--relative'];
  const customDefinitions = ['custom', 'nested--custom'];
  const absoluteDefinitions = ['absolute', 'nested--absolute'];

  test('Definitions for relative controllers are valid', () => {
    const definitions = importDefinitions('relative-definitions');

    expect(definitions).toBeArrayOfSize(relativeDefinitions.length);
    expect(definitions.sort()).toEqual(relativeDefinitions.sort());
  });

  // TODO: Remove skip once custom paths are supported
  test.skip('Definitions for custom controllers are valid', () => {
    const definitions = importDefinitions('custom-definitions');

    expect(definitions).toBeArrayOfSize(customDefinitions.length);
    expect(definitions.sort()).toEqual(customDefinitions.sort());
  });

  test('Definitions for absolute controllers are valid', () => {
    const definitions = importDefinitions('absolute-definitions');

    expect(definitions).toBeArrayOfSize(absoluteDefinitions.length);
    expect(definitions.sort()).toEqual(absoluteDefinitions.sort());
  });

  test('Invalid definitions are empty (when strict is false)', () => {
    const definitions = importDefinitions('invalid-definitions');

    expect(definitions).toEqual([]);
  });
});

// Ensure options work properly
describe('Options', () => {
  test('Strict option results in build failure with invalid controller path', async () => {
    const build = await Bun.build({
      entrypoints: ['./test/src/app.ts'],
      outdir: './test/dist/strict',
      target: 'browser',
      splitting: true,
      format: 'esm',
      minify: true,
      naming: '[dir]/[name].[ext]',
      plugins: [
        bunStimulusPlugin({
          strict: true,
        }),
      ],
    });

    expect(build.success).toBe(false);
  });

  test('Directory separator option works', async () => {
    await Bun.build({
      entrypoints: ['./test/src/options/app-directory-separator.ts'],
      outdir: './test/dist',
      target: 'browser',
      splitting: true,
      format: 'esm',
      minify: true,
      naming: '[dir]/[name].[ext]',
      plugins: [
        bunStimulusPlugin({
          strict: false,
          directorySeparator: '__',
        }),
      ],
    });

    const app = Bun.file('./test/dist/app-directory-separator.js');
    const appContent = await app.text();

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = appContent;

    document.head.appendChild(script);

    const definitions = importDefinitions('directory-separator-definitions');

    expect(definitions).toContain('nested__relative');
  });

  test('Controller suffix option works', async () => {
    await Bun.build({
      entrypoints: ['./test/src/options/app-suffix.ts'],
      outdir: './test/dist',
      target: 'browser',
      splitting: true,
      format: 'esm',
      minify: true,
      naming: '[dir]/[name].[ext]',
      plugins: [
        bunStimulusPlugin({
          strict: false,
          controllerSuffix: /_ctrl.ts$/gi,
        }),
      ],
    });

    const app = Bun.file('./test/dist/app-suffix.js');
    const appContent = await app.text();

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = appContent;

    document.head.appendChild(script);

    const definitions = importDefinitions('suffix-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toEqual(['relative']);
  });
});
