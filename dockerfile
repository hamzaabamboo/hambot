FROM node:alpine As development

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

FROM node:12.13-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn global add @nestjs/cli

RUN yarn

COPY . .

COPY --from=development /app/dist ./dist

ARG PORT=3000
EXPOSE ${PORT}

CMD ["npm", "start"]