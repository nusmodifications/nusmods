# frozen_string_literal: true

class Semester < ApplicationRecord
  belongs_to :acad_year
  has_many :courses

  scope :current, lambda {
    start_at = arel_table[:start_at]
    end_at = arel_table[:end_at]
    where(start_at.lt(Date.current)).where(end_at.gteq(Date.current))
  }
end
