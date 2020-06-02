<p align="center"><img src="https://truckersmp.com/assets/img/truckersmp-logo-sm.png"></p>

## Introduction

Botranktir is a Discord bot that takes care of reaction roles. It also provides a single use reaction roles,
very advanced configuration of a guild and more.

## Requirements

- [npm](https://www.npmjs.com/)
- [Node.js](https://nodejs.org/en/)

## Installation

1. Download the repository.
2. Run the `npm install` command in the root folder.
3. Copy the example environment file (`/.env.example`) and create your own one (`/.env`).
4. Create a new database.
5. Create a Discord application. Set up a bot user and enable both Presence and Server Members Intents.
6. Set up the environment properties.
7. Run all migrations (`knex migrate:latest`).
8. Invite the bot to the guild with necessary permissions.
9. Move bot's role over all roles that are supposed to be granted by reacting to a message.
10. Start the bot by running the command `npm run prod`.

### Running

The bot is using [PM2](http://pm2.keymetrics.io/) and thus, it can be run under two different environments:

- **Production:** `npm run prod`
- **Development:** `npm run dev`

## Discord Intents

Botranktir needs both **Presence** and **Server Members Intents** to work flawlessly, as it is described in
the installation process. Starting on 7th October 2020, using this bot without the Discord verification will
not be possible if the bot is in more than 100 guilds.

Learn more about this topic here: https://support.discord.com/hc/en-us/articles/360040720412

## License

This package is open-source and is licensed under the [MIT license](LICENSE.md).
