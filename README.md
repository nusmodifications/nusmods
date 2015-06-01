# [NUSMods](http://nusmods.com) [![Code Climate](http://img.shields.io/codeclimate/github/nusmodifications/nusmods.svg)](https://codeclimate.com/github/nusmodifications/nusmods) [![Dependency Status](http://img.shields.io/david/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods) [![devDependency Status](http://img.shields.io/david/dev/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods#info=devDependencies)

## Talk to us!

- Gitter: [![Join the chat at https://gitter.im/nusmodifications/nusmods](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nusmodifications/nusmods?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
- HipChat: [NUSMods Dev HipChat](https://www.hipchat.com/g3JuQhjNj)

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

- [Node.js](http://nodejs.org)

### Setup

Install the necessary packages.
```bash
$ npm install -g bower grunt-cli
$ npm install
$ bower install
```

Make a copy of the config file. If you are working on `barenus.php`, add Facebook App credentials into the file.
```bash
$ cp ./app/config.json.dist ./app/config.json
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

Alternatively, a version that ignores jshint warnings:

```bash
$ grunt build
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

- [PHP](http://www.php.net) for export, URL shortening, redirect and Facebook API proxy scripts.
- [YOURLS](http://yourls.org/) for URL shortening.
- [wkhtmltopdf and wkhtmltoimage](http://wkhtmltopdf.org/) for pdf
  and image export. Using the static binaries is suggested, as compiling with
  all the features of the static build needs a custom patched version of QT,
  which takes a *long* time to build.
- [Facebook PHP SDK](https://github.com/facebook/facebook-php-sdk-v4) for Facebook API proxy.
- To install the PHP dependencies, simple do:
```bash
$ composer install
```

## License

Copyright (c) 2015 NUS Modifications. Licensed under the MIT license.
