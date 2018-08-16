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
    field(:school, :school, resolve: dataloader(Sync.Data))
    field(:semesters, list_of(:semester), resolve: dataloader(Sync.Data))
  end

  object :semester do
    field(:id, :id)
    field(:name, :string)
    field(:acad_year, :acad_year, resolve: dataloader(Sync.Data))
    field(:modules, list_of(:module), resolve: dataloader(Sync.Data))
  end

  object :module do
    field(:id, :id)
    field(:code, :string)
    field(:title, :string)
    field(:description, :string)
    field(:slug, :string)
    field(:semester, :semester, resolve: dataloader(Sync.Data))
  end
end
