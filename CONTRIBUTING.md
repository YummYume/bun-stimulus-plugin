# Contributing

Thank you for considering contributing to this project! Here's how you can help.

## Content

-   [Contributing](#contributing)
    -   [Content](#content)
    -   [Reporting issues](#reporting-issues)
    -   [Contributing code](#contributing-code)

## Reporting issues

If you find a bug or have a feature request, please [open an issue](https://github.com/YummYume/bun-stimulus-plugin/issues) on GitHub after checking that there isn't already one.

## Contributing code

Everyone is welcome to contribute with new features or bug fixes. Here's how you can do it:

1.  Fork the repository
2.  Clone your fork
3.  Create a new branch
4.  Make your changes
5.  (Optional) Add a changeset using `make changeset` (or `bunx changeset`)
6.  Commit your changes
7.  Push your changes to your fork
8.  Open a pull request

It is recommended to use [Docker](https://www.docker.com/) to test the project. You also have make commands available to help you.

| Command     | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| `start`     | Start the project with Docker (installs dependencies and runs `bun test --watch`) |
| `restart`   | Restart the containers.                                                           |
| `stop`      | Stops the containers.                                                             |
| `down`      | Removes the containers.                                                           |
| `ssh`       | SSH into the running container.                                                   |
| `logs`      | Prints the current log results (of the tests) to your terminal in watch mode.     |
| `test`      | Runs a standalone Docker container to run the tests once.                         |
| `build`     | Generates the `dist` files for this library.                                      |
| `lint`      | Runs Prettier & ESLint (without formatting).                                      |
| `format`    | Formats the files according to Prettier & ESLint rules.                           |
| `changeset` | Creates a changeset.                                                              |

The usual workflow is to run `make start` and then `make logs` to see the test results in real time.
You can also develop without Docker, but tests have to be run inside a Docker container to test absolute paths. You can use `make test` for this purpose.

If you do not have make commands available, feel free to look inside the `Makefile` to see what commands are available and how to run them.
Feel free to also add useful commands to the `Makefile` and open a pull request.

> [!NOTE]  
> You can add a `compose.override.yml` file to override the default `compose.yml` file. This is useful if you need to make some changes for your OS.
