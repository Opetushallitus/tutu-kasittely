[working-directory: 'tutu-backend']
start-postgresql:
    docker compose up

[working-directory: 'tutu-frontend']
start-dev-frontend:
    npm run dev

install:
    cd tutu-backend && ./mvnw install
    cd tutu-frontend && npm install