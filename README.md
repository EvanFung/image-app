npm install
docker-compose up -d
npx prisma migrate dev --preview-feature --skip-generate --name "init"