defmodule SyncWeb.Schema do
  use Absinthe.Schema
  import_types(SyncWeb.Schema.DataTypes)

  alias SyncWeb.Resolvers

  query do
    @desc "Get all schools"
    field :schools, list_of(:school) do
      resolve(&Resolvers.Data.list_schools/3)
    end

    @desc "Get academic years"
    field :acad_years, list_of(:acad_year) do
      arg(:school_abbr, :string)
      resolve(&Resolvers.Data.list_acad_years/3)
    end
  end
end
