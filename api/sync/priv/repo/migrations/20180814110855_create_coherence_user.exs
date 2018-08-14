defmodule Sync.Repo.Migrations.CreateCoherenceUser do
  use Ecto.Migration

  def change do
    create table(:users) do
      add(:name, :string)
      add(:email, :string)
      # authenticatable
      add(:password_hash, :string)
      # recoverable
      add(:reset_password_token, :string)
      add(:reset_password_sent_at, :utc_datetime)
      # trackable
      add(:sign_in_count, :integer, default: 0)
      add(:current_sign_in_at, :utc_datetime)
      add(:last_sign_in_at, :utc_datetime)
      add(:current_sign_in_ip, :string)
      add(:last_sign_in_ip, :string)
      # unlockable_with_token
      add(:unlock_token, :string)
      # confirmable
      add(:confirmation_token, :string)
      add(:confirmed_at, :utc_datetime)
      add(:confirmation_sent_at, :utc_datetime)

      timestamps()
    end

    create(unique_index(:users, [:email]))
  end
end
