git pull

# NOTE: Not tested, but reasoning how this would work

# Build and deploy green, we have 2 versions now
docker-compose --project-name=green  -f docker-compose.prod.yml build --no-cache
docker-compose --project-name=green  -f docker-compose.prod.yml up

# Probably wait a while here

# Build the new blue and restart blue, bringing it to latest
docker-compose --project-name=blue -f docker-compose.prod.yml build --no-cache
docker-compose --project-name=blue -f docker-compose.prod.yml down --remove-orphans
docker-compose --project-name=blue -f docker-compose.prod.yml up

# Probably wait a while here

# Tear down green, we can now reuse it for next deploy
docker-compose --project-name=green  -f docker-compose.prod.yml down --remove-orphans
