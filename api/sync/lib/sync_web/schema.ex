defmodule SyncWeb.Schema do
  use Absinthe.Schema
  import_types(SyncWeb.Schema.DataTypes)

  alias Sync.Data
  alias SyncWeb.Resolvers

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Data, Data.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

  query do
    @desc "Get all schools"
    field :schools, list_of(:school) do
      resolve(&Resolvers.Data.list_schools/3)
    end

    @desc "Find school"
    field :school, :school do
      arg(:id, :id)
      arg(:short_name, :string)
      arg(:long_name, :string)
      arg(:slug, :string)
      resolve(&Resolvers.Data.get_school/3)
    end

    @desc "Get academic years"
    field :acad_years, list_of(:acad_year) do
      arg(:school_slug, :string)
      resolve(&Resolvers.Data.list_acad_years/3)
    end

    @desc "Find academic year"
    field :acad_year, :acad_year do
      arg(:name, non_null(:string))
      arg(:school_slug, non_null(:string))
      resolve(&Resolvers.Data.get_acad_year/3)
    end
  end
end
