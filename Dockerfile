# Stage 1: Build
FROM node:24-alpine3.22 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine3.22
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist

# Accept arguments from GitHub Actions
ARG CLIENT_ID
ARG TENANT_ID
ARG QDRANT_ID
ARG QDRANT_URL
ARG OPENAI_ID
ARG AZURE_STORAGE_CONNECTION
ARG BLOB_CONTAINER
ARG BLOB_NAME
ARG APPINSIGHTS_CONNECTION_STRING

# Dynamically create .env file inside the container
RUN echo "CLIENT_ID=$CLIENT_ID" > .env \
 && echo "TENANT_ID=$TENANT_ID" >> .env \
 && echo "QDRANT_ID=$QDRANT_ID" >> .env \
 && echo "QDRANT_URL=$QDRANT_URL" >> .env \
 && echo "OPENAI_ID=$OPENAI_ID" >> .env \
 && echo "AZURE_STORAGE_CONNECTION=$AZURE_STORAGE_CONNECTION" >> .env \
 && echo "BLOB_CONTAINER=$BLOB_CONTAINER" >> .env \
 && echo "BLOB_NAME=$BLOB_NAME" >> .env \
 && echo "APPINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION_STRING" >> .env \
 && echo "NODE_ENV=production" >> .env

CMD ["node", "dist/main"]
EXPOSE 3000
