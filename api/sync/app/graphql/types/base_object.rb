# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    def self.to_one_batch_resolver(model, key)
      # Use random batch key to separate data from different calls to this method
      batch_key = SecureRandom.hex

      lambda { |parent, _args, _ctx|
        BatchLoader.for(parent[key]).batch(key: batch_key) do |ids, loader|
          model.where(id: ids).each { |obj| loader.call(obj.id, obj) }
        end
      }
    end

    def self.to_many_batch_resolver(model, key)
      # Use random batch key to separate data from different calls to this method
      batch_key = SecureRandom.hex

      lambda { |parent, _args, _ctx|
        BatchLoader.for(parent.id).batch(key: batch_key, default_value: []) do |ids, loader|
          model.where(key => ids).each do |obj|
            loader.call(obj[key]) { |memo| memo << obj }
          end
        end
      }
    end
  end
end
