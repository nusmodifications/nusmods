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

nus = %Sync.Data.School{
  name: "National University of Singapore",
  slug: "NUS",
  acad_years: [
    %Sync.Data.AcadYear{
      name: "AY2018/19"
    }
  ]
}

Sync.Repo.insert!(nus)
