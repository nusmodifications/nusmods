defmodule SyncWeb.Schema.DataTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  import_types(Absinthe.Type.Custom)

  object :school do
    field(:id, :id)
    field(:short_name, :string)
    field(:long_name, :string)
    field(:slug, :string)
    field(:acad_years, list_of(:acad_year), resolve: dataloader(Sync.Data))
    # field(:faculties, list_of(:faculty), resolve: dataloader(Sync.Data))
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
    # field(:department, :string)
    # field(:credit, :integer)
    # field(:workload, :string)
    # field(:preclusion, :string)
    # field(:prerequisite, :string)
    # field(:corequisite, :string)
    field(:semester, :semester, resolve: dataloader(Sync.Data))
    # field(:lessons, list_of(:lesson), resolve: dataloader(Sync.Data))
    # field(:cors_bidding_stats, list_of(:cors_bidding_stat), resolve: dataloader(Sync.Data))
  end

  # To be implemented

  # May not be worth implementing as CORS will be replaced after this AY
  # object :cors_bidding_stat do
  # field(:id, :id)
  # # Incomplete
  # end

  object :faculty do
    field(:id, :id)
    field(:name, :string)
    field(:slug, :string)
    field(:school, :school, resolve: dataloader(Sync.Data))
    field(:venues, list_of(:venue), resolve: dataloader(Sync.Data))
  end

  object :venue do
    field(:id, :id)
    field(:code, :string)
    field(:name, :string)
    field(:slug, :string)
    field(:floor, :integer)
    field(:lat, :float)
    field(:long, :float)
    field(:altitude, :float)
    field(:faculty, :faculty, resolve: dataloader(Sync.Data))
    field(:lessons, list_of(:lesson), resolve: dataloader(Sync.Data))
  end

  object :lesson do
    field(:id, :id)
    field(:code, :string)
    field(:type, :string)
    # Enum? Since it's Monday, Tuesday, etc
    field(:day, :string)
    field(:start_time, :time)
    field(:end_time, :time)
    field(:week_text, :string)
    field(:module, :module, resolve: dataloader(Sync.Data))
    field(:venue, :venue, resolve: dataloader(Sync.Data))
  end
end
