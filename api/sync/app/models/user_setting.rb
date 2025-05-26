# frozen_string_literal: true

class UserSetting < ApplicationRecord
  belongs_to :user
  belongs_to :school

  # Generate getters and setters for data stored in the `content` JSON column.
  content_keys = %w[mode theme_id cors_notification_enabled]
  content_keys.each do |attribute|
    define_method attribute, -> { content[attribute] }
    define_method :"#{attribute}=", ->(val) { content[attribute] = val }
  end
end
