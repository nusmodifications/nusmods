# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Sync.Repo.insert!(%Sync.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

Sync.Repo.delete_all(Sync.Coherence.User)
Sync.Repo.delete_all(Sync.Data.AcadYear)
Sync.Repo.delete_all(Sync.Data.School)

Sync.Coherence.User.changeset(%Sync.Coherence.User{}, %{
  name: "Test User",
  email: "testuser@example.com",
  password: "secret",
  password_confirmation: "secret"
})
|> Sync.Repo.insert!()
|> Coherence.ControllerHelpers.confirm!()

defmodule SchoolSeeder do
  def gen_abbr(str) do
    str |> String.split() |> Stream.map(&String.first/1) |> Enum.join()
  end

  def insert_school do
    uni_name = "#{Faker.Company.name()} University"

    %Sync.Data.School{
      name: uni_name,
      slug: gen_abbr(uni_name),
      acad_years: [
        %Sync.Data.AcadYear{
          name: "AY2018/19"
        }
      ]
    }
    |> Sync.Repo.insert!()
  end
end

num_fakes = 5

for _ <- 0..num_fakes do
  SchoolSeeder.insert_school()
end
