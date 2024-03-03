# Bun Stimulus Plugin

[![CI](https://github.com/YummYume/bun-stimulus-plugin/actions/workflows/ci.yaml/badge.svg)](https://github.com/YummYume/bun-stimulus-plugin/actions/workflows/ci.yaml)
[![Release](https://github.com/YummYume/bun-stimulus-plugin/actions/workflows/release.yml/badge.svg)](https://github.com/YummYume/bun-stimulus-plugin/actions/workflows/release.yml)

This plugin allows registering [Stimulus](https://stimulus.hotwired.dev/) controllers automatically from a directory with [Bun](https://bun.sh/).
Originally a [Webpack plugin](https://github.com/hotwired/stimulus-webpack-helpers) made by Hotwired, this plugin is inspired from [esbuild-plugin-stimulus](https://github.com/zombiezen/esbuild-plugin-stimulus).

## Content

-   [Bun Stimulus Plugin](#bun-stimulus-plugin)
    -   [Content](#content)
    -   [Installation](#installation)
    -   [Usage](#usage)
        -   [Options](#options)
        -   [Usage with TypeScript](#usage-with-typescript)
        -   [Using the directory name instead of the file name](#using-the-directory-name-instead-of-the-file-name)
            -   [Using a directory suffix](#using-a-directory-suffix)
            -   [Mixing file and directory names](#mixing-file-and-directory-names)
        -   [Handling duplicate definitions](#handling-duplicate-definitions)
    -   [Contributing](#contributing)
    -   [Change log](#change-log)
    -   [License](#license)

## Installation

Install the package with your favorite package manager.

```sh
# npm
npm install -D bun-stimulus-plugin

# Yarn
yarn add -D bun-stimulus-plugin

# PNPM
pnpm add -D bun-stimulus-plugin

# Bun
bun add -D bun-stimulus-plugin
```

## Usage

First, you need to use the plugin. This can only be done using the Bun API (Bun doesn't support CLI plugins).

```ts
// build.ts
import { bunStimulusPlugin } from 'bun-stimulus-plugin';

await Bun.build({
    // ...
    plugins: [bunStimulusPlugin()],
});
```

Any file built by Bun with this plugin can use a new import syntax to import Stimulus definitions from a directory using the `stimulus:` prefix.

```ts
// app.ts
import { Application } from '@hotwired/stimulus';
import definitions from 'stimulus:./controllers';

// Load the Stimulus application
const app = Application.start();

// Register the controllers in ./controllers
app.load(definitions);
```

Now, any controller defined in your `./controllers` directory will be automatically registered. It also works for nested controllers.

-   `./controllers/foo_controller.ts` will be registered as `foo`.
-   `./controllers/foo/bar_controller.ts` will be registered as `foo--bar`.

Imports work with relative as well as absolute paths. By default, invalid paths will fail the build, but you can use the options to ignore invalid paths instead.

> [!NOTE]
> Custom paths (like TypeScript aliases) are not yet supported. Support will be added in the future, either when Bun implements `args.resolveDir` for resolving paths, or by adding a `paths` option to the plugin.

### Options

This plugin can receive an options object as its first argument.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            strict: true, // If false, ignore invalid paths (definitions will be empty)
            controllerSuffix: /(-|_)controller.(js|ts|jsx|tsx)$/gi, // Only load controllers with this suffix (will be stripped from the controller's identifier)
            controllerDirectorySuffix: null, // Only load controllers from directories with this suffix (will be stripped from the controller's identifier)
            fileIdentifier: '**/*', // The glob pattern to use for controller files (set to null to ignore file-based controllers)
            directoryIdentifier: null, // The glob pattern to use for directories (set to null to ignore directory-based controllers)
            directorySeparator: '--', // The separator used for nested controllers
            duplicateDefinitionHandling: 'ignore', // How to handle duplicate definitions
        }),
    ],
});
```

| Option                        | Type                                           | Description                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `strict`                      | `boolean`                                      | If set to true, the plugin will throw an error if a given path is not a directory. Otherwise, it will simply ignore the path. Defaults to `true`.                  |
| `controllerSuffix`            | `RegExp \| null`                               | The suffix of the controller files to load. This suffix will be stripped from the controller's identifier. Defaults to `/(-\|_)controller.(js\|ts\|jsx\|tsx)$/gi`. |
| `controllerDirectorySuffix`   | `RegExp \| null`                               | The suffix of the directories to load controllers from. This suffix will be stripped from the controller's identifier. Defaults to `null`.                         |
| `fileIdentifier`              | `string \| null`                               | The glob pattern to use for controller files. Can be set to `null` to ignore file-based controllers. Defaults to `**/*`.                                           |
| `directoryIdentifier`         | `string \| null`                               | The glob pattern to use for directories. Can be set to `null` to ignore directory-based controllers. Defaults to `null`.                                           |
| `directorySeparator`          | `string`                                       | The directory separator to use when parsing nested controllers. Defaults to '--'.                                                                                  |
| `duplicateDefinitionHandling` | `'ignore' \| 'replace' \| 'error' \| function` | How to handle duplicate definitions. Can be `'ignore'`, `'replace'` or `'error'`. A callback can also be provided. Defaults to `'ignore'`.                         |

> [!TIP]
> Use a [glob pattern matcher](https://www.digitalocean.com/community/tools/glob) to test your glob patterns easily. Behinds the scenes, the plugin uses [Bun's file globbing](https://bun.sh/docs/api/glob).

### Usage with TypeScript

TypeScript definitions for `'stimulus:'` imports should be automatically registered with this plugin.
If not, you can always add them manually with `bun-stimulus-plugin/types/import-definition`.

### Using the directory name instead of the file name

Since the 2.0.0 version, you can use directory names instead of file names to register controllers.
This can be useful if you want to use a different naming convention for your controllers.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            fileIdentifier: null, // Do not load controllers from files
            directoryIdentifier: '**/controller.{js,ts}', // Load controllers from directories containing a "controller.{js,ts}" file
        }),
    ],
});
```

With a configuration like this, the plugin will only match directory names.

```ts
// The glob will begin from the specified directory, here "./controllers"
import definitions from 'stimulus:./controllers';
```

If I have a `controllers/folder_name/controller.ts` file, then my controller will be registered as `folder_name`.

> [!WARNING]
> Using this configuration will ignore any controller not in a directory. You need at least a one-level deep directory structure, even if your glob pattern allows matching root files.

#### Using a directory suffix

Just like with file names, you can use a directory suffix to only load controllers from directories with a specific suffix.
It will be stripped from the controller name.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            fileIdentifier: null, // Do not load controllers from files
            directoryIdentifier: '**/controller.{js,ts}', // Load controllers from directories containing a "controller.{js,ts}" file
            controllerDirectorySuffix: /-controller$/gi, // Only load controllers from directories with this suffix
        }),
    ],
});
```

With this configuration, `controllers/folder_name-controller/controller.ts` would match, and the controller would be registered as `folder_name`.
However, `controllers/folder_name/controller.ts` would not match.

#### Mixing file and directory names

You can also mix file and directory names. This can be useful if you want more customization and use a specific convention for registering controllers.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            fileIdentifier: '*.{js,ts}', // Load any non-nested file
            controllerSuffix: null, // Match any file name and do not strip any suffix
            directoryIdentifier: '**/controller.{js,ts}', // Load controllers from directories containing a "controller.{js,ts}" file
        }),
    ],
});
```

Using this configuration, you would be able to register any file in the `./controllers` directory, and any controller in a directory containing a `controller.{js,ts}` file.

### Handling duplicate definitions

Duplicate definitions can sometimes occur with specific configurations, especially when mixing file and directory names.
By default, the plugin will ignore duplicate definitions and simply not register them, only keeping the first definition found.
You can customize this behavior with the `duplicateDefinitionHandling` option.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            duplicateDefinitionHandling: 'replace', // Replace the first definition with the last one found
        }),
    ],
});
```

The `duplicateDefinitionHandling` option can be set to `'ignore'`, `'replace'`, `'error'` or a custom callback.

-   `'ignore'`: Ignore duplicate definitions and only keep the first one found.
-   `'replace'`: Replace the first definition with the last one found.
-   `'error'`: The build will fail if a duplicate definition is found.
-   `function`: A custom callback that will be called with the duplicate definitions. It should return one of the 3 previous options.

You can use the callback to handle very specific cases.

```ts
await Bun.build({
    // ...
    plugins: [
        // Default values
        bunStimulusPlugin({
            fileIdentifier: '*.{js,ts}',
            controllerSuffix: null,
            directoryIdentifier: '**/controller.{js,ts}',
            duplicateDefinitionHandling: (exisitingDefinition, duplicateDefinition) => {
                if (
                    !exisitingDefinition.path.endsWith('controller.ts') &&
                    duplicateDefinition.path.endsWith('controller.ts')
                ) {
                    // If the current definition is from a file controller and the duplicate is from a directory controller, replace the file controller with the directory controller
                    return 'replace';
                }

                // Otherwise, fail the build (you could also return 'ignore' to keep the first definition found)
                return 'error';
            },
        }),
    ],
});
```

Each duplicate definition will be an object with the following properties:

-   `identifier`: The identifier of the controller.
-   `name`: The name the controller will be assigned to.
-   `path`: The absolute path of the definition file.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Change log

See [CHANGELOG.md](./CHANGELOG.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
