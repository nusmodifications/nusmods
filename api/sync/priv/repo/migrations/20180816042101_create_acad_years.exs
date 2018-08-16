defmodule Sync.Repo.Migrations.CreateAcadYears do
  use Ecto.Migration

  def change do
    create table(:acad_years) do
      add(:name, :string, null: false)
      add(:school_id, references(:schools, on_delete: :nothing), null: false)

      timestamps()
    end

    create(index(:acad_years, [:school_id]))
  end
end
