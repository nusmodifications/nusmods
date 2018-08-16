defmodule SyncWeb.Resolvers.Data do
  def list_schools(_parent, _args, _resolution) do
    {:ok, Sync.Data.list_schools()}
  end

  def get_school(_parent, args, _resolution) do
    try do
      {:ok, Sync.Data.get_school!(args)}
    rescue
      Ecto.NoResultsError -> {:error, "School not found"}
      Ecto.MultipleResultsError -> {:error, "Multiple schools found"}
    end
  end

  def list_acad_years(_parent, _args, _resolution) do
    {:ok, Sync.Data.list_acad_years()}
  end
end
