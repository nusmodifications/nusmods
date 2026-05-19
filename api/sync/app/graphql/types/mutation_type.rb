# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :update_settings, Types::UserSettingsType,
          null: false,
          description: 'Update settings for the signed in user' do
      argument :school_id, ID, required: true
      argument :mode, String, required: false
      argument :theme_id, String, required: false
      argument :cors_notification_enabled, Boolean, required: false
      guard ->(_obj, _args, ctx) { ctx[:current_user].present? }
    end
    def update_settings(school_id:, **args)
      current_user = context[:current_user]
      return nil if current_user.nil?

      # Find or create settings object
      settings = current_user.settings(school_id: school_id)
      if settings.nil?
        settings = UserSetting.new
        settings.school = School.find(school_id)
        settings.user = current_user
      end

      settings.assign_attributes(args)
      settings.save!

      SyncSchema.subscriptions.trigger('settingsUpdated', { schoolId: school_id }, settings,
                                       scope: current_user.id)

      settings
    end
  end
end
