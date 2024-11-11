---
'bun-stimulus-plugin': major
---

Full compatibility with Stimulus naming convention

#### BREAKING CHANGES

- Remove the `directorySeparator` option and replace all `_` by `-` to follow the Stimulus naming convention.

If you previously had a controller named `my_controller`, it will now be `my-controller`.

#### Dev Changes

- Update ESLint to flat config, update dependencies.
- Remove test for `directorySeparator` option.
- Add tests with controllers named with `_` and `-`.
