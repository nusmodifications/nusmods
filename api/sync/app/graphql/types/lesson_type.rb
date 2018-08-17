# frozen_string_literal: true

class Types::LessonType < Types::BaseObject
  field :id, ID, null: false
  field :code, String, null: true
  field :class_type, String, null: true
  field :day, String, null: true
  field :week, String, null: true
  field :start, GraphQL::Types::ISO8601DateTime, null: true
  field :end, GraphQL::Types::ISO8601DateTime, null: true
  field :course, Types::CourseType, null: true
  field :venue, Types::VenueType, null: true
end
