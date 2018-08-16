defmodule SyncWeb.Schema do
  use Absinthe.Schema
  import_types(SyncWeb.Schema.ContentTypes)

  alias SyncWeb.Resolvers

  query do
    @desc "Get all schools"
    field :schools, list_of(:school) do
      resolve(&Resolvers.Content.list_schools/3)
    end
  end
end
