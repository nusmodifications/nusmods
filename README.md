# [NUSMods](http://nusmods.com) [![Code Climate](http://img.shields.io/codeclimate/github/ahbeng/NUSMods.svg)](https://codeclimate.com/github/ahbeng/NUSMods) [![Dependency Status](http://img.shields.io/david/ahbeng/NUSMods.svg)](https://david-dm.org/ahbeng/NUSMods) [![devDependency Status](http://img.shields.io/david/dev/ahbeng/NUSMods.svg)](https://david-dm.org/ahbeng/NUSMods#info=devDependencies)

## Clone Repository with Submodules

```bash
$ git clone --recursive https://github.com/ahbeng/NUSMods.git
```

Or if you have already cloned the repository without submodules before:

```bash
$ git submodule update --init
```

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

## Deploying to Production

Change the host in the production inventory file `provisioning/production` and
execute the Ansible playbook against it:

```bash
$ ansible-playbook provisioning/production.yml -i provisioning/production
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
