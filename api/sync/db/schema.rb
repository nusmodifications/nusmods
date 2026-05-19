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

ActiveRecord::Schema.define(version: 2018_08_22_012902) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

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

  create_table "user_settings", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "school_id", null: false
    t.json "content", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["school_id"], name: "index_user_settings_on_school_id"
    t.index ["user_id"], name: "index_user_settings_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.boolean "allow_password_change", default: false
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "name"
    t.string "image"
    t.text "tokens"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
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
