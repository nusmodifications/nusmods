# frozen_string_literal: true

class Lesson < ApplicationRecord
  belongs_to :venue, optional: true
  belongs_to :course
end
