# frozen_string_literal: true

class Course < ApplicationRecord
  belongs_to :semester
  has_many :lessons
end
