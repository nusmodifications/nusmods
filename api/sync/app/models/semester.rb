# frozen_string_literal: true

class Semester < ApplicationRecord
  belongs_to :acad_year
  has_many :courses
end
