# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Set up
    1. Set Rails env vars:
        ```bash
        docker-compose run web bin/rails db:environment:set RAILS_ENV=development
        ```
    1. Drop existing databases and create, set up and seed new dbs:
        ```bash
        docker-compose run web bundle exec rails db:reset
        ```
    1. Build containers and install dependencies:
        ```bash
        docker-compose build
        ```

* Running the app

    ```bash
    docker-compose up
    ```

    Relevant links:

    * Admin page: http://localhost:3000/admin
    * GraphQL Playground: http://localhost:3000/playground
    * Log in page (for humans, to get session key): http://localhost:3000/users/sign_in
    * Log in API endpoint (to get API token): http://localhost:3000/auth/sign_in
    * Letter opener (sent email viewer): http://localhost:3000/letter_opener

    To interact with byebug prompts, attach to the running container with:

    ```bash
    docker attach sync_web_1
    ```

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions
