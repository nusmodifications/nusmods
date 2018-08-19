# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :viewer, Types::UserType,
          null: true,
          description: 'Get the current signed in user'
    def viewer
      context[:current_user]
    end

    field :schools, [Types::SchoolType],
          null: false,
          description: 'Get schools'
    def schools
      School.all
    end

    field :school, Types::SchoolType,
          null: true,
          description: 'Get a school' do
      argument :id, ID, required: false
      argument :slug, String, required: false
      argument :short_name, String, required: false
      argument :long_name, String, required: false
    end
    def school(args)
      School.where(args).first
    end

    field :current_acad_year, Types::AcadYearType,
          null: true,
          description: 'Get current academic year for a school' do
      argument :school_slug, String, required: true
    end
    def current_acad_year(school_slug:)
      School.where(slug: school_slug).first&.current_acad_year
    end

    field :current_semester, Types::SemesterType,
          null: true,
          description: 'Get current semester for a school' do
      argument :school_slug, String, required: true
    end
    def current_semester(args)
      current_acad_year(args)&.current_semester
    end
  end
end
