module Types
  class SchoolType < Types::BaseObject
    field :id, ID, null: false
    field :short_name, String, null: false
    field :long_name, String, null: false
    field :slug, String, null: false
    field :acad_years, [Types::AcadYearType], null: false
  end
end
