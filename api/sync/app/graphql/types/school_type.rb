# frozen_string_literal: true

module Types
  class SchoolType < Types::BaseObject
    field :id, ID, null: false
    field :short_name, String, null: false
    field :long_name, String, null: false
    field :slug, String, null: false

    field :acad_years, [Types::AcadYearType],
          null: false,
          resolve: to_many_batch_resolver(AcadYear, :school_id)

    field :current_acad_year, Types::AcadYearType,
          null: true
    # resolve: to_many_batch_resolver(AcadYear, :school_id)
  end
end
