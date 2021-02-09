# HamBot

Personal cross-platform bot to help keep up with tasks and lots more stuff. Built with scalability and least pain to add new features.

## Integrations
### Messaging Platform
- [x] Line Messaging API
- [x] Discord Bot
- [x] Trello
- [x] Messenger
- [ ] Github

### External APIs
- [x] ical calendars
- [x] Wanikani
- [x] Twitter Stream

## Features

### Core Functionality

- [x] Ping
- [x] Authorization
- [x] Message Handling
- [x] Commands
- [x] Compound Commands
- [x] Audio Playing (only on supported platform)
- [x] Scheduling
- [x] Push Messages, Multiple push channels (Public/ Private/ Debug/ Recurring)
- [x] Activation/Deactivation of modules
- [x] Effortlessly add platforms
- [x] Embed links
- [ ] Help command

### Functions

#### Personal

These functions requires authentication

- [x] Task tracking from Trello
  - [ ] Add task
  - [x] Task reminder
- [ ] Take notes
- [x] Audio Streaming (Discord only)
- [x] Temporary file sharing
- [x] Clipboard
- [x] Recurring events reminder
- [x] Calendar (ical) Events reminder
- [x] Set Discord server image

#### Public

- [x] Youtube music (Discord only)
- [x] Generate promptpay QRcode
- [x] Random chooser/ Group maker/ Weighted Randomizer
- [x] Shaking in Discord ** very recommended **
- [x] Search nyaa site

## Installation

Create `.env` file using `.env.example` as template

```env
LINE_CHANNEL_ACCESS_TOKEN=<Line channel access token>
LINE_CHANNEL_SECRET=<Line channelSecret>
TRELLO_API_KEY=<Trello key>
TRELLO_OAUTH_TOKEN=<Trello OAuth>
DISCORD_TOKEN=<Discord bot token>
PUBLIC_URL=<Url of the bot>
FACEBOOK_VERIFY_TOKEN=<A random string for verifying webhook>
FACEBOOK_PAGE_ACCESS_TOKEN=<Facebook page access token>
WANIKANI_API_KEY=<wanikani api key>
TWITTER_BEARER_TOKEN=<twitter bearer token>
```

### Roadmap

This is a short plan for making this repository more configurable and easier to work with.

- [ ] Abstract Data Source For More Compatability
- [ ] Auto-enable modules when corresponding .env is inserted
- [ ] Auto register command modules ()
- [ ] Refactor Important modules (Push/ Logging/ Data)
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
