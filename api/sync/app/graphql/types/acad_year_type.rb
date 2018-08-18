# frozen_string_literal: true

module Types
  class AcadYearType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false

    field :school, Types::SchoolType,
          null: false,
          resolve: to_one_batch_resolver(School, :school_id)

    field :semesters, [Types::SemesterType],
          null: false,
          resolve: to_many_batch_resolver(Semester, :acad_year_id)
  end
end
