# frozen_string_literal: true

class AcadYear < ApplicationRecord
  belongs_to :school
  has_many :semesters

  scope :current, -> { where(semesters: Semester.current) }

  def start_at
    semesters.minimum(:start_at)
  end

  def end_at
    semesters.maximum(:end_at)
  end

  def current?
    semesters.current.exists?
  end

  def current_semester
    # Assume that there's only 1 current sem at any time
    semesters.current.first
  end
end
