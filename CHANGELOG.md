# bun-stimulus-plugin

## 3.0.0

### Major Changes

-   7efa22f: Full compatibility with Stimulus naming convention

    #### BREAKING CHANGES

    -   Remove the `directorySeparator` option and replace all `_` by `-` to follow the Stimulus naming convention.

    If you previously had a controller named `my_controller`, it will now be `my-controller`.

    #### Dev Changes

    -   Update ESLint to flat config, update dependencies.
    -   Remove test for `directorySeparator` option.
    -   Add tests with controllers named with `_` and `-`.

## 2.1.1

### Patch Changes

-   f564104: Add deprecation notice for the `directorySeparator` option

## 2.1.0

### Minor Changes

-   bd36e21: Fix type generation and build.

## 2.0.2

### Patch Changes

-   daf0cee: Exclude src folder from package

## 2.0.1

### Patch Changes

-   0e6c277: Lower bundle size by ignoring files.

## 2.0.0

### Major Changes

-   295323a: Rewrite the way to match controllers (using globs) and allow directory-based controllers (#7). This change is non-breaking, but it's a major change in the way the plugin works.

## 1.0.2

### Patch Changes

-   b68b2d3: Add badges to README.
-   90dc485: Fix a typo in the documentation for bun add.

## 1.0.1

### Patch Changes

-   d89da55: Added documentation for installation and usage with TypeScript.

## 1.0.0

### Major Changes

-   Initial release
