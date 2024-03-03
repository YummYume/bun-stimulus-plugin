import { BunStimulusPluginOptions, bunStimulusPlugin } from '../src';

/**
 * Imports the definitions from the given meta tag.
 *
 * @param name The name of the meta tag.
 * @returns The definitions from the meta tag.
 */
export const importDefinitions = (name: string) => {
  try {
    const definitions = JSON.parse(
      document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? '[]',
    ) as string[];

    return definitions;
  } catch (error) {
    return [];
  }
};

/**
 * Removes all meta tags with the given name.
 *
 * @param name The name of the meta tags to remove.
 */
export const removeMeta = (name: string) => {
  const metas = document.head.querySelectorAll<HTMLMetaElement>(`meta[name="${name}"]`);

  metas.forEach((meta) => meta.remove());
};

/**
 * Builds the app with the given entrypoint and options.
 *
 * @param path The name of the entrypoint (located in `test/src/options`).
 * @param options The options to use when building the app.
 * @returns The raw app script.
 */
export const buildWithEntrypointAndOptions = async (entrypoint: string, options: Partial<BunStimulusPluginOptions>) => {
  await Bun.build({
    entrypoints: [entrypoint],
    outdir: './test/dist',
    target: 'browser',
    splitting: true,
    format: 'esm',
    minify: true,
    naming: '[dir]/[name].[ext]',
    plugins: [bunStimulusPlugin(options)],
  });

  const name = entrypoint.split('/').at(-1)?.split('.').at(0);
  const app = Bun.file(`./test/dist/${name}.js`);

  return app.text();
};

/**
 * Appends the given script to the document.
 *
 * @param rawScript The raw script to append to the document.
 */
export const appendScriptToDocument = (rawScript: string) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = rawScript;

  document.head.appendChild(script);
};
