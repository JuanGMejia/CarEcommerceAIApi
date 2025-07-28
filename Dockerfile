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

# Dynamically create .env file inside the container
RUN echo "CLIENT_ID=$CLIENT_ID" > .env \
 && echo "TENANT_ID=$TENANT_ID" >> .env \
 && echo "QDRANT_ID=$QDRANT_ID" >> .env \
 && echo "QDRANT_URL=$QDRANT_URL" >> .env \
 && echo "NODE_ENV=production" >> .env

CMD ["node", "dist/main"]
EXPOSE 3000
