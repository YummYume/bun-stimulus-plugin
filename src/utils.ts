import { join } from 'node:path';

import DuplicateDefinitionError from './duplicate-definition-error';

import type { BunStimulusPluginOptions } from '.';

/**
 * A controller file definition.
 */
export type ControllerFile = {
  /**
   * The parsed name of the controller.
   */
  name: string;
  /**
   * The absolute path to the controller file.
   */
  path: string;
};

/**
 * A controller definition. This is the shape Stimulus expects for controller definitions, minus the path.
 */
export type ControllerDefinition = {
  /**
   * The identifier of the controller.
   */
  identifier: string;
  /**
   * The name the controller will be assigned to.
   */
  name: string;
  /**
   * The absolute path to the controller file.
   */
  path: string;
};

/**
 * The parameters for the `parseControllers` function.
 */
export type ParseControllersOptions = {
  /**
   * The options for the plugin.
   */
  options: BunStimulusPluginOptions;
};

/**
 * Parses the controller name to make sure it's a valid identifier.
 *
 * @param controllerName The name of the controller.
 * @returns The parsed controller name.
 */
export const parseControllerName = (controllerName: string) => controllerName.replace(/[^a-zA-Z0-9 ]/g, '_');

/**
 * Parse all the controllers in the given path and handle nested controllers.
 * Also handles directory-based controllers since 2.0.0.
 *
 * @param controllersPath The path to the controllers.
 * @param params The parameters for the parsing.
 * @returns An array of controller definitions and the import statements for the controllers.
 */
export const parseControllers = (controllersPath: string, params: ParseControllersOptions) => {
  const { options } = params;
  const definitions: ControllerDefinition[] = [];
  const controllerFiles: ControllerFile[] = [];

  if (options.fileIdentifier) {
    // Find all the file-based controllers
    const files = new Bun.Glob(options.fileIdentifier);

    for (const file of files.scanSync({ cwd: controllersPath })) {
      // my/path/to/test_controller.js -> ['my', 'path', 'to', 'test_controller.js']
      const filePath = file.split('/');
      // test_controller.js
      const fileName = filePath.at(-1);
      // Check if the file name matches the suffix (if it's set)
      const suffixMatch = options.controllerSuffix && fileName ? options.controllerSuffix.test(fileName) : true;

      if (fileName && suffixMatch) {
        // my/path/to/test_controller.js -> absolute-path-to-controllersPath/my/path/to/test_controller.js
        const controllerPath = join(controllersPath, file);
        // ['my', 'path', 'to', 'test_controller.js'] -> ['my', 'path', 'to']
        const filePathWithoutFileName = filePath.slice(0, -1);
        // test_controller.js -> test
        const fileNameWithoutSuffix = options.controllerSuffix
          ? fileName.replace(options.controllerSuffix, '')
          : fileName;

        controllerFiles.push({
          // ['my', 'path', 'to', 'test'] -> my--path--to--test
          name: [...filePathWithoutFileName, fileNameWithoutSuffix].join(options.directorySeparator),
          path: controllerPath,
        });
      }
    }
  }

  if (options.directoryIdentifier) {
    // Find all the directory-based controllers
    const directories = new Bun.Glob(options.directoryIdentifier);

    for (const directory of directories.scanSync({ cwd: controllersPath })) {
      // path/to/test_controller/index.js -> ['path', 'to', 'test_controller', 'index.js']
      const directoryPath = directory.split('/');
      // test_controller (or null if it's the root directory)
      const directoryName = directoryPath.length > 1 ? directoryPath.at(-2) : null;
      // Check if the directory name matches the suffix (if it's set)
      const suffixMatch =
        options.controllerDirectorySuffix && directoryName
          ? options.controllerDirectorySuffix.test(directoryName)
          : true;

      if (directoryName && suffixMatch) {
        // path/to/test_controller/index.js -> absolute-path-to-controllersPath/path/to/test_controller/index.js
        const controllerPath = join(controllersPath, directory);
        // ['path', 'to', 'test_controller', 'index.js'] -> ['path', 'to', 'index.js']
        const directoryPathWithoutDirectoryName = directoryPath.slice(0, -2);
        // test_controller -> test
        const directoryNameWithoutSuffix = options.controllerDirectorySuffix
          ? directoryName.replace(options.controllerDirectorySuffix, '')
          : directoryName;

        controllerFiles.push({
          // ['path', 'to', 'test'] -> path--to--test
          name: [...directoryPathWithoutDirectoryName, directoryNameWithoutSuffix].join(options.directorySeparator),
          path: controllerPath,
        });
      }
    }
  }

  for (const [id, controllerFile] of controllerFiles.entries()) {
    const controllerName = controllerFile.name;
    // Controller name should be unique, so we'll add a number to the end of it
    const uniqueControllerName = `${parseControllerName(controllerName)}${id}`;
    // Check if the controller name is already in the definitions
    const duplicatedDefinition = definitions.find((definition) => definition.identifier === controllerName);

    // Handle duplicate definitions
    if (duplicatedDefinition) {
      const handling =
        typeof options.duplicateDefinitionHandling === 'function'
          ? options.duplicateDefinitionHandling(
              { ...duplicatedDefinition, path: duplicatedDefinition.path },
              { identifier: controllerName, name: uniqueControllerName, path: controllerFile.path },
            )
          : options.duplicateDefinitionHandling;

      if (handling === 'error') {
        // Throw an error if the handling is set to 'error'
        throw new DuplicateDefinitionError(
          { ...duplicatedDefinition, path: duplicatedDefinition.path },
          { identifier: controllerName, name: uniqueControllerName, path: controllerFile.path },
        );
      } else if (handling === 'replace') {
        // Replace the existing definition with the new one if the handling is set to 'replace'
        const index = definitions.findIndex((definition) => definition.identifier === controllerName);

        definitions[index] = {
          identifier: controllerName,
          name: uniqueControllerName,
          path: controllerFile.path,
        };
      }

      // Else, ignore the duplicate definition
    } else {
      definitions.push({
        identifier: controllerName,
        name: uniqueControllerName,
        path: controllerFile.path,
      });
    }
  }

  // Write the import statements
  const contents = definitions.map((definition) => `import ${definition.name} from '${definition.path}';`).join('');

  return { definitions: definitions.map(({ identifier, name }) => ({ identifier, name })), contents };
};
