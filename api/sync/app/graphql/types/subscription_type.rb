# frozen_string_literal: true

module Types
  class SubscriptionType < Types::BaseObject
    field :settings_updated, Types::UserSettingsType,
          null: true,
          subscription_scope: :current_user_id,
          description: "The user's settings were updated" do
            argument :school_id, ID, required: true
          end
    def settings_updated(school_id:)
      UserSetting.where(school_id: school_id).first
    end
  end
end
