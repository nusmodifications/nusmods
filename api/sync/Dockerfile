FROM ruby:2.6
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
RUN mkdir /nusmods-rails
WORKDIR /nusmods-rails
COPY Gemfile /nusmods-rails/Gemfile
COPY Gemfile.lock /nusmods-rails/Gemfile.lock
RUN bundle install
COPY . /nusmods-rails

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
