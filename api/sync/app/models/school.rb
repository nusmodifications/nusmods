# frozen_string_literal: true

class School < ApplicationRecord
  has_many :acad_years
  has_many :faculties
end
