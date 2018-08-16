defmodule Sync.Data.Module do
  use Ecto.Schema
  import Ecto.Changeset

  schema "modules" do
    field(:code, :string)
    field(:title, :string)
    field(:description, :string)
    field(:slug, :string)
    belongs_to(:semester, Sync.Data.Semester)

    timestamps()
  end

  @doc false
  def changeset(module, attrs) do
    module
    |> cast(attrs, [:code, :title, :description, :slug])
    |> validate_required([:code, :title, :description, :slug])
  end
end
