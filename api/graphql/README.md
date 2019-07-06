# GraphQL Server

**Note:** This server is a work in progress and is _not_ used in production. To access the API currently used by the nusmods.com website, please head to https://api.nusmods.com/v2.

This project provides school data such as lessons and modules through an [API](https://www.mulesoft.com/resources/api/what-is-an-api).

**Primary Goals**

1. Allow clients to only fetch the information they need, thus reducing duplicate and unneeded data.
1. Make maintenance simple.
1. Ensure data consistency.
1. Grow the ecosystem.

## Installation

1. Run `cp .env.example .env`, which copies `.env.example` to a new file called `.env`.
1. Install [docker-compose](https://docs.docker.com/compose/install/)

## Setting up

Pull and build docker images to run in later steps.

```
docker-compose build
```

## Development

### Run docker images

```
docker-compose up
```

This command runs many docker images, but only 3 are related to this project.

The first is a SQL database, which stores all the data.

The second is a hasura instance, which sits between clients and the database to allow communication between the two.

The third is an authentication server, which authorizes clients to talk to the hasura instance. (WIP)

The hasura admin interface is available on http://localhost:8082/graphql/console. The password for it is "development" in development mode.

You may use the GraphiQL interface to explore the GraphQL schema and make requests to view the data.

### Shutting down

```
docker-compose down
```

### Removing database volume

This is useful for testing migrations by nuking the database.

```sh
docker-compose down --volumes
```

### Accessing hasura console

From your computer:

```
docker-compose up
docker-compose exec graphql sh
```

From inside the docker container:

```
/bin/hasura-cli [command]
```

## Deep Dive

### Hasura instance

Hasura understands both the application level technology known as [GraphQL](https://graphql.org/) and the database language known as SQL.

When hasura receives a request, it transforms the GraphQL request to SQL, calls the database, and sends the data back. (app <-> hasura <-> database)

We use hasura because of its ease of maintenance and support for subscriptions.

#### Alternatives considered

Prisma was dropped because the flow (app <-> server <-> prisma <-> database) adds maintainence and performance overhead.

Postgraphile does not have support for subscriptions at the time of writing.

### Authentication server

Clients, such as the webpage at [nusmods](https://nusmods.com), will call the few paths below.

The server is written in Javascript. The code runs on [NodeJS](http://nodejs.org/), which provides the basics for running a web server.

### Secondary Goals

1. Account support that stores user information so users no longer have to copy-paste urls.
1. Make API more flexible.
