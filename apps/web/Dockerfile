FROM node:22-alpine AS build
WORKDIR /workspace
ENV API_INTERNAL_URL=http://api:4000
ARG PUBLIC_SITE_ORIGIN=
ENV PUBLIC_SITE_ORIGIN=${PUBLIC_SITE_ORIGIN}
ARG PUBLIC_SITE_INDEXABLE=false
ENV PUBLIC_SITE_INDEXABLE=${PUBLIC_SITE_INDEXABLE}
RUN npm install -g pnpm@10.17.1
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile
COPY apps/web apps/web
RUN pnpm --filter @prachi/web build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /workspace/apps/web/.next ./apps/web/.next
COPY --from=build /workspace/apps/web/public ./apps/web/public
COPY --from=build /workspace/apps/web/package.json ./apps/web/package.json
COPY --from=build /workspace/apps/web/next.config.ts ./apps/web/next.config.ts
USER node
EXPOSE 3000
CMD ["./apps/web/node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000", "apps/web"]
