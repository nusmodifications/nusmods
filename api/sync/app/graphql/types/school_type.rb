# frozen_string_literal: true

module Types
  class SchoolType < Types::BaseObject
    field :id, ID, null: false
    field :short_name, String, null: false
    field :long_name, String, null: false
    field :slug, String, null: false

    field :acad_years, [Types::AcadYearType], null: false, resolve: lambda { |school, _args, _ctx|
      BatchLoader.for(school.id).batch(default_value: []) do |school_ids, loader|
        AcadYear.where(school_id: school_ids).each do |ay|
          loader.call(ay.school_id) { |memo| memo << ay }
        end
      end
    }
  end
end
