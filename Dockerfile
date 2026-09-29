FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN node --version && npm --version

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev


FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
