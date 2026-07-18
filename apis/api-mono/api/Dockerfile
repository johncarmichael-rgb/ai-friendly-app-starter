# --- Dev stage (for docker compose up in dev)
FROM node:24 AS dev
WORKDIR /code
# Same OOM guard as the build stage below: tsc-watch type-checks the full
# src tree and needs more than Node's default ~2GB old-space heap.
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY package*.json ./
RUN npm ci
COPY ./docker-entrypoint.sh /sbin/
RUN chmod 755 /sbin/docker-entrypoint.sh
ENTRYPOINT ["/sbin/docker-entrypoint.sh"]
CMD ["watch"]

# --- Build stage
FROM node:24 AS build
WORKDIR /code
# tsc type-checks the full src tree (incl. the generated http/ folder) and can
# blow past Node's default ~2GB old-space heap inside the container, OOM-ing
# the build. Give it more headroom (runners have ample RAM).
ENV NODE_OPTIONS=--max-old-space-size=4096
COPY package*.json openapi-nodegen-api-file.yml migrate-mongo-config.js migrations ./
RUN npm ci
COPY . .
RUN npm run build

# multi stage build
# runtime - only install prod deps, use the already built code from the build stage
FROM node:24-alpine AS runtime
WORKDIR /code
COPY --from=build /code/package*.json ./
COPY --from=build /code/node_modules ./node_modules
COPY --from=build /code/openapi-nodegen-api-file.yml ./
COPY --from=build /code/build ./build
COPY --from=build /code/src ./src
COPY --from=build /code/migrate-mongo-config.js ./
COPY --from=build /code/migrations ./migrations
COPY --from=build /code/emails ./emails
COPY ./docker-entrypoint.sh /sbin/
RUN chmod 755 /sbin/docker-entrypoint.sh
ENTRYPOINT [ "/sbin/docker-entrypoint.sh" ]
CMD ["prod"]
