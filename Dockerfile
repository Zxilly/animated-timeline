FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

RUN echo "deb http://deb.debian.org/debian sid main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends webp gifsicle && \
    rm -rf /var/lib/apt/lists/*

CMD [ "node", "/app/dist/index.js" ]