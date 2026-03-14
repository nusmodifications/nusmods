class CreateDataModels < ActiveRecord::Migration[5.2]
  def change
    create_table :schools do |t|
      t.string :short_name, null: false
      t.string :long_name, null: false
      t.string :slug, null: false

      t.timestamps
    end

    create_table :acad_years do |t|
      t.string :name, null: false
      t.references :school, foreign_key: true, null: false

      t.timestamps
    end

    create_table :semesters do |t|
      t.string :name, null: false
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.references :acad_year, foreign_key: true, null: false

      t.timestamps
    end

    create_table :courses do |t|
      t.string :code, null: false
      t.text :title, null: false
      t.text :description, null: false
      t.string :slug, null: false
      t.integer :credit, null: false
      t.string :department
      t.string :workload
      t.string :preclusion
      t.string :prerequisite
      t.string :corequisite
      t.references :semester, foreign_key: true, null: false

      t.timestamps
    end

    create_table :faculties do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.references :school, foreign_key: true, null: false

      t.timestamps
    end

    create_table :venues do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.string :slug, null: false
      t.string :floor
      t.decimal :lat, precision: 10, scale: 7
      t.decimal :long, precision: 10, scale: 7
      t.decimal :altitude, precision: 10, scale: 7
      t.references :faculty, foreign_key: true

      t.timestamps
    end

    create_table :lessons do |t|
      t.string :code, null: false
      t.string :class_type, null: false
      t.string :day, null: false
      t.string :week, null: false
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.references :course, foreign_key: true, null: false
      t.references :venue, foreign_key: true

      t.timestamps
    end
  end
end
