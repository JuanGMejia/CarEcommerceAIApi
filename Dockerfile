# Stage 1: Build NestJS app
FROM node:24-alpine3.22 AS builder
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD ["npm", "run", "start"]
