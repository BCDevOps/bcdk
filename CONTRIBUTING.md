# Contributing to the BCDK

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Consistent Coding Style

Prettier and Eslint is used to enforce code style. You can run `npm run lint` to check your codestyle.
In addition there are Github Actions to test code style on PRs.

## Branching Strategies


The Branch naming pattern is `<prefix>/<name>`

Give branches a prefix based on the task type. The following branch prefixes are supported:

- `docs/<name>`: Used for any documentation change
- `feat/<name>`: Used for adding enhancements/features
- `bug/<name>`: Fixes a bug
- `chore/<name>`: A chore task such as upgrading dependencies, folder cleanup etc

Custom branch names are acceptable for larger integrations.

It is important to prefix the branches correctly because **special branch rules** are applied based on these prefixes.

The name should be something simple and concise. It is helpful to add the issue number to the name but it is
not mandatory.

