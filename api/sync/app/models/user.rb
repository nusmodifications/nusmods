# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :trackable
  include DeviseTokenAuth::Concerns::User

  has_many :user_settings

  def settings(school_id:)
    user_settings.where(school_id: school_id).first
  end
end
