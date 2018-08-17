module Types
  class SchoolType < Types::BaseObject
    field :short_name, String, null: false
    field :long_name, String, null: false
    field :slug, String, null: false
    field :school, [Types::SchoolType], null: false
  end
end
