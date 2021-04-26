FROM node:current-alpine As development

WORKDIR /app

RUN yarn global add @nestjs/cli

RUN apk add && apk --no-cache add --virtual native-deps g++ gcc libgcc libstdc++ linux-headers make python libpcap-dev ffmpeg cairo pango

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["npm", "start"]