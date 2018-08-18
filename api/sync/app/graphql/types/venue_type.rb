# frozen_string_literal: true

module Types
  class VenueType < Types::BaseObject
    # Data extracted from courses
    field :id, ID, null: false
    field :code, String, null: false
    field :slug, String, null: false

    # Enhanced data
    field :name, String, null: true
    field :floor, String, null: true
    field :lat, Float, null: true
    field :long, Float, null: true
    field :altitude, Float, null: true

    field :faculty, Types::FacultyType,
          null: false,
          resolve: to_one_batch_resolver(Faculty, :faculty_id)

    field :lessons, [Types::LessonType],
          null: false,
          resolve: to_many_batch_resolver(Lesson, :venue_id)
  end
end
