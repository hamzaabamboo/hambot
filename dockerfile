FROM node:alpine As development

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn global add @nestjs/cli

RUN yarn

COPY . .

RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
EXPOSE ${PORT}

CMD ["npm", "start"]