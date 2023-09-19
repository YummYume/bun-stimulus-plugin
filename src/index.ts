import { type BunPlugin } from 'bun';

export type BunStimulusPluginOptions = {
  /**
   * If set to true, the plugin will throw an error if a given path is not a directory. Otherwise, it will simply ignore the path. Defaults to `true`.
   */
  strict: boolean;
  /**
   * The suffix of the controller files to load. Defaults to `(-|_)controller.(js|ts|jsx|tsx)$`.
   */
  controllerSuffix: RegExp;
  /**
   * The directory separator to use when parsing nested controllers. Defaults to '--'.
   */
  directorySeparator: string;
};

type ControllerDefinition = {
  identifier: string;
  name: string;
};

const identifier = 'stimulus:';
const namespace = 'bun-stimulus-plugin';
const defaultOptions: BunStimulusPluginOptions = {
  strict: true,
  controllerSuffix: /(-|_)controller.(js|ts|jsx|tsx)$/gi,
  directorySeparator: '--',
};
const parseControllerName = (controllerName: string) => controllerName.replace(/[^a-zA-Z0-9 ]/g, '_');

export const bunStimulusPlugin = (
  bunStimulusPluginOptions: Partial<BunStimulusPluginOptions> = defaultOptions,
): BunPlugin => ({
  name: 'bun-stimulus-plugin',
  async setup(build) {
    const { existsSync, readdirSync, statSync } = await import('node:fs');
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

      // Will contain all the controller definitions exported as default
      const definitions: ControllerDefinition[] = [];

      /*
        This will look something like this:
        import my_controller1 from './controllers/my_controller_controller';

        export default [
          {identifier: 'my_controller', controllerConstructor: my_controller1},
        ];
      */
      let contents = '';
      let i = 0;

      // Will return an array of controller names or directories
      const getControllersFromPath = (controllersPath: string) =>
        readdirSync(controllersPath).filter((file) => {
          const fileStats = statSync(join(controllersPath, file));

          return fileStats.isDirectory() || file.match(options.controllerSuffix);
        });
      // Parse all the controllers in the given path and handle nested controllers
      const parseControllers = (controllersPath: string, prefix: string = '') => {
        const controllersFromPath = getControllersFromPath(controllersPath);

        for (const controller of controllersFromPath) {
          const controllerPath = join(controllersPath, controller);
          const controllerStats = statSync(controllerPath);
          // Name of the controller without the suffix and with directory separators
          const controllerName = `${prefix}${controller.replace(options.controllerSuffix, '')}`;

          if (controllerStats.isDirectory()) {
            // Recursively parse the controllers
            parseControllers(controllerPath, `${controllerName}${options.directorySeparator}`);
          } else {
            // Controller name should be unique, so we'll add a number to the end of it
            const uniqueControllerName = `${parseControllerName(controllerName)}${(i += 1)}`;

            // Import the controller
            contents += `import ${uniqueControllerName} from '${join(
              args.path,
              ...prefix.split(options.directorySeparator),
              controller,
            )}';`;

            definitions.push({
              identifier: controllerName,
              name: uniqueControllerName,
            });
          }
        }
      };

      parseControllers(args.path);

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
    });
  },
});
