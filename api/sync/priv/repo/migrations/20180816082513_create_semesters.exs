defmodule Sync.Repo.Migrations.CreateSemesters do
  use Ecto.Migration

  def change do
    create table(:semesters) do
      add(:name, :string, null: false)
      add(:acad_year_id, references(:acad_years, on_delete: :nothing), null: false)

      timestamps()
    end

    create(index(:semesters, [:acad_year_id]))
  end
end
