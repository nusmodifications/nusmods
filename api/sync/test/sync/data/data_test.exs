defmodule Sync.DataTest do
  use Sync.DataCase

  alias Sync.Data

  describe "schools" do
    alias Sync.Data.School

    @valid_attrs %{short_name: "some short name", long_name: "some long name", slug: "some slug"}
    @update_attrs %{
      short_name: "some updated short name",
      long_name: "some updated long name",
      slug: "some updated slug"
    }
    @invalid_attrs %{long_name: nil, slug: nil}

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
      assert school.short_name == "some short name"
      assert school.long_name == "some long name"
      assert school.slug == "some slug"
    end

    test "create_school/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Data.create_school(@invalid_attrs)
    end

    test "update_school/2 with valid data updates the school" do
      school = school_fixture()
      assert {:ok, school} = Data.update_school(school, @update_attrs)
      assert %School{} = school
      assert school.short_name == "some updated short name"
      assert school.long_name == "some updated long name"
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

  describe "acad_years" do
    alias Sync.Data.AcadYear

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def acad_year_fixture(attrs \\ %{}) do
      {:ok, acad_year} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Data.create_acad_year()

      acad_year
    end

    test "list_acad_years/0 returns all acad_years" do
      acad_year = acad_year_fixture()
      assert Data.list_acad_years() == [acad_year]
    end

    test "get_acad_year!/1 returns the acad_year with given id" do
      acad_year = acad_year_fixture()
      assert Data.get_acad_year!(acad_year.id) == acad_year
    end

    test "create_acad_year/1 with valid data creates a acad_year" do
      assert {:ok, %AcadYear{} = acad_year} = Data.create_acad_year(@valid_attrs)
      assert acad_year.name == "some name"
    end

    test "create_acad_year/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Data.create_acad_year(@invalid_attrs)
    end

    test "update_acad_year/2 with valid data updates the acad_year" do
      acad_year = acad_year_fixture()
      assert {:ok, acad_year} = Data.update_acad_year(acad_year, @update_attrs)
      assert %AcadYear{} = acad_year
      assert acad_year.name == "some updated name"
    end

    test "update_acad_year/2 with invalid data returns error changeset" do
      acad_year = acad_year_fixture()
      assert {:error, %Ecto.Changeset{}} = Data.update_acad_year(acad_year, @invalid_attrs)
      assert acad_year == Data.get_acad_year!(acad_year.id)
    end

    test "delete_acad_year/1 deletes the acad_year" do
      acad_year = acad_year_fixture()
      assert {:ok, %AcadYear{}} = Data.delete_acad_year(acad_year)
      assert_raise Ecto.NoResultsError, fn -> Data.get_acad_year!(acad_year.id) end
    end

    test "change_acad_year/1 returns a acad_year changeset" do
      acad_year = acad_year_fixture()
      assert %Ecto.Changeset{} = Data.change_acad_year(acad_year)
    end
  end

  describe "semesters" do
    alias Sync.Data.Semester

    @valid_attrs %{name: "some name"}
    @update_attrs %{name: "some updated name"}
    @invalid_attrs %{name: nil}

    def semester_fixture(attrs \\ %{}) do
      {:ok, semester} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Data.create_semester()

      semester
    end

    test "list_semesters/0 returns all semesters" do
      semester = semester_fixture()
      assert Data.list_semesters() == [semester]
    end

    test "get_semester!/1 returns the semester with given id" do
      semester = semester_fixture()
      assert Data.get_semester!(semester.id) == semester
    end

    test "create_semester/1 with valid data creates a semester" do
      assert {:ok, %Semester{} = semester} = Data.create_semester(@valid_attrs)
      assert semester.name == "some name"
    end

    test "create_semester/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Data.create_semester(@invalid_attrs)
    end

    test "update_semester/2 with valid data updates the semester" do
      semester = semester_fixture()
      assert {:ok, semester} = Data.update_semester(semester, @update_attrs)
      assert %Semester{} = semester
      assert semester.name == "some updated name"
    end

    test "update_semester/2 with invalid data returns error changeset" do
      semester = semester_fixture()
      assert {:error, %Ecto.Changeset{}} = Data.update_semester(semester, @invalid_attrs)
      assert semester == Data.get_semester!(semester.id)
    end

    test "delete_semester/1 deletes the semester" do
      semester = semester_fixture()
      assert {:ok, %Semester{}} = Data.delete_semester(semester)
      assert_raise Ecto.NoResultsError, fn -> Data.get_semester!(semester.id) end
    end

    test "change_semester/1 returns a semester changeset" do
      semester = semester_fixture()
      assert %Ecto.Changeset{} = Data.change_semester(semester)
    end
  end

  describe "modules" do
    alias Sync.Data.Module

    @valid_attrs %{
      code: "some code",
      description: "some description",
      slug: "some slug",
      title: "some title"
    }
    @update_attrs %{
      code: "some updated code",
      description: "some updated description",
      slug: "some updated slug",
      title: "some updated title"
    }
    @invalid_attrs %{code: nil, description: nil, slug: nil, title: nil}

    def module_fixture(attrs \\ %{}) do
      {:ok, module} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Data.create_module()

      module
    end

    test "list_modules/0 returns all modules" do
      module = module_fixture()
      assert Data.list_modules() == [module]
    end

    test "get_module!/1 returns the module with given id" do
      module = module_fixture()
      assert Data.get_module!(module.id) == module
    end

    test "create_module/1 with valid data creates a module" do
      assert {:ok, %Module{} = module} = Data.create_module(@valid_attrs)
      assert module.code == "some code"
      assert module.description == "some description"
      assert module.slug == "some slug"
      assert module.title == "some title"
    end

    test "create_module/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Data.create_module(@invalid_attrs)
    end

    test "update_module/2 with valid data updates the module" do
      module = module_fixture()
      assert {:ok, module} = Data.update_module(module, @update_attrs)
      assert %Module{} = module
      assert module.code == "some updated code"
      assert module.description == "some updated description"
      assert module.slug == "some updated slug"
      assert module.title == "some updated title"
    end

    test "update_module/2 with invalid data returns error changeset" do
      module = module_fixture()
      assert {:error, %Ecto.Changeset{}} = Data.update_module(module, @invalid_attrs)
      assert module == Data.get_module!(module.id)
    end

    test "delete_module/1 deletes the module" do
      module = module_fixture()
      assert {:ok, %Module{}} = Data.delete_module(module)
      assert_raise Ecto.NoResultsError, fn -> Data.get_module!(module.id) end
    end

    test "change_module/1 returns a module changeset" do
      module = module_fixture()
      assert %Ecto.Changeset{} = Data.change_module(module)
    end
  end
end
