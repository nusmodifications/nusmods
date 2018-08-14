# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :sync,
  ecto_repos: [Sync.Repo]

# Configures the endpoint
config :sync, SyncWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "/uUqYxkh/lkAVm4auwGYU+nbQO9gh8NZVZtnQ5OvPGJq4aQBGkhYk65aRzCiEWVW",
  render_errors: [view: SyncWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Sync.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
