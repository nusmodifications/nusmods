class CreateUserSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :user_settings do |t|
      t.references :user, foreign_key: true, null: false
      t.references :school, foreign_key: true, null: false
      t.json :content, null: false, default: {}

      t.timestamps
    end
  end
end
