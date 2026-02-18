# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken

  # Disable authenticity token verification so that our endpoints can be called
  # from non-browser clients
  skip_before_action :verify_authenticity_token
end
