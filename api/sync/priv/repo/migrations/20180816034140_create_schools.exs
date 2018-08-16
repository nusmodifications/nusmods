defmodule Sync.Repo.Migrations.CreateSchools do
  use Ecto.Migration

  def change do
    create table(:schools) do
      add(:short_name, :string, null: false)
      add(:long_name, :string, null: false)
      add(:slug, :string, null: false)

      timestamps()
    end

    create(unique_index(:schools, [:short_name]))
    create(unique_index(:schools, [:long_name]))
    create(unique_index(:schools, [:slug]))
  end
end
