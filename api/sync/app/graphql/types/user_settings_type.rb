# frozen_string_literal: true

module Types
  class UserSettingsType < Types::BaseObject
    field :id, ID, null: false
    field :mode, String, null: true
    field :theme_id, String, null: true
    field :cors_notification_enabled, Boolean, null: true
  end
end
