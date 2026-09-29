FROM node:22-alpine AS base
RUN npm i -g turbo@^2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune apps/web apps/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=apps-web --filter=apps-api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_STANDALONE=1
COPY --from=installer /app/apps/api/dist ./apps/api/dist
COPY --from=installer /app/apps/api/package.json ./apps/api/
COPY --from=installer /app/apps/api/prisma ./apps/api/prisma
COPY --from=installer /app/apps/web/.next/standalone ./standalone
COPY --from=installer /app/apps/web/.next/static ./standalone/apps/web/.next/static
COPY --from=installer /app/apps/web/public ./standalone/apps/web/public
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/package.json ./package.json
EXPOSE 3000 3001

