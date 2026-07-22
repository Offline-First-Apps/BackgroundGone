# Build from the monorepo root: docker build -f apps/web/Dockerfile .
#
# Adapted from already-deployed sibling projects — same stack and monorepo shape (pnpm
# workspaces with the `catalog:` protocol, Next.js web app depending only on packages/env +
# packages/config, no database dependency). Those repos already hit real errors deploying this
# exact pattern; this file carries those fixes forward even where the reasoning isn't obvious
# from this codebase alone.
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# Copy workspace manifests + lockfile first for layer caching.
# packages/db and packages/ui are intentionally excluded — this web app has no database
# dependency and no longer depends on the shared ui package; it only depends on
# @backgroundgone/env (runtime + next.config validation) and @backgroundgone/config (tsconfig
# base) — see apps/web/package.json.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/env/package.json packages/env/
COPY apps/web/package.json apps/web/

# NEXT_PUBLIC_SERVER_URL (packages/env/src/web.ts) is read at the top of next.config.ts
# (`import "@backgroundgone/env/web"`) and baked into the client bundle at build time — it is
# NOT read at container runtime, and it's required (env-nextjs throws if missing), so
# `next build` fails without it. It MUST be provided at build time, not just as a runtime env.
# Override via: --build-arg NEXT_PUBLIC_SERVER_URL=https://your-api.example.com
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm install --frozen-lockfile

# Source after install for better layer caching.
COPY packages/config/ packages/config/
COPY packages/env/ packages/env/
COPY apps/web/ apps/web/

RUN pnpm --filter web build

# ---- Runner ----
FROM node:22-slim AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

# next.config.ts doesn't set `output: "standalone"`, so `next start` needs the full
# node_modules tree rather than a pruned bundle — copied wholesale from the builder instead of
# reinstalled here.
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["pnpm", "start"]
