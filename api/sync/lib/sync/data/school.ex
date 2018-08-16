defmodule Sync.Data.School do
  use Ecto.Schema
  import Ecto.Changeset

  schema "schools" do
    field(:name, :string)
    field(:slug, :string)

    timestamps()
  end

  @doc false
  def changeset(school, attrs) do
    school
    |> cast(attrs, [:name, :slug])
    |> validate_required([:name, :slug])
    |> unique_constraint(:name)
    |> unique_constraint(:slug)
  end
end
