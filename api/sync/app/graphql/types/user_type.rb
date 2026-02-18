# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :email, String, null: false
    field :settings, Types::UserSettingsType, null: true do
      argument :school_id, ID, required: true
    end
  end
end
