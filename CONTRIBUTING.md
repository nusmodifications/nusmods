# Contributing

Are you here to make NUSMods better? Awesome!

There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code for NUSMods. Every small bit helps us out immensely.

## How to use this guide

If you're a beginner, lots of technical terms in this guide may be foreign to you. Don't worry, we were once in your shoes too. Take it one step at a time and do some research. As always, get in touch with us if you need any help.

Experienced developers may choose to skip this guide. Our development process is very similar to most other open source projects.

Along the way, if you find details that are missing or wrong, or you would like to improve this guide, feel free to submit a [pull request](#submit-a-pull-request).

## Technical Prerequisites

These are the tools that keep NUSMods ticking. It would be helpful to have a basic understanding of these technologies.

- Git is the software we use for collaboration. [Atlassian's Git Tutorials](https://www.atlassian.com/git/tutorials) is a very comprehensive resource.
- JavaScript is _the_ programming language NUSMods uses. [Mozilla's Javascript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript) is a good place to start to learn the language.
- TypeScript is a language superset of JavaScript, i.e. it's JavaScript but with more features. Its biggest additional feature is types, which help us understand the code better and reduce bugs. Refer to the [TypeScript Documentation](https://www.typescriptlang.org/docs/home.html) to learn more.

## Repo Overview

This repository contains all the code that NUSMods uses. It may seem overwhelming, but each folder is self contained.

| Folder    | Purpose                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| /website  | Houses the code for the https://nusmods.com website                                |
| /scrapers | Scripts that download module and timetable data from NUS to our server             |
| /export   | Contains a service which allows users to download the timetable as images and PDFs |
| /packages | Helper JavaScript libraries that can be reused by projects outside NUSMods         |

Tip: Pick an area you're interested in, and just focus on it. It is not necessary to know all the code to contribute.

## Development Tools

You should have [Node.js](https://nodejs.org/) version 18 or above (use Node 18 LTS or `lts/hydrogen` if possible) and [Yarn](https://yarnpkg.com/en/) version 1.2.0 or above. We recommend using [fnm](https://github.com/Schniz/fnm) to manage your Node versions.

## Proposing a Change

If you intend to make any non-trivial changes to the UI or implementation in any of the projects, we recommend first [filing an issue](https://github.com/nusmodifications/nusmods/issues/new?template=FEATURE_REQUEST.md). This lets us reach an agreement on your proposal before you put significant effort into it.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend to file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

## Branch Organization

We practice trunk-based development and do deployments from the `master` branch, which is the only stable and long-lived branch around. We will do our best to keep the `master` branch in good shape, with tests passing at all times.

## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

[How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/nusmodifications/nusmods/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) that contain bugs/enhancements that have a relatively limited scope. This is a great place to get started.

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don't accidentally duplicate your effort.

If somebody claims an issue but doesn't follow up for more than two weeks, it's fine to take over it but you should still leave a comment.

## Submit a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

Before submitting a pull request, please make sure the following is done:

1. [Fork the repository](https://github.com/nusmodifications/nusmods) and create your branch from `master`.
1. Run `yarn` in the root of the project that you are working on (`/website`, `/export`, or `/packages/nusmoderator`).
1. If you've fixed a bug or added code that should be tested, add tests! We ask that you write tests if your feature contains non-trivial logic. Tests can be omitted for minor layout or stylistic changes (or simply generate a snapshot).
1. Ensure the test suite passes (`yarn test`). Tip: `yarn test:watch` is helpful in development.
1. Run `yarn run ci` which runs the linting, testing and building steps. This is the command that is run on our CI system. There should not be errors shown. Alternatively, you can run the linting, testing and building step separately via `yarn run lint`, `yarn test` and `yarn run build` respectively.
1. There might be project-specific contribution details. Please read the README of the respective projects.

### Code of Conduct

We have adopted Facebook's Code of Conduct that we expect project participants to adhere to. Kindly read [the full text](https://code.facebook.com/codeofconduct) to understand what actions will and will not be tolerated.

## License

By contributing to NUSMods, you agree that your contributions will be licensed under its MIT license.
