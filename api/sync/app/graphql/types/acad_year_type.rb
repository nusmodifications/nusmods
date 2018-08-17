module Types
  class AcadYearType < Types::BaseObject
    field :name, String, null: false
    field :school, Types::SchoolType, null: false
  end
end
