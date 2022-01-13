build: ensure
	docker-compose build --parallel

ensure:
	bash scripts/ensure.sh

up: build
	docker-compose up -d

stop: ensure
	docker-compose stop

down: ensure
	docker-compose down