[working-directory: 'tutu-backend']
start-postgresql:
    docker compose up

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
