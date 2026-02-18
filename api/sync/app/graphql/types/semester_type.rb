# frozen_string_literal: true

module Types
  class SemesterType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :start_at, GraphQL::Types::ISO8601DateTime, null: false
    field :end_at, GraphQL::Types::ISO8601DateTime, null: false

    field :acad_year, Types::AcadYearType,
          null: false,
          resolve: to_one_batch_resolver(AcadYear, :acad_year_id)

    field :courses, [Types::CourseType],
          null: false,
          resolve: to_many_batch_resolver(Course, :semester_id)
  end
end
