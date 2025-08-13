# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

@num_fakes = 5

# Faker::RickAndMorty.location

def new_lessons
  Array.new(@num_fakes) do
    date = Faker::Date.between(7.days.ago, Date.current)
    start_time = Faker::Date.between(7.days.ago, Date.current)
    end_time = Faker::Date.between(7.days.ago, Date.current)
    start_time, end_time = end_time, start_time if start_time > end_time

    Lesson.new(
      # TODO: COMPLETE
      code: Faker::Address.building_number,
      class_type: "TUTORIAL",
      day: date.strftime('%A').upcase,
      week: "Odd Week",
      start_at: start_time,
      end_at: end_time
    )
  end
end

def new_courses
  Array.new(@num_fakes) do
    course_num = Faker::Number.between(100, 9999)
    code = "#{Faker::Address.state_abbr}#{course_num}#{Faker::Address.state_abbr}"
    Course.new(
      code: code,
      title: Faker::Educator.course_name,
      description: Faker::Lorem.paragraph,
      slug: code.downcase,
      credit: Faker::Number.between(1, 8).to_s,
      department: Faker::Company.industry,
      lessons: new_lessons
    )
  end
end

def new_sems(ay_start, ay_end)
  times = Array.new(@num_fakes - 1) { Faker::Time.between(ay_start, ay_end) }.sort!
  # An AY should be filled with sems from start to end
  times.unshift(ay_start)
  times.push(ay_end)

  Array.new(@num_fakes) do |i|
    Semester.new(
      name: Faker::Space.moon,
      start_at: times[i],
      end_at: times[i+1],
      courses: new_courses
    )
  end
end

def new_acad_years
  times = Array.new(@num_fakes + 1) { Faker::Time.between(@num_fakes.year.ago, @num_fakes.year.since) }.sort!
  Array.new(@num_fakes) do |i|
    AcadYear.new(
      name: Faker::Space.galaxy,
      semesters: new_sems(times[i], times[i+1])
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

user = User.new(email: 'test@example.com', password: 'secret', password_confirmation: 'secret')
user.skip_confirmation!
user.save!

settings = School.limit(School.count / 2).map do |school|
  setting = UserSetting.new(school: school, user: user, content: {
    mode: "LIGHT",
    theme_id: "eighties"
  })
  setting.save!
  setting
end
user.user_settings = settings
user.save!
