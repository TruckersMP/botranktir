<p align="center"><img src="https://truckersmp.com/assets/img/truckersmp-logo-sm.png"></p>

# Botranktir

## Deprecation Note

This bot is extremely outdated and does not follow trends of Discord. Moreover, the problem that this bot was
supposed to combat, which was a lack of bots taking care of reaction roles, is no more present. If you want to
have reaction roles in your Discord server, please take a look at other bots.

## Introduction

Botranktir is a Discord bot that takes care of reaction roles. It also provides a single-use reaction role,
very advanced configuration of a guild, an emoji list and changelog, and more.

## Requirements

- [npm](https://www.npmjs.com/)
- [Node.js](https://nodejs.org/en/)

## Installation

1. Download the repository.
2. Run the `npm ci` command in the root folder.
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

## Inviting the Bot

As the bot has been built keeping in mind that it can be used in more than one Discord guild, other users
can invite the bot to their server through the `[p]join` command. To make this possible, make sure you have
enabled the **Public Bot** option in the Discord application settings. On top of that, the value of the
`invite` configuration must equal `true` (it is the default value as well).

If you want to use this bot just for yourself, disable the above-mentioned option in the Discord application
settings, and change the value of the `invite` configuration to `false`.

## Discord Intents

Botranktir needs both **Presence** and **Server Members Intents** to work flawlessly, as it is described in
the installation process. Starting on 7th October 2020, using this bot without the Discord verification will
not be possible if the bot is in more than 100 guilds.

Learn more about this topic here: https://support.discord.com/hc/en-us/articles/360040720412

## License

This package is open-source and is licensed under the [MIT license](LICENSE.md).
