FROM node:18-alpine As builder

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

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

RUN yarn install --production --frozen-lockfile

RUN rm -rf node_modules/date-fns/esm
RUN rm -rf node_modules/rxjs/dist/esm
RUN rm -rf node_modules/rxjs/dist/esm5
RUN rm -rf node_modules/rxjs/src
RUN rm -rf node_modules/typescript

RUN find . -name '*.d.ts' -delete
RUN find node_modules -name '*.ts' -delete
RUN find node_modules -name '*.mjs' -delete
RUN find node_modules -name '*.js.flow' -delete

RUN yes | npx modclean --ignore="highlight.js/lib/languages/makefile.js"

FROM node:18-alpine As runner

WORKDIR /app

COPY --from=builder /app .

RUN apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation fontconfig

RUN apk add && apk --no-cache add \
    libpng \
    libpng-dev \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    ffmpeg

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["node", "--experimental-wasm-threads", "dist/main.js"]