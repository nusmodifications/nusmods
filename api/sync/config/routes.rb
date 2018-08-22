Rails.application.routes.draw do
  devise_for :users

  root to: redirect('/playground')

  mount RailsAdmin::Engine, at: '/admin'
  mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?

  namespace :auth do
    mount_devise_token_auth_for 'User', at: ''
  end

  mount GraphqlPlayground::Rails::Engine, at: :playground, graphql_path: '/graphql'
  post :graphql, to: 'graphql#execute'
end
