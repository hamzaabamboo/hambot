git pull origin master
docker-compose build
docker-compose up --no-deps -d --build
docker-compose exec -T backend yarn prisma-deploy
docker-compose restart nginx