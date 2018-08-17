# frozen_string_literal: true

class Types::CourseType < Types::BaseObject
  field :id, ID, null: false
  field :code, String, null: true
  field :title, String, null: true
  field :description, String, null: true
  field :slug, String, null: true
  field :credit, Integer, null: true
  field :department, String, null: true
  field :workload, String, null: true
  field :preclusion, String, null: true
  field :prerequisite, String, null: true
  field :corequisite, String, null: true
  field :semester, Types::SemesterType, null: true
  field :lessons, [Types::LessonType], null: true
end
