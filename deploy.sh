yes | docker system prune
docker-compose build
docker-compose up --no-deps -d --build
docker-compose restart backend