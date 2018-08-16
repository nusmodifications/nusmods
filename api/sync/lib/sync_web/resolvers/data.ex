defmodule SyncWeb.Resolvers.Data do
  def list_schools(_parent, _args, _resolution) do
    {:ok, Sync.Data.list_schools()}
  end

  def list_acad_years(_parent, _args, _resolution) do
    {:ok, Sync.Data.list_acad_years()}
  end
end
