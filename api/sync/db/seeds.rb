# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

@num_fakes = 5

def new_acad_years
  Array.new(@num_fakes) do
    AcadYear.new(
      name: Faker::Cannabis.strain
    )
  end
end

@num_fakes.times do
  long_name = Faker::University.name
  short_name = long_name.split.map(&:first).join

  School.create(
    short_name: short_name,
    long_name: long_name,
    slug: short_name.downcase,
    acad_years: new_acad_years
  )
end
