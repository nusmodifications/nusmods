# frozen_string_literal: true

class SyncSchema < GraphQL::Schema
  use GraphQL::Subscriptions::ActionCableSubscriptions

  mutation(Types::MutationType)
  query(Types::QueryType)
  subscription(Types::SubscriptionType)

  use BatchLoader::GraphQL
  use GraphQL::Guard.new
end
