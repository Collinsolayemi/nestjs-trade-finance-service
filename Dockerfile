# Base Stage
FROM node:20-alpine AS base
WORKDIR /app

# Development Stage
FROM base AS development
# Install build tools and Python
RUN apk add --no-cache \
    build-base \
    python3 \
    py3-pip
COPY . /app
RUN yarn install --production=false
RUN cp -R node_modules /tmp/node_modules
RUN yarn build

# Production Stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=development /tmp/node_modules ./node_modules
COPY --from=development /app/dist ./dist
COPY --from=development /app/package.json ./package.json

ENV NODE_OPTIONS="--enable-source-maps"
EXPOSE 3000
CMD ["node", "dist/main.js"]