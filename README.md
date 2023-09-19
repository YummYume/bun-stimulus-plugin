# Bun Stimulus Plugin

This plugin allows registering [Stimulus](https://stimulus.hotwired.dev/) controllers automatically from a directory with [Bun](https://bun.sh/).
Originally a [Webpack plugin](https://github.com/hotwired/stimulus-webpack-helpers) made by Hotwired, this plugin is inspired from [esbuild-plugin-stimulus](https://github.com/zombiezen/esbuild-plugin-stimulus).

## Content

-   [Bun Stimulus Plugin](#bun-stimulus-plugin)
    -   [Content](#content)
    -   [Installation](#installation)
    -   [Usage](#usage)
        -   [Options](#options)
        -   [Usage with TypeScript](#usage-with-typescript)
    -   [Contributing](#contributing)
    -   [Change log](#change-log)
    -   [License](#license)

## Installation

TODO

## Usage

First, you need to use the plugin. This can only be done using the Bun API (Bun doesn't support CLI plugins).

```ts
// build.ts
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
        bunStimulusPlugin({
            strict: false, // If false, ignore invalid paths (definitions will be empty) -- default: true
            controllerSuffix: /my_suffix.(ts|js)$/gi, // Only load controllers with this suffix -- default: /(-|_)controller.(js|ts|jsx|tsx)$/gi
            directorySeparator: '__', // The separator used for nested controllers -- default: '--'
        }),
    ],
});
```

| Option               | Description                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strict`             | If set to true, the plugin will throw an error if a given path is not a directory. Otherwise, it will simply ignore the path. Defaults to `true`. |
| `controllerSuffix`   | The suffix of the controller files to load. Defaults to `/(-\|_)controller.(js\|ts\|jsx\|tsx)$/gi`                                                |
| `directorySeparator` | The directory separator to use when parsing nested controllers. Defaults to '--'.                                                                 |

### Usage with TypeScript

TODO

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Change log

See [CHANGELOG.md](./CHANGELOG.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
