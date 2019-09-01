// Load libraries
const { CommandoClient } = require('discord.js-commando');
const path = require('path');

// Load config variables
const config = require('../config/config.json');

// Set up the database connection
global['knex'] = require('knex')({
    client: 'mysql',
    connection: config.database,
});

const client = new CommandoClient({
    commandPrefix: config.bot.prefix,
    owner: config.bot.owner,
    disableEveryone: true,
    commandEditableDuration: 0,
    messageCacheMaxSize: config.bot.messageCache,
});
client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands(config.defaultCommands)
    .registerGroups([['general', 'General'], ['manage', 'Managing']])
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Login the bot with the forwarded token. If it fails, output the error via the forwarded function
client.login(config.bot.token).catch(console.error);

// When the bot is successfully initialized
client.once('ready', async () => {
    const ready = new (require('./events/ready.js'))(client, config);
    await ready.handle();
});

const messageReactionAdd = new (require('./events/messageReactionAdd.js'))(client, config.limits);
const messageReactionRemove = new (require('./events/messageReactionRemove.js'))(client);

// We have to use the raw event in case the message is not cached
client.on('raw', event => {
    const { d: data } = event;

    if (event.t === 'MESSAGE_REACTION_ADD') {
        const emoji = data.emoji.id ? data.emoji.id : data.emoji.name;
        messageReactionAdd.handle(data.guild_id, data.channel_id, data.message_id, emoji, data.user_id);
    } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
        const emoji = data.emoji.id ? data.emoji.id : data.emoji.name;
        messageReactionRemove.handle(data.guild_id, data.channel_id, data.message_id, emoji, data.user_id);
    }
});

// Graceful stop with pm2
process.on('SIGINT', () => {
    client.destroy();
    process.exit(0);
});
