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
  end
end
