// Load config variables
import * as rawConfig from '../config/config.json';
const config = rawConfig as Botranktir.Config;

// Load libraries
import { CommandoClient } from 'discord.js-commando';
import * as path from 'path';
import * as Knex from 'knex';
import { MessageReactionAddHandler } from './events/messageReactionAdd';
import { MessageReactionRemove } from './events/messageReactionRemove';
import Ready from './events/ready';
import { Model } from 'objection';

// Set up the database connection
const knex = Knex({
    client: 'mysql',
    connection: config.database,
});

// Register the Knex connection
Model.knex(knex);

const client = new CommandoClient({
    commandPrefix: config.bot.prefix,
    owner: config.bot.owner,
    commandEditableDuration: 0,
    messageCacheMaxSize: config.bot.messageCache,
    partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER', 'USER'],
});
client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands(config.defaultCommands)
    .registerGroups([
        ['general', 'General'],
        ['manage', 'Managing'],
    ])
    .registerCommandsIn({
        dirname: path.join(__dirname, 'commands'),
        filter: /^[^.].*\.ts$/, // https://github.com/discordjs/Commando/issues/297
    });

// Login the bot with the forwarded token. If it fails, output the error via the forwarded function
client.login(config.bot.token).catch(console.error);

// When the bot is successfully initialized
client.once('ready', async () => {
    const ready = new Ready(client, config);
    await ready.handle();
    console.log('ready');
});

// Register reaction handlers
client.on('messageReactionAdd', MessageReactionAddHandler(config.limits));
client.on('messageReactionRemove', MessageReactionRemove);

// Graceful stop with pm2
process.on('SIGINT', () => {
    client.destroy();
    process.exit(0);
});
