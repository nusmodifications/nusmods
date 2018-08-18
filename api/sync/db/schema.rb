# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2018_08_17_014544) do

  create_table "acad_years", force: :cascade do |t|
    t.string "name", null: false
    t.integer "school_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["school_id"], name: "index_acad_years_on_school_id"
  end

  create_table "courses", force: :cascade do |t|
    t.string "code", null: false
    t.text "title", null: false
    t.text "description", null: false
    t.string "slug", null: false
    t.integer "credit", null: false
    t.string "department"
    t.string "workload"
    t.string "preclusion"
    t.string "prerequisite"
    t.string "corequisite"
    t.integer "semester_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["semester_id"], name: "index_courses_on_semester_id"
  end

  create_table "faculties", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.integer "school_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["school_id"], name: "index_faculties_on_school_id"
  end

  create_table "lessons", force: :cascade do |t|
    t.string "code", null: false
    t.string "class_type", null: false
    t.string "day", null: false
    t.string "week", null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.integer "course_id", null: false
    t.integer "venue_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_lessons_on_course_id"
    t.index ["venue_id"], name: "index_lessons_on_venue_id"
  end

  create_table "schools", force: :cascade do |t|
    t.string "short_name", null: false
    t.string "long_name", null: false
    t.string "slug", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "semesters", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.integer "acad_year_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["acad_year_id"], name: "index_semesters_on_acad_year_id"
  end

  create_table "venues", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.string "floor"
    t.decimal "lat", precision: 10, scale: 7
    t.decimal "long", precision: 10, scale: 7
    t.decimal "altitude", precision: 10, scale: 7
    t.integer "faculty_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["faculty_id"], name: "index_venues_on_faculty_id"
  end

end
