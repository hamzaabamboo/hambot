yes | docker system prune
docker compose -f docker-compose.deploy.yml build
docker compose -f docker-compose.deploy.yml up --no-deps -d --build
docker compose -f docker-compose.deploy.yml restart backend