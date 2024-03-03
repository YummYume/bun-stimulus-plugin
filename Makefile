COMPOSE=docker compose
EXEC=$(COMPOSE) exec bun-stimulus-plugin

.PHONY: test

# Starting and stopping the project
start:
	$(COMPOSE) up -d --remove-orphans --force-recreate

restart:
	$(COMPOSE) restart

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down

# SSH
ssh:
	$(EXEC) bash

# Logs
logs:
	$(COMPOSE) logs -f

# Test
test:
	docker run --rm -v $$(pwd):/home/bun/bun-stimulus-plugin -w /home/bun/bun-stimulus-plugin oven/bun:1.0 sh -c "bun install && bun test"

# Build
build:
	$(EXEC) bun run build

# Linting
lint:
	$(EXEC) bun run lint

# Format
format:
	$(EXEC) bun run format

# Changeset
changeset:
	bunx changeset

# Update
update:
	$(EXEC) bunx npm-check-updates -i
