defmodule Sync.Repo.Migrations.CreateModules do
  use Ecto.Migration

  def change do
    create table(:modules) do
      add(:code, :string, null: false)
      add(:title, :text, null: false)
      add(:description, :text, null: false)
      add(:slug, :string, null: false)
      add(:semester_id, references(:semesters, on_delete: :nothing), null: false)

      timestamps()
    end

    create(index(:modules, [:semester_id]))
  end
end
