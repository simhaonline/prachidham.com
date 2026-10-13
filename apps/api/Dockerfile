FROM node:22-alpine AS build
WORKDIR /workspace
RUN npm install -g pnpm@10.17.1
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
RUN pnpm --filter @prachi/api build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
USER node
EXPOSE 4000
CMD ["node", "apps/api/dist/src/main.js"]
