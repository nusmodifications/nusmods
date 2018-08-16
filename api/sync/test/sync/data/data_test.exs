defmodule Sync.DataTest do
  use Sync.DataCase

  alias Sync.Data

  describe "schools" do
    alias Sync.Data.School

    @valid_attrs %{name: "some name", slug: "some slug"}
    @update_attrs %{name: "some updated name", slug: "some updated slug"}
    @invalid_attrs %{name: nil, slug: nil}

    def school_fixture(attrs \\ %{}) do
      {:ok, school} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Data.create_school()

      school
    end

    test "list_schools/0 returns all schools" do
      school = school_fixture()
      assert Data.list_schools() == [school]
    end

    test "get_school!/1 returns the school with given id" do
      school = school_fixture()
      assert Data.get_school!(school.id) == school
    end

    test "create_school/1 with valid data creates a school" do
      assert {:ok, %School{} = school} = Data.create_school(@valid_attrs)
      assert school.name == "some name"
      assert school.slug == "some slug"
    end

    test "create_school/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Data.create_school(@invalid_attrs)
    end

    test "update_school/2 with valid data updates the school" do
      school = school_fixture()
      assert {:ok, school} = Data.update_school(school, @update_attrs)
      assert %School{} = school
      assert school.name == "some updated name"
      assert school.slug == "some updated slug"
    end

    test "update_school/2 with invalid data returns error changeset" do
      school = school_fixture()
      assert {:error, %Ecto.Changeset{}} = Data.update_school(school, @invalid_attrs)
      assert school == Data.get_school!(school.id)
    end

    test "delete_school/1 deletes the school" do
      school = school_fixture()
      assert {:ok, %School{}} = Data.delete_school(school)
      assert_raise Ecto.NoResultsError, fn -> Data.get_school!(school.id) end
    end

    test "change_school/1 returns a school changeset" do
      school = school_fixture()
      assert %Ecto.Changeset{} = Data.change_school(school)
    end
  end
end
