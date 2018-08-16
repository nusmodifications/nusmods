defmodule SyncWeb.Schema.ContentTypes do
  use Absinthe.Schema.Notation

  object :school do
    field(:id, :id)
    field(:name, :string)
    field(:slug, :string)
  end
end
