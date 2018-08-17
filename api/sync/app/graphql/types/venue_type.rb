# frozen_string_literal: true

class Types::VenueType < Types::BaseObject
  field :id, ID, null: false
  field :code, String, null: true
  field :name, String, null: true
  field :slug, String, null: true
  field :floor, String, null: true
  field :lat, Float, null: true
  field :long, Float, null: true
  field :altitude, Float, null: true
  field :faculty, Types::FacultyType, null: true
  field :lessons, [Types::LessonType], null: true
end
