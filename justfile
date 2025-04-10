[working-directory: 'tutu-backend']
start-postgresql:
    docker compose up -d
    ./wait-for-postgres.sh

[working-directory: 'tutu-backend']
start-dev-backend:
    mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --spring.config.additional-location=classpath:/oph-configuration/application.properties"

[working-directory: 'tutu-frontend']
start-dev-frontend:
    npm run dev

install-local:
    cd tutu-backend && ./mvnw install
    cd tutu-frontend && npm ci
    cd tutu-frontend && npx playwright install


# CI
[working-directory: 'tutu-frontend']
_playwright-in-docker:
    #!/usr/bin/env bash
    PLAYWRIGHT_VERSION=$(node -e "console.log(require('./package-lock.json').packages['node_modules/@playwright/test'].version)")
    docker run --mount type=bind,source=$PWD,target=/app --user "$(id -u):$(id -g)" -w /app \
    --add-host=host.docker.internal:host-gateway -e DOCKER=1 \
    mcr.microsoft.com/playwright:v$PLAYWRIGHT_VERSION \
    npx playwright test

start-all:
    echo "Starting tutu, hit CTRL+C few times to quit."
    just start-postgresql
    just start-dev-backend &
    echo "Waiting for tutu-backend to get up..."; \
    until curl -s http://localhost:8443/tutu-backend/api/healthcheck | grep -q 'Tutu'; do \
        echo "Waiting for backend to get up..."; \
        sleep 1; \
    done; \
    echo "Backend running!"
    just start-dev-frontend