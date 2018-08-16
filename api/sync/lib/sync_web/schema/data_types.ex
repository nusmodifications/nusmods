defmodule SyncWeb.Schema.DataTypes do
  use Absinthe.Schema.Notation

  object :school do
    field(:id, :id)
    field(:name, :string)
    field(:slug, :string)

    field :acad_years, list_of(:acad_year) do
      resolve(&SyncWeb.Resolvers.Data.list_acad_years/3)
    end
  end

  object :acad_year do
    field(:id, :id)
    field(:name, :string)
  end
end
