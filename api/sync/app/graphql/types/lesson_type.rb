# frozen_string_literal: true

module Types
  class LessonType < Types::BaseObject
    field :id, ID, null: false
    field :code, String, null: false
    field :class_type, String, null: false
    field :day, String, null: false
    field :week, String, null: false
    field :start_at, GraphQL::Types::ISO8601DateTime, null: false
    field :end_at, GraphQL::Types::ISO8601DateTime, null: false

    field :course, Types::CourseType,
          null: false,
          resolve: to_one_batch_resolver(Course, :course_id)

    field :venue, Types::VenueType,
          null: true,
          resolve: to_one_batch_resolver(Venue, :venue_id)
  end
end
