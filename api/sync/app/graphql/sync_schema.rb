# frozen_string_literal: true

class SyncSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)
end
