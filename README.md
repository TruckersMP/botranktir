# Botranktir

## Description

Botranktir is a Discord bot that assign or unassign roles after reacting or removing the reaction on a message.  
The bot is available for everybody to use.

Data are cached and accessing the database is done only on adding a new reaction role, removing an existing
reaction role or when the bot is loaded. This provides a huge advantage of a very low amount of queries to
the database and thus, the bot reacts much faster.

## User Usage

### Add Reaction Role

#### Parameters

- `channel` - a mentioned channel (`#channel-name`)
- `message` - the ID of a message where the reaction should be placed on
- `emoji` - the ID of an emoji, a unicode emoji or a used emoji (e.g. `:truckersmp:`)
- `role` - the name of a role or a mentioned role

#### Examples

- `{prefix}addrole #welcome 580458877531979786 :truckersmp: Subscriber`

> External emotes can be used, too. However, before using the command, react with the external emoji as first.

### Delete Reaction Role

#### Parameters

- `channel` - a mentioned channel (`#channel-name`)
- `message` - the ID of a message where the reaction is placed on
- `emoji` - the ID of an emoji, a unicode emoji or a used emoji (e.g. `:truckersmp:`) that was used for managing
            the role

#### Examples

- `{prefix}delrole #welcome 580458877531979786 :truckersmp:`

### Fetching Reaction Roles for a Message

#### Parameters

- `channel` - a mentioned channel (`#channel-name`)
- `message` - the ID of a message about which the information should be get

#### Examples

- `{prefix}fetchmessage #welcome 580458877531979786`

## Requirements

- npm
- Node 10.14.x or newer

## Installation

1. Download the repository.
2. Run the `npm install` command in the root folder.  
   *Due to the usage of Knex, we recommend installing it globally:* `npm install knex -g`
3. Copy the sample config file (`config/config.sample.json`) and create your own config file (`config/config.json`).
4. Create a new database.
5. Set up the config properties.
6. Run all migrations (`knex migrate:latest`).

### Running

The bot is using [PM2](http://pm2.keymetrics.io/) and thus, it can be run under two different environments:

- **Production:** `npm run prod` (`pm2 start pm2.json`)
- **Development:** `npm run dev` (`pm2-dev start pm2.json --env=development`)

## Configuration

- `bot.token` - can be obtained on the [Discord Developer Portal](https://discordapp.com/developers/applications/)
    after creating an application and setting it up as a bot.
- `bot.prefix` - a prefix for all commands.  
    *Make sure it does not conflict with your other bots on the server due to a usage of default commands.*
- `bot.owner` - an array of owners. You can change the ID to your own so you can manage the bot.
- `bot.messageCache` - the amount of messages per channel that will be cached.
- `defaultCommands` - [managing default commands](https://discord.js.org/#/docs/commando/master/class/CommandoRegistry?scrollTo=registerDefaultCommands).  
    *Non-mentioned commands are enabled by default.*
