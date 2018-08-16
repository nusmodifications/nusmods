defmodule Sync.Data.AcadYear do
  use Ecto.Schema
  import Ecto.Changeset

  schema "acad_years" do
    field(:name, :string)
    belongs_to(:school, Sync.Data.School)
    has_many(:semesters, Sync.Data.Semester)

    timestamps()
  end

  @doc false
  def changeset(acad_year, attrs) do
    acad_year
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
