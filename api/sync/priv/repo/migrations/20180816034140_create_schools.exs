defmodule Sync.Repo.Migrations.CreateSchools do
  use Ecto.Migration

  def change do
    create table(:schools) do
      add(:name, :string, null: false)
      add(:slug, :string, null: false)

      timestamps()
    end

    create(unique_index(:schools, [:name]))
    create(unique_index(:schools, [:slug]))
  end
end
