# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

    ```bash
    bundle exec rails db:drop db:create
    ```
* Database initialization


    ```bash
    bundle exec rails db:migrate db:seed
    ```

* Running the app

    ```bash
    nix-shell # NixOS ONLY
    bundle exec rails server
    ```

    Relevant links:

    * Admin page: http://localhost:3000/admin
    * GraphQL Playground: http://localhost:3000/playground
    * Log in page: http://localhost:3000/users/sign_in
    * Letter opener (sent email viewer): http://localhost:3000/letter_opener

* How to run the test suite

* Upgrading dependencies

    * NixOS:

        ```bash
        nix-shell -p bundler --run 'bundle lock --update' # Update Gemfile.lock
        nix-shell -p bundix --run 'bundix' # Update gemset.nix
        nix-shell
        ```

    * All other platforms:

        ```bash
        bundle update
        ```

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions
