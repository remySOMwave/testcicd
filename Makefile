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
	docker-compose exec app sh -c "DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy && npm run test"

# testunit:
# 	# docker-compose --profile test up test --build
# 	docker-compose exec app sh -c "npm run test"

create-testdb:
	docker exec -i pmscan_backend-postgres-1 psql -U myuser -d mydatabas -c "CREATE DATABASE testdb;"

migrate-test:
	docker-compose exec app sh -c "DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy"
