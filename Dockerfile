# --- deps ---
FROM node:20 AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --force

# --- build ---
FROM node:20 AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
RUN pnpm build

# --- runtime ---
FROM node:20 AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./ || true
EXPOSE 3000
CMD ["pnpm", "start"]
