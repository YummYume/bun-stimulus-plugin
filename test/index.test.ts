/// <reference lib="dom" />

import { rmSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import { bunStimulusPlugin } from '../src';
import { appendScriptToDocument, buildWithEntrypointAndOptions, importDefinitions, removeMeta } from './utils';

import type { Window } from 'happy-dom';

declare const window: Window;

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
});

// Ensure controllers are registered and work properly
describe('Controllers', () => {
  test('Non-nested relative controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="relative"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Relative controller!');
  });

  test('Nested relative controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="nested--relative"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Nested relative controller!');
  });

  // TODO: Remove skip once custom paths are supported
  test.skip('Non-nested custom controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="custom"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Custom controller!');
  });

  // TODO: Remove skip once custom paths are supported
  test.skip('Nested custom controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="nested--custom"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Nested custom controller!');
  });

  test('Non-nested absolute controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="absolute"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Absolute controller!');
  });

  test('Nested absolute controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="nested--absolute"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Nested absolute controller!');
  });

  test('Non-nested long name controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="relative-long-name"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Relative long name controller!');
  });

  test('Nested long name controller is registered and works', async () => {
    document.body.innerHTML = `<p data-controller="nested--relative-long-name"></p>`;

    const result = document.querySelector('p');

    await window.happyDOM.waitUntilComplete();

    expect(result?.textContent).toBe('Nested Relative long name controller!');
  });
});

// Ensure controller definitions match the expected values
// Note: These tests use the already appended meta tags from the 'Controllers' tests
describe('Controller definitions', () => {
  const relativeDefinitions = ['relative', 'nested--relative'];
  const relativeLongNameDefinitions = ['relative-long-name', 'nested--relative-long-name'];
  const customDefinitions = ['custom', 'nested--custom'];
  const absoluteDefinitions = ['absolute', 'nested--absolute'];

  test('Definitions for relative controllers are valid', () => {
    const definitions = importDefinitions('relative-definitions');

    expect(definitions).toBeArrayOfSize(relativeDefinitions.length);
    expect(definitions.sort()).toEqual(relativeDefinitions.sort());
  });

  test('Definitions for relative long name controllers are valid', () => {
    const definitions = importDefinitions('relative-long-name-definitions');
    expect(definitions).toBeArrayOfSize(relativeLongNameDefinitions.length);
    expect(definitions).toEqual(relativeLongNameDefinitions);
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

  test('Controller suffix option works', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-suffix.ts', {
      strict: false,
      controllerSuffix: /_ctrl.ts$/gi,
    });

    appendScriptToDocument(appContent);

    const definitions = importDefinitions('suffix-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toEqual(['relative']);
  });

  test('Directory-based controllers should be registered', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-directory-controllers.ts', {
      strict: false,
      fileIdentifier: null,
      directoryIdentifier: '**/controller.ts',
    });

    appendScriptToDocument(appContent);

    const definitions = importDefinitions('directory-definitions');

    expect(definitions).toBeArrayOfSize(2);
    expect(definitions.sort()).toEqual(['directory', 'directory-controller'].sort());
  });

  test('Directory-based controllers with suffix should work', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-directory-controllers.ts', {
      strict: false,
      fileIdentifier: null,
      directoryIdentifier: '**/controller.ts',
      controllerDirectorySuffix: /_controller$/gi,
    });

    removeMeta('directory-definitions');
    appendScriptToDocument(appContent);

    const definitions = importDefinitions('directory-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toContain('directory');
  });

  test('Duplicate controller with "ignore" should only register once', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-duplicate-handling.ts', {
      strict: false,
      directoryIdentifier: '**/controller.ts',
    });

    appendScriptToDocument(appContent);

    const definitions = importDefinitions('duplicate-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toContain('duplicate');
  });

  test('Duplicate controller with "replace" should only register once', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-duplicate-handling.ts', {
      strict: false,
      directoryIdentifier: '**/controller.ts',
      duplicateDefinitionHandling: 'replace',
    });

    removeMeta('duplicate-definitions');
    appendScriptToDocument(appContent);

    const definitions = importDefinitions('duplicate-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toContain('duplicate');
  });

  test('Duplicate controller with "error" should fail build', async () => {
    const build = await Bun.build({
      entrypoints: ['./test/src/options/app-duplicate-handling.ts'],
      outdir: './test/dist/strict',
      target: 'browser',
      splitting: true,
      format: 'esm',
      minify: true,
      naming: '[dir]/[name].[ext]',
      plugins: [
        bunStimulusPlugin({
          strict: true,
          directoryIdentifier: '**/controller.ts',
          duplicateDefinitionHandling: 'error',
        }),
      ],
    });

    expect(build.success).toBe(false);
  });

  test('Handling duplicate controllers with callback should work', async () => {
    const appContent = await buildWithEntrypointAndOptions('./test/src/options/app-duplicate-handling.ts', {
      strict: false,
      directoryIdentifier: '**/controller.ts',
      duplicateDefinitionHandling(exisitingDefinition, duplicateDefinition) {
        expect(exisitingDefinition).toHaveProperty('identifier', 'duplicate');
        expect(duplicateDefinition).toHaveProperty('identifier', 'duplicate');

        return 'ignore';
      },
    });

    removeMeta('duplicate-definitions');
    appendScriptToDocument(appContent);

    const definitions = importDefinitions('duplicate-definitions');

    expect(definitions).toBeArrayOfSize(1);
    expect(definitions).toContain('duplicate');
  });
});
