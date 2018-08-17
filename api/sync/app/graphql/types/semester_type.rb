# frozen_string_literal: true

class Types::SemesterType < Types::BaseObject
  field :id, ID, null: false
  field :name, String, null: true
  field :start, GraphQL::Types::ISO8601DateTime, null: true
  field :acad_year, Types::AcadYearType, null: true
  field :courses, [Types::CourseType], null: true
end
