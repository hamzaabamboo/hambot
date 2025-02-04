FROM node:20-alpine AS development

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
    ffmpeg && apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-freefont fontconfig

COPY package.json pnpm-lock.yaml ./

RUN npm install -g corepack

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate


RUN echo "Y" | pnpm install --shamefully-hoist --config.auto-install-peers=true --strict-peer-dependencies

COPY ./ .

RUN pnpm build
RUN pnpm build:next

RUN pnpm prune --prod

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["pnpm", "start:prod"]