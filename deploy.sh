GIT_SSH_COMMAND="ssh -i ~/hambot_keys/github_key" git pull origin master
docker-compose build
docker-compose up --no-deps -d --build
docker-compose exec -T backend yarn prisma-deploy
docker-compose restart nginx