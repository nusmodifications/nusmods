# frozen_string_literal: true

class Types::FacultyType < Types::BaseObject
  field :id, ID, null: false
  field :name, String, null: true
  field :slug, String, null: true
  field :school, Types::SchoolType, null: true
  field :venues, [Types::VenueType], null: true
end
