#!/bin/bash

# Step 1: Navigate to Tutu UI directory and create certificates
echo "Creating certificates using mkcert..."
mkdir -p tutu-frontend/certificates
cd tutu-ui/certificates || exit

mkcert localhost

# Step 2: Navigate back to project root
echo "Returning to project root..."
cd ../..

# Step 3: Create the keystore in the backend resources directory
echo "Creating the keystore for localhost..."

openssl pkcs12 -export \
    -in tutu-frontend/certificates/localhost.pem \
    -inkey tutu-frontend/certificates/localhost-key.pem \
    -out tutu-backend/src/main/resources/localhost-keystore.p12 \
    -name tutu-backend \
    -passout pass:tutubackendkey

if [ $? -eq 0 ]; then
    echo "Keystore created successfully at tutu-backend/src/main/resources/localhost-keystore.p12"
else
    echo "Failed to create the keystore. Please check the logs above for errors."
fi