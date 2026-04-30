FROM node:22-alpine
WORKDIR /app

COPY server-admin/package.json server-admin/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY server-admin/. ./
EXPOSE 4000
CMD ["node", "index.js"]
