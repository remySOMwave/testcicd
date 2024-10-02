commit:
	npm run test
	git add .
	git commit -m "$(c)"
	git push

# make commit c="nom commit"

restart:
	docker compose down
	docker compose up --build -d

studio:
	docker-compose exec app sh -c "npx prisma studio --port 5555"

migrate:
	docker-compose exec app sh -c "npx prisma migrate dev --name $(name)"

testunit:
	# docker-compose exec app sh -c "DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy && npm run test"
	docker-compose exec -e DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/testdb?schema=public" app sh -c "npx prisma migrate deploy && npm run test"
# testunit:
# 	# docker-compose --profile test up test --build
# 	docker-compose exec app sh -c "npm run test"

create-testdb:
	docker-compose exec postgres sh -c "psql -U myuser -d mydatabase -c 'CREATE DATABASE testdb;'"
	docker-compose exec app sh -c "DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy"

migrate-test:
	docker-compose exec app sh -c "DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy"
