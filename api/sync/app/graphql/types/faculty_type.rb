# frozen_string_literal: true

module Types
  class FacultyType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :slug, String, null: false

    field :school, Types::SchoolType,
          null: false,
          resolve: to_one_batch_resolver(School, :school_id)

    field :venues, [Types::VenueType],
          null: true,
          resolve: to_many_batch_resolver(Venue, :venue_id)
  end
end
