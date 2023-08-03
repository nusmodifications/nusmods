# frozen_string_literal: true

RailsAdmin.config do |config|
  config.authenticate_with do
    warden.authenticate! scope: :user
  end

  config.authorize_with do
    # TODO: Use current_user's roles as condition
    redirect_to main_app.root_path if current_user.id != 1
  end

  config.current_user_method(&:current_user)
end
