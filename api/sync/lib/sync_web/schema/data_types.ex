defmodule SyncWeb.Schema.DataTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  object :school do
    field(:id, :id)
    field(:name, :string)
    field(:slug, :string)

    field(:acad_years, list_of(:acad_year), resolve: dataloader(Sync.Data))
  end

  object :acad_year do
    field(:id, :id)
    field(:name, :string)
  end
end
