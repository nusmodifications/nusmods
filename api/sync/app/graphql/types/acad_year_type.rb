# frozen_string_literal: true

module Types
  class AcadYearType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false

    # TODO: Solve N+1 for these
    field :start_at, GraphQL::Types::ISO8601DateTime, null: true
    field :end_at, GraphQL::Types::ISO8601DateTime, null: true

    field :school, Types::SchoolType,
          null: false,
          resolve: to_one_batch_resolver(School, :school_id)

    field :semesters, [Types::SemesterType],
          null: false,
          resolve: to_many_batch_resolver(Semester, :acad_year_id)

    field :current_semester, Types::SemesterType,
          null: true
    # resolve: to_many_batch_resolver(Semester, :acad_year_id)
  end
end
