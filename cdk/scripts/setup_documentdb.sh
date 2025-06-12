#!/bin/bash

if [[ -z "${DB_HOST}" ]]; then
  echo "Environment variable DB_HOST not defined"
  exit 1
fi

if [[ -z "${DB_USER}" ]]; then
  echo "Environment variable DB_USER not defined"
  exit 1
fi

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "Environment variable DB_PASSWORD not defined"
  exit 1
fi

if [[ -z "${DB_NAME}" ]]; then
  echo "Environment variable DB_NAME not defined"
  exit 1
fi

if [[ -z "${AOE_USER}" ]]; then
  echo "Environment variable AOE_USER not defined"
  exit 1
fi

if [[ -z "${AOE_USER_PASSWORD}" ]]; then
  echo "Environment variable AOE_USER_PASSWORD not defined"
  exit 1
fi

if [[ -z "${CA_FILE}" ]]; then
  echo "Environment variable CA_FILE not defined"
  exit 1
fi

MONGO_COMMANDS="
db = db.getSiblingDB('$DB_NAME');

if (!db.getUser('$AOE_USER')) {
    db.createUser({
        user: '$AOE_USER',
        pwd: '$AOE_USER_PASSWORD',
        roles: [{ role: 'dbOwner', db: '$DB_NAME' }]
    });
    print('User $AOE_USER created.');
} else {
    print('User $AOE_USER already exists.');
}

if (!db.getCollectionNames().includes('search_requests')) {
    db.createCollection('search_requests');
    print('Collection search_requests created.');
} else {
    print('Collection search_requests already exists.');
}

if (!db.getCollectionNames().includes('material_activity')) {
    db.createCollection('material_activity');
    print('Collection material_activity created.');
} else {
    print('Collection material_activity already exists.');
}
"

echo "Connecting to DocumentDB and executing commands..."
mongo --ssl --host "$DB_HOST" --username "$DB_USER" --password "$DB_PASSWORD" --sslCAFile "$CA_FILE" --eval "$MONGO_COMMANDS"

if [ $? -eq 0 ]; then
  echo "Commands executed successfully!"
else
  echo "Failed to execute commands. Please check your connection and credentials."
fi