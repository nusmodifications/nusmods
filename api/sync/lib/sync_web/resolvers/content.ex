defmodule SyncWeb.Resolvers.Content do
  def list_schools(_parent, _args, _resolution) do
    {:ok, Sync.Data.list_schools()}
  end
end
