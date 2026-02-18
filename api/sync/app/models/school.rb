# frozen_string_literal: true

class School < ApplicationRecord
  has_many :acad_years
  has_many :faculties

  def current_acad_year
    # Assume that there's only 1 current AY at any time
    acad_years.current.first
  end
end
