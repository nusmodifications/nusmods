NUSMods
==

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

## Building for Development

First, SSH into the vagrant box (this command has to be run in the directory that `Vagrantfile` is in):

```bash
$ vagrant ssh
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
