# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :schools, [Types::SchoolType], null: false, description: 'Get schools'
    def schools
      School.all
    end
  end
end
