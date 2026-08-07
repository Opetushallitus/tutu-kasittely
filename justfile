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

[working-directory: 'tutu-frontend']
_playwright-in-docker-ci:
    #!/usr/bin/env bash
    set -euo pipefail
    pnpm list --json @playwright/test > pw.json
    PLAYWRIGHT_VERSION=$(node -e "console.log(require('./pw.json')[0].devDependencies['@playwright/test'].version)")
    rm pw.json
    docker run --rm \
      --mount "type=bind,source=$PWD,target=/app" \
      --user "$(id -u):$(id -g)" \
      -w /app \
      -e CI=1 \
      -e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
      mcr.microsoft.com/playwright:v"$PLAYWRIGHT_VERSION"-noble \
      ./node_modules/.bin/playwright test --project="${PLAYWRIGHT_PROJECT:-chromium}"

[working-directory: 'tutu-frontend']
playwright-docker:
    #!/usr/bin/env bash
    set -euo pipefail
    pnpm list --json @playwright/test > pw.json
    PLAYWRIGHT_VERSION=$(node -e "console.log(require('./pw.json')[0].devDependencies['@playwright/test'].version)")
    rm pw.json
    NPMRC_MOUNT=()
    if [ -f "$HOME/.npmrc" ]; then
      NPMRC_MOUNT=(--mount "type=bind,source=$HOME/.npmrc,target=/root/.npmrc,readonly")
    else
      echo "⚠️  No ~/.npmrc — GitHub Packages auth will likely fail." >&2
    fi
    docker run --rm \
      --mount "type=bind,source=$PWD,target=/app" \
      --mount "type=volume,source=tutu-frontend-node-modules,target=/app/node_modules" \
      "${NPMRC_MOUNT[@]}" \
      -w /app \
      -e CI=1 \
      -e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
      -e "PLAYWRIGHT_PROJECT=${PLAYWRIGHT_PROJECT:-chromium}" \
      -e "HOST_UID=$(id -u)" \
      -e "HOST_GID=$(id -g)" \
      mcr.microsoft.com/playwright:v"$PLAYWRIGHT_VERSION"-noble \
      bash -c '
        set -e
        corepack enable
        pnpm install --frozen-lockfile
        set +e
        ./node_modules/.bin/playwright test --project="$PLAYWRIGHT_PROJECT"
        code=$?
        chown -R "$HOST_UID:$HOST_GID" /app/test-results /app/playwright-report 2>/dev/null || true
        exit $code
      '
