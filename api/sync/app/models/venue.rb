# frozen_string_literal: true

class Venue < ApplicationRecord
  belongs_to :faculty
  has_many :lessons
end
