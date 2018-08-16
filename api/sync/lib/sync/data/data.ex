defmodule Sync.Data do
  @moduledoc """
  The Data context.
  """

  import Ecto.Query, warn: false
  alias Sync.Repo

  alias Sync.Data.School

  @doc """
  Returns the list of schools.

  ## Examples

      iex> list_schools()
      [%School{}, ...]

  """
  def list_schools do
    Repo.all(School)
  end

  @doc """
  Gets a single school.

  Raises `Ecto.NoResultsError` if the School does not exist.

  ## Examples

      iex> get_school!(123)
      %School{}

      iex> get_school!(456)
      ** (Ecto.NoResultsError)

  """
  def get_school!(id) do
    Repo.get!(School, id)
  end

  @doc """
  Creates a school.

  ## Examples

      iex> create_school(%{field: value})
      {:ok, %School{}}

      iex> create_school(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_school(attrs \\ %{}) do
    %School{}
    |> School.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a school.

  ## Examples

      iex> update_school(school, %{field: new_value})
      {:ok, %School{}}

      iex> update_school(school, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_school(%School{} = school, attrs) do
    school
    |> School.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a School.

  ## Examples

      iex> delete_school(school)
      {:ok, %School{}}

      iex> delete_school(school)
      {:error, %Ecto.Changeset{}}

  """
  def delete_school(%School{} = school) do
    Repo.delete(school)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking school changes.

  ## Examples

      iex> change_school(school)
      %Ecto.Changeset{source: %School{}}

  """
  def change_school(%School{} = school) do
    School.changeset(school, %{})
  end

  alias Sync.Data.AcadYear

  @doc """
  Returns the list of acad_years for a specific school.

  ## Examples

      iex> list_acad_years(school)
      [%AcadYear{}, ...]

  """
  def list_acad_years(school) do
    from(ay in AcadYear, where: ay.school_id == ^school.id)
    |> Repo.all()
  end

  @doc """
  Returns the list of acad_years.

  ## Examples

      iex> list_acad_years()
      [%AcadYear{}, ...]

  """
  def list_acad_years do
    Repo.all(AcadYear)
  end

  @doc """
  Gets a single acad_year.

  Raises `Ecto.NoResultsError` if the Acad year does not exist.

  ## Examples

      iex> get_acad_year!(123)
      %AcadYear{}

      iex> get_acad_year!(456)
      ** (Ecto.NoResultsError)

  """
  def get_acad_year!(id), do: Repo.get!(AcadYear, id)

  @doc """
  Creates a acad_year.

  ## Examples

      iex> create_acad_year(%{field: value})
      {:ok, %AcadYear{}}

      iex> create_acad_year(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_acad_year(attrs \\ %{}) do
    %AcadYear{}
    |> AcadYear.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a acad_year.

  ## Examples

      iex> update_acad_year(acad_year, %{field: new_value})
      {:ok, %AcadYear{}}

      iex> update_acad_year(acad_year, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_acad_year(%AcadYear{} = acad_year, attrs) do
    acad_year
    |> AcadYear.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a AcadYear.

  ## Examples

      iex> delete_acad_year(acad_year)
      {:ok, %AcadYear{}}

      iex> delete_acad_year(acad_year)
      {:error, %Ecto.Changeset{}}

  """
  def delete_acad_year(%AcadYear{} = acad_year) do
    Repo.delete(acad_year)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking acad_year changes.

  ## Examples

      iex> change_acad_year(acad_year)
      %Ecto.Changeset{source: %AcadYear{}}

  """
  def change_acad_year(%AcadYear{} = acad_year) do
    AcadYear.changeset(acad_year, %{})
  end
end
