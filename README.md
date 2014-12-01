# [NUSMods](http://nusmods.com) [![Code Climate](http://img.shields.io/codeclimate/github/nusmodifications/nusmods.svg)](https://codeclimate.com/github/nusmodifications/nusmods) [![Dependency Status](http://img.shields.io/david/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods) [![devDependency Status](http://img.shields.io/david/dev/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods#info=devDependencies)

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

## Working with the [NUSMods API](https://github.com/nusmodifications/nusmods-api)

NUSMods is set up to work with the remote API at http://nusmods.com/api/ by
default. To work with a local copy of the API:

```bash
$ git submodule update --init
$ cd api
$ npm install
$ grunt
```

The development server serves the files generated in `api/app/api` under
`/api/`, so change `baseUrl` under `app/scripts/config.json` to point to
`/api/`.

## Optional Dependencies

- [PHP](http://www.php.net) for export, URL shortening and redirect scripts.
- [YOURLS](http://yourls.org/) for URL shortening.
- [wkhtmltopdf and wkhtmltoimage](http://code.google.com/p/wkhtmltopdf/) for pdf
  and image export. Using the static binaries is suggested, as compiling with
  all the features of the static build needs a custom patched version of QT,
  which takes a *long* time to build.

## License

Copyright (c) 2014 NUS Modifications. Licensed under the MIT license.
