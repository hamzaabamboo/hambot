FROM oven/bun:1-alpine AS build

WORKDIR /app

RUN apk add --update --no-cache \
    build-base \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    py3-setuptools \
    nodejs npm && \
    apk add --update --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY ./ .
RUN bun run build && bun run build:next
RUN rm -rf node_modules && bun install --frozen-lockfile --production && \
    rm -rf node_modules/@next/swc-*-gnu node_modules/@swc/core-*-gnu \
           node_modules/@next/swc-*-x64* node_modules/@swc/core-*-x64* \
           node_modules/puppeteer/.local-chromium

FROM oven/bun:1-alpine AS production

WORKDIR /app

RUN apk add --update --no-cache \
    cairo \
    jpeg \
    giflib \
    pango \
    ffmpeg && \
    apk add --update --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-freefont fontconfig

COPY --from=build /app/dist ./dist
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "dist/main.js"]
