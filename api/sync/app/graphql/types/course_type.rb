# frozen_string_literal: true

module Types
  class CourseType < Types::BaseObject
    field :id, ID, null: false
    field :code, String, null: false
    field :title, String, null: false
    field :description, String, null: false
    field :slug, String, null: false
    field :credit, Integer, null: false

    field :department, String, null: true
    field :workload, String, null: true
    field :preclusion, String, null: true
    field :prerequisite, String, null: true
    field :corequisite, String, null: true

    field :semester, Types::SemesterType,
          null: false,
          resolve: to_one_batch_resolver(Semester, :semester_id)

    field :lessons, [Types::LessonType],
          null: false,
          resolve: to_many_batch_resolver(Lesson, :course_id)
  end
end
