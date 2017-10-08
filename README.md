# [NUSMods](http://nusmods.com) [![Code Climate](http://img.shields.io/codeclimate/github/nusmodifications/nusmods.svg)](https://codeclimate.com/github/nusmodifications/nusmods) [![Dependency Status](http://img.shields.io/david/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods) [![devDependency Status](http://img.shields.io/david/dev/nusmodifications/nusmods.svg)](https://david-dm.org/nusmodifications/nusmods#info=devDependencies) [![Build Status](https://travis-ci.org/nusmodifications/nusmods.svg?branch=master)](https://travis-ci.org/nusmodifications/nusmods)
[![ghit.me](https://ghit.me/badge.svg?repo=nusmodifications/nusmods)](https://ghit.me/repo/nusmodifications/nusmods)

## Talk to us!

- Telegram: https://telegram.me/NUSMods

## Setup with Vagrant

### Prerequisites

- [Vagrant](http://www.vagrantup.com/)
- [VirtualBox](https://www.virtualbox.org/)
- [Python 2.7](https://www.python.org/downloads/)

### Setup

On Unix/Mac:

```bash
$ pip install ansible==2.1.0.0
$ vagrant up
```

On Windows:

```powershell
PS> vagrant up
```

Once it's up, do a `vagrant ssh` to enter the development environment.

## Setup without Vagrant

### Prerequisites

- [Node.js](http://nodejs.org) (we currently use v6.6.0, instructions [here](https://github.com/nodesource/distributions#installation-instructions))

### Setup

Install the necessary packages.

```bash
$ npm install -g npm@3.10.3
$ npm install -g gulp-cli@1.2.2
$ npm install
```

If you are working on `news.php`, make a copy of `/app/config/secrets.json.example` in the same directory and call it `secrets.json`. Add your Facebook App credentials into the file `secrets.json`.

## Building for Development

First, SSH into the vagrant box (this command has to be run in the directory that `Vagrantfile` is in):

```bash
$ vagrant ssh
```

Run the development environment:

```bash
$ npm start
```

Visit `localhost:8080` to see your local instance of NUSMods.

## Building for Production

To get a complete, minified, production build under `dist/`:

```bash
$ npm run build
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
$ grunt # starts the crawling process in nusmods-api
```

The development server serves the files generated in `api/app/api` under `/api/`,
so change `baseUrl` under `app/config/application.json` to point to `/api/`.

## Optional Dependencies

- [PHP](http://www.php.net) for export, URL shortening, redirect and Facebook API proxy scripts.
- [YOURLS](http://yourls.org/) for URL shortening.
- [wkhtmltopdf and wkhtmltoimage](http://wkhtmltopdf.org/) for pdf
  and image export. Using the static binaries is suggested, as compiling with
  all the features of the static build needs a custom patched version of QT,
  which takes a *long* time to build.
- [Facebook PHP SDK](https://github.com/facebook/facebook-php-sdk-v4) for Facebook API proxy.
- To install the PHP dependencies, simply do:
```bash
$ composer install
```

## License

Copyright (c) 2017 NUSModifications. Licensed under the MIT license.
