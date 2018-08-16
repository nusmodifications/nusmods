defmodule Sync.Data.School do
  use Ecto.Schema
  import Ecto.Changeset

  schema "schools" do
    field(:short_name, :string)
    field(:long_name, :string)
    field(:slug, :string)
    has_many(:acad_years, Sync.Data.AcadYear)

    timestamps()
  end

  @doc false
  def changeset(school, attrs) do
    school
    |> cast(attrs, [:short_name, :long_name, :slug])
    |> validate_required([:short_name, :long_name, :slug])
    |> unique_constraint(:short_name)
    |> unique_constraint(:long_name)
    |> unique_constraint(:slug)
  end
end
