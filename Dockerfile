# ---- BASE ----
FROM node:26-alpine AS base
RUN npm install -g pnpm

# ---- BUILDER ----
FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/web/package.json ./packages/web/
COPY packages/socket/package.json ./packages/socket/
COPY packages/e2e/package.json ./packages/e2e/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

RUN VITE_BASE=/__RAZZIA_BASE__/ pnpm build

# ---- RUNNER ----
FROM alpine:3.24.2 AS runner

RUN apk add --no-cache nginx nodejs supervisor

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

COPY docker/entrypoint.sh /entrypoint.sh

COPY --from=builder /app/packages/web/dist /app/web-dist
COPY --from=builder /app/packages/socket/dist/index.cjs /app/socket/index.cjs

EXPOSE 3000

# Tells razzia-manager that this image handles BASE_PATH itself, so its proxy
# only has to strip the prefix instead of rewriting the responses.
LABEL org.mg-group.razzia.base-path="1"

# Shown by razzia-manager next to each instance (set by the MG Image workflow)
ARG RAZZIA_VERSION=dev
ARG RAZZIA_REVISION=unknown
LABEL org.opencontainers.image.version="$RAZZIA_VERSION" \
      org.opencontainers.image.revision="$RAZZIA_REVISION"

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
