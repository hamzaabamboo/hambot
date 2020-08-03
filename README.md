# HamBot

Personal cross-platform bot to help keep up with tasks and lots more stuff. Built with scalability and least pain to add new features.

## Integrations

- [x] Line Messaging API
- [x] Discord Bot
- [x] Trello
- [x] Messenger
- [ ] Github

## Features

### Core Functionality

- [x] Ping
- [x] Authorization
- [x] Line integration
- [x] Message Handling
- [x] Commands
- [x] Compound Commands
- [x] Audio Playing (only on supported platform)
- [x] Scheduling
- [ ] Effortlessly add platforms

### Functions

- [x] Task tracking from Trello
  - [ ] Add task
  - [x] Task reminder
- [ ] Take notes
- [x] Youtube music (Discord only)
- [x] Generate promptpay QRcode
- [x] Audio Streaming (Discord only)
- [x] Temporary file sharing
- [x] Push Messages

## Installation

Create `.env` file using `.env.example` as template

```env
LINE_CHANNEL_ACCESS_TOKEN=<Line channel access token>
LINE_CHANNEL_SECRET=<Line channelSecret>
TRELLO_API_KEY=<Trello key>
TRELLO_OAUTH_TOKEN=<Trello OAuth>
DISCORD_TOKEN=<Discord bot token>
PUBLIC_URL=<Url of the bot>

```

### Development

```shell
# install dependencies
yarn
# start development server
yarn start:dev
```

### Production

```shell
# install dependencies
yarn
# build project
yarn build
# start server
yarn start
```

or clone the project into server and use `deploy.sh` script and let docker-compose do the work
