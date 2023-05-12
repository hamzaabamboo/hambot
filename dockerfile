FROM node:18-alpine As development

WORKDIR /app

RUN apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation fontconfig

RUN apk add && apk --no-cache add \
    sudo \
    curl \
    build-base \
    g++ \
    libpng \
    libpng-dev \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    python3 \
    ffmpeg

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN echo "Y" | pnpm install --shamefully-hoist --config.auto-install-peers=true --strict-peer-dependencies

COPY ./ .

RUN pnpm build
RUN pnpm build:next

RUN pnpm prune --prod

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["pnpm", "start"]