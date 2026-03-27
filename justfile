[working-directory: 'tutu-backend']
start-postgresql:
    @echo "🚀 Starting PostgreSQL..."
    @docker compose up -d tutu-postgres

[working-directory: 'tutu-backend']
wait-for-db:
    @echo "🕐 Waiting for PostgreSQL to be ready..."
    @until docker exec tutu-postgres pg_isready -U app -d tutu > /dev/null 2>&1; do \
        echo "🕐 Still waiting..."; \
        sleep 5; \
    done
    @echo "✅ PostgreSQL is ready!"

start-db-and-wait: start-postgresql wait-for-db

[working-directory: 'tutu-backend']
start-dev-backend:
    ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Duser.timezone=UTC" -Dspring-boot.run.arguments="--spring.profiles.active=dev --spring.config.additional-location=classpath:/oph-configuration/application.properties"
    @echo "✅ Backend running!"

[working-directory: 'tutu-frontend']
start-dev-frontend:
    pnpm dev
    @echo "✅ Frontend running!"

install-local:
    cd tutu-backend && ./mvnw install
    cd tutu-frontend && pnpm install
    cd tutu-frontend && pnpm exec playwright install

start-all:
    @echo "🚀 Starting tutu, hit CTRL+C few times to quit."
    just start-db-and-wait
    just start-dev-backend &
    @until curl -s http://localhost:8444/tutu-backend/api/healthcheck | grep -q 'Tutu' || curl -s https://localhost:8444/tutu-backend/api/healthcheck | grep -q 'Tutu'; do \
        echo "🕐 Waiting for tutu-backend to get up..."; \
        sleep 5; \
    done; \
    just start-dev-frontend

# CI
[working-directory: 'tutu-frontend']
_playwright-in-docker:
    #!/usr/bin/env bash
    pnpm list --json @playwright/test > pw.json
    PLAYWRIGHT_VERSION=$(node -e "console.log(require('./pw.json')[0].devDependencies['@playwright/test'].version)")
    rm pw.json
    docker run --mount type=bind,source=$PWD,target=/app --user "$(id -u):$(id -g)" -w /app \
    --add-host=host.docker.internal:host-gateway -e DOCKER=1 \
    mcr.microsoft.com/playwright:v"$PLAYWRIGHT_VERSION"-noble \
    npx playwright test --project=$PLAYWRIGHT_PROJECT
