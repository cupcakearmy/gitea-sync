FROM denoland/deno AS builder
WORKDIR /app

COPY . .
RUN deno install --frozen
RUN deno compile --allow-net --allow-env --no-prompt --output /app/sync ./src/index.ts

FROM debian:stable-slim
WORKDIR /app
COPY --from=builder /app/sync .
ENTRYPOINT [ "/app/sync" ]
