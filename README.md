# [NUSMods](http://nusmods.com)

## Setup with Vagrant

### Prerequisites

- [Vagrant](http://www.vagrantup.com/)
- [VirtualBox](https://www.virtualbox.org/)

### Setup

```bash
$ pip install ansible
$ vagrant up
```

Once it's up, do a `vagrant ssh` to enter the development environment.

## Setup without Vagrant

### Prerequisites

- [Bundler](http://bundler.io/)
- [Node.js](http://nodejs.org)

### Setup

```bash
$ npm install -g bower grunt-cli
$ npm install
$ bower install
$ bundle install
```

## Building for Development

```bash
$ grunt serve
```

## Building for Production

To get a complete, minified, production build under `dist/`:

```bash
$ grunt
```

## Optional Dependencies

- [PHP](http://www.php.net) for export and URL shortening scripts.
- [YOURLS](http://yourls.org/) for URL shortening.
- [wkhtmltopdf and wkhtmltoimage](http://code.google.com/p/wkhtmltopdf/) for pdf
  and image export. Using the static binaries is suggested, as compiling with
  all the features of the static build needs a custom patched version of QT,
  which takes a *long* time to build.

## License

Copyright (c) 2014 Eu Beng Hee. Licensed under the MIT license.
