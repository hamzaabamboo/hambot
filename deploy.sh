docker compose -f docker-compose.deploy.yml pull backend
docker compose -f docker-compose.deploy.yml up -d --no-deps backend
docker image prune -f
