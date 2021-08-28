FROM node:16-alpine3.14 As development

WORKDIR /app

RUN yarn global add @nestjs/cli

RUN apk add --update  --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig

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
    python3

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["npm", "start"]