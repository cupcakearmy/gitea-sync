FROM node:18.15-alpine as base

RUN npm -g install pnpm@7
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

FROM base as build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base as runner
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist /app/dist
CMD ["pnpm", "run", "start"]




