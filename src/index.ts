import DuplicateDefinitionError from './duplicate-definition-error';
import { type ControllerDefinition, parseControllers } from './utils';

import type { BunPlugin } from 'bun';

export type BunStimulusPluginDuplicateDefinition = 'error' | 'ignore' | 'replace';

/**
 * Options for the Bun Stimulus plugin duplicate definition handling option.
 */
export type BunStimulusPluginDuplicateDefinitionHandling =
  | BunStimulusPluginDuplicateDefinition
  | ((
      exisitingDefinition: ControllerDefinition,
      duplicateDefinition: ControllerDefinition,
    ) => BunStimulusPluginDuplicateDefinition);

/**
 * Options for the Bun Stimulus plugin.
 */
export type BunStimulusPluginOptions = {
  /**
   * If set to true, the plugin will throw an error if a given path is not a directory. Otherwise, it will simply ignore the path.
   * Defaults to `true`.
   *
   * @since 1.0.0
   */
  strict: boolean;
  /**
   * The suffix of the controller files to load. Will be removed from the controller's name.
   * Defaults to `(-|_)controller.(js|ts|jsx|tsx)$`.
   *
   * @since 1.0.0
   */
  controllerSuffix: RegExp | null;
  /**
   * The suffix of the directory to load. Will be removed from the controller's name.
   * This option is the same as the `controllerSuffix` option, but for controllers found using the `directoryIdentifier` option.
   * Defaults to `null`.
   *
   * @since 2.0.0
   */
  controllerDirectorySuffix: RegExp | null;
  /**
   * The glob pattern to use to identify files that should be registered with their file name.
   * Set to `null` to disable this feature. Defaults to `**\/*`.
   *
   * @since 2.0.0
   */
  fileIdentifier: string | null;
  /**
   * The glob pattern to use to identify files that should be registered with their parent directory name.
   * Set to `null` to disable this feature. Defaults to `null`.
   *
   * @since 2.0.0
   */
  directoryIdentifier: string | null;
  /**
   * How to handle duplicate controller definitions. Duplicate definitions can either be ignored, replaced, or throw an error.
   * A callback can also be provided to handle the duplicate definitions. It should return either `error`, `ignore`, or `replace`.
   * Defaults to `ignore`.
   *
   * @since 2.0.0
   */
  duplicateDefinitionHandling: BunStimulusPluginDuplicateDefinitionHandling;
};

/**
 * The identifier used by the plugin to resolve the import path.
 */
const identifier = 'stimulus:';
/**
 * The namespace used by the plugin.
 */
const namespace = 'bun-stimulus-plugin';
/**
 * The default options for the plugin.
 */
const defaultOptions: BunStimulusPluginOptions = {
  strict: true,
  controllerSuffix: /(-|_)controller.(js|ts|jsx|tsx)$/gi,
  controllerDirectorySuffix: null,
  fileIdentifier: '**/*',
  directoryIdentifier: null,
  duplicateDefinitionHandling: 'ignore',
};

export const bunStimulusPlugin = (
  bunStimulusPluginOptions: Partial<BunStimulusPluginOptions> = defaultOptions,
): BunPlugin => ({
  name: 'bun-stimulus-plugin',
  async setup(build) {
    const { existsSync, statSync } = await import('node:fs');
    const { join, sep } = await import('node:path');
    const options = { ...defaultOptions, ...bunStimulusPluginOptions };

    // We firstly need to resolve the import path. We technically only need to remove the `stimulus:` prefix
    // But we also need to deal with the `/` and `\` path separators (depending on the OS)
    // And figure out if the path is relative or not
    build.onResolve({ filter: /^stimulus:./ }, (args) => {
      // Remove the `stimulus:` prefix (e.g. `stimulus:./controllers` -> `./controllers`)
      const importPath = args.path.substring(identifier.length).replace(/\//g, sep);
      // Get the full path of the file that imported the controller (most likely where the app is being initialized)
      const relativePath = args.importer.substring(0, args.importer.lastIndexOf(sep));

      // TODO - This is a bit hacky, but it works for now
      // Should use args.resolveDir instead once it's implemented
      // See https://github.com/oven-sh/bun/pull/3230
      let finalPath = importPath;

      // If the path exists then we assume it's a relative path
      if (existsSync(join(relativePath, importPath))) {
        finalPath = join(relativePath, importPath);
      }

      return {
        path: finalPath,
        namespace,
      };
    });

    // @ts-expect-error The "errors" return is not yet supported by Bun
    build.onLoad({ filter: /.*/, namespace }, (args) => {
      const pathStats = existsSync(args.path) ? statSync(args.path) : null;

      // Maybe this needs to be a bit more robust once args.resolveDir is implemented
      // For now, this will handle cases where the folder doesn't exist or the path is not a directory
      if (!pathStats?.isDirectory()) {
        if (options.strict) {
          return { errors: [{ text: `Path "${args.path}" is not a directory.` }] };
        }

        // Return empty definitions
        return {
          contents: 'export default [];',
          loader: 'js',
        };
      }

      try {
        // Will contain all the controller definitions exported as default
        const parsedControllers = parseControllers(args.path, { options });
        const { definitions } = parsedControllers;

        /*
          This will look something like this:
          import my_controller1 from './controllers/my_controller_controller';

          export default [
            {identifier: 'my_controller', controllerConstructor: my_controller1},
          ];
        */
        let { contents } = parsedControllers;

        // Export the controller definitions
        // Will be used like this: `import definitions from 'stimulus:./controllers';`
        contents += 'export default [';

        for (const [index, definition] of definitions.entries()) {
          contents += `{identifier: '${definition.identifier}', controllerConstructor: ${definition.name}}${
            index < definitions.length - 1 ? ',' : ''
          }`;
        }

        contents += '];';

        return {
          contents,
          loader: 'js',
        };
      } catch (error) {
        if (error instanceof DuplicateDefinitionError) {
          return {
            errors: [
              {
                text: error.message,
              },
            ],
          };
        }

        throw error;
      }
    });
  },
});
