FROM oven/bun:1 as base
WORKDIR /app

FROM base as builder
COPY . .
RUN bun install --production --frozen-lockfile
RUN bun build --target bun --minify src/index.ts --outfile app.js

FROM base
COPY --from=builder /app/app.js .
ENTRYPOINT [ "bun", "run", "app.js" ]
