# --- Dev stage (for docker compose up in dev)
FROM node:24 AS dev
WORKDIR /code
COPY package*.json ./
RUN npm ci
COPY ./docker-entrypoint.sh /sbin/
RUN chmod 755 /sbin/docker-entrypoint.sh
ENTRYPOINT ["/sbin/docker-entrypoint.sh"]
CMD ["watch"]

# --- Build stage
FROM node:24 AS build
WORKDIR /code
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage
FROM node:24-alpine AS runtime
WORKDIR /code
COPY --from=build /code/package*.json ./
COPY --from=build /code/node_modules ./node_modules
COPY --from=build /code/build ./build

COPY ./docker-entrypoint.sh /sbin/
RUN chmod 755 /sbin/docker-entrypoint.sh
ENTRYPOINT ["/sbin/docker-entrypoint.sh"]
CMD ["prod"]
