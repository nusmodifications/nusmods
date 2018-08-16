defmodule Sync.Data.Semester do
  use Ecto.Schema
  import Ecto.Changeset

  schema "semesters" do
    field(:name, :string)
    belongs_to(:acad_year, Sync.Data.AcadYear)
    has_many(:modules, Sync.Data.Module)

    timestamps()
  end

  @doc false
  def changeset(semester, attrs) do
    semester
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
