# Contributing

Thank you for investing your time in contributing to our integration! Any
contribution you make helps us make this project better. There are a number
of sections that cover various different contribution methods. Make sure to
review the one that's right for your type of contribution.

## Creating an Issue

Found a bug in our cartridge? Raise an issue with the appropriate template and
we'll look into it! Please add any notes that you believe will be helpful to
our team in determining a solution for the issue.

## Raising a Pull Request

After your changes are ready for review, raise a PR with your branch against `main`!

> ℹ️ If you are releasing a patch for a version, please branch off
> of the appropriate stable release branch or tag. When your PR is ready for review,
> raise the PR against the stable release branch. If one doesn't exist, ask the
> maintainers to create one.

Our current way of working with PRs involves committing and reviewing changes internally
in a private repository and then syncing said changes to the public repository (with
a mention the the original author of course).

To speed up the process (or just notify us in case we may have missed it) send us an email at
thirdpartysupport@klaviyo.com, we'll make sure to take a look.

## Local Environment

Check the [plugin development and customization documentation](./plugin-development-customization.md) for all the
details on how to install and test the plugin on your local environment.

## Code recommendations

Ideally, code contributions should:

- Use descriptive names for variables and functions, to communicate intent.
- Use `prettier` and `yarn run lint` (or `yarn run lint:fix`) to help
your code look clean and organized.
- Have _some_ test coverage, if appropriate. We try to stay above 80% coverage.
- If considerably changing or introducing some behavior/feature, optionally add
some documentation (or provide a summary in your PR, so we can write some instead).