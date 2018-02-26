# Contributing

Inspired by/copied shamelessly from React's [contribution guide](https://reactjs.org/docs/how-to-contribute.html).

## Code of Conduct

We have adopted the same Code of Conduct as Facebook that we expect project participants to adhere to. Please read [the full text](https://code.facebook.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

## Open Development

All work on NUSMods happens directly on GitHub. Both core team members and external contributors send pull requests which go through the same review process.

## Branch Organization

We practice trunk-based development and do deployments from the `master` branch, which is the only stable and long-lived branch around. We will do our best to keep the `master` branch in good shape, with tests passing at all times.

## Bugs

#### Where to Find Known Issues

We are using [GitHub Issues](https://github.com/nusmodifications/nusmods/issues) for our public bugs. Before filing a new task, try to make sure your problem doesn't already exist.

#### Reporting Bug

Simply open up the [bug report form](https://github.com/nusmodifications/nusmods/issues/new?template=BUG_REPORT.md) and fill in the given template.

## How to Get in Touch

We can be reached via the following methods, in order of preference.

* Telegram: https://telegram.me/nusmods
* Messenger: https://www.m.me/nusmods
* Facebook: https://www.facebook.com/nusmods
* Twitter: https://twitter.com/nusmods
* Email: nusmods@googlegroups.com

## Proposing a Change

If you intend to make any non-trivial changes to the UI or implementation in any of the projects, we recommend first [filing an issue](https://github.com/nusmodifications/nusmods/issues/new?template=FEATURE_REQUEST.md). This lets us reach an agreement on your proposal before you put significant effort into it.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend to file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) that contain bugs/enhancements that have a relatively limited scope. This is a great place to get started.

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don't accidentally duplicate your effort.

If somebody claims an issue but doesn't follow up for more than two weeks, it's fine to take over it but you should still leave a comment.

## Sending a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

Before submitting a pull request, please make sure the following is done:

1. [Fork the repository](https://github.com/nusmodifications/nusmods) and create your branch from `master`.
1. Run `yarn` in the root of the project that you are working on (`/www`, `/export`, `/api` or `/packages/nusmoderator`).
1. If you've fixed a bug or added code that should be tested, add tests! We ask that you write tests if your feature contains non-trivial logic. Tests can be omitted for minor layout or stylistic changes (or simply generate a snapshot).
1. Ensure the test suite passes (`yarn test`). Tip: `yarn test:watch` is helpful in development.
1. Run `yarn run ci` which runs the linting, testing and building steps. This is the command that is run on our CI system. There should not be errors shown. Alternatively, you can run the linting, testing and building step separately via `yarn run lint`, `yarn test` and `yarn run build` respectively.
1. There might be project-specific contribution details. Please read the README of the respective projects.

## Contribution Prerequisites

* You have [Node](https://nodejs.org/) installed at v8.0.0+ and [Yarn](https://yarnpkg.com/en/) at v1.2.0+. We recommend using [nvm](https://github.com/creationix/nvm) to manage your Node versions.
* You are familiar with Git.

## Development Workflow

Refer to each project's README for development instructions on the specific project.

## License

By contributing to NUSMods, you agree that your contributions will be licensed under its MIT license.


## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/nusmods).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.


## Credits


### Contributors

Thank you to all the people who have already contributed to nusmods!
<a href="graphs/contributors"><img src="https://opencollective.com/nusmods/contributors.svg?width=890" /></a>


### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/nusmods#backer)]

<a href="https://opencollective.com/nusmods#backers" target="_blank"><img src="https://opencollective.com/nusmods/backers.svg?width=890"></a>


### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/nusmods#sponsor))

<a href="https://opencollective.com/nusmods/sponsor/0/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/1/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/2/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/3/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/4/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/5/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/6/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/7/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/8/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/nusmods/sponsor/9/website" target="_blank"><img src="https://opencollective.com/nusmods/sponsor/9/avatar.svg"></a>