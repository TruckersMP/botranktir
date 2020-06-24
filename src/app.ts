import * as dotenv from 'dotenv';
import * as path from 'path';
import * as Knex from 'knex';
import { Model } from 'objection';
import { ChannelDeleteEvent } from './events/channel.delete.event';
import { EmojiCreateEvent } from './events/emoji.create.event';
import { EmojiDeleteEvent } from './events/emoji.delete.event';
import { EmojiUpdateEvent } from './events/emoji.update.event';
import { GuildCreateEvent } from './events/guild.create.event';
import { GuildDeleteEvent } from './events/guild.delete.event';
import { MessageDeleteEvent } from './events/message.delete.event';
import { MessageDeleteBulkEvent } from './events/message.delete-bulk.event';
import { MessageReactionAddEvent } from './events/message.reaction-add.event';
import { MessageReactionRemoveEvent } from './events/message.reaction-remove.event';
import { RoleDeleteEvent } from './events/role.delete.event';
import { ReadyEvent } from './events/ready.event';
import { Channel, Collection, GuildEmoji, Intents, Message, MessageReaction, Role, Snowflake, User } from 'discord.js';
import { CommandoClient, CommandoGuild } from 'discord.js-commando';
import { ClientManager } from './managers/client.manager';

// Load config variables
const config = dotenv.config({ path: '.env' });
if (config.error) {
    console.error('configuration could not be parsed\n', config.error);
    process.exit(1);
}

// Set global variables
global['BOT_COLOR'] = 0xc4fcff;
global['SUCCESS_COLOR'] = 0x6dcf84;

// Set up the database connection
const knex = Knex({
    client: 'mysql',
    connection: {
        driver: process.env.DB_DRIVER,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        charset: process.env.DB_CHARSET,
    },
});

// Register the Knex connection
Model.knex(knex);

// Specify intents that are required by Discord
const intents = new Intents();
intents.add(
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_EMOJIS',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGES',
);

const client = new CommandoClient({
    commandPrefix: process.env.BOT_PREFIX,
    owner: process.env.BOT_OWNER.split(','),
    commandEditableDuration: 0,
    messageCacheMaxSize: parseInt(process.env.BOT_MESSAGE_CACHE),
    partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER', 'USER'], // https://discordjs.guide/popular-topics/partials.html
    ws: { intents: intents },
    disableMentions: 'everyone',
});
client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        unknownCommand: false,
        commandState: false,
        prefix: false,
        eval: false,
        help: false,
    })
    .registerGroups([
        ['general', 'General'],
        ['manage', 'Management'],
        ['roles', 'Role Management'],
        ['emoji', 'Emoji'],
    ])
    .registerCommandsIn({
        dirname: path.join(__dirname, 'commands'),
        filter: /^[^.].*\.(ts|js)$/g, // https://github.com/discordjs/Commando/issues/297
    });

// Login the bot with the forwarded token. If it fails, output the error via the forwarded function
client.login(process.env.BOT_TOKEN).catch(console.error);

// Initialize all global objects and load data to the local storage
ClientManager.get().init(client);
ClientManager.get().load().then(() => console.log('objects have been initialized'));

// When the bot is successfully initialized
client.once('ready', () => {
    const ready = new ReadyEvent(client);
    return ready.handle();
});

// Register events
client.on('channelDelete', (channel: Channel) => {
    const event = new ChannelDeleteEvent(client, channel);
    return event.handle();
});
client.on('emojiCreate', (emoji: GuildEmoji) => {
    const event = new EmojiCreateEvent(client, emoji);
    return event.handle();
});
client.on('emojiDelete', (emoji: GuildEmoji) => {
    const event = new EmojiDeleteEvent(client, emoji);
    return event.handle();
});
client.on('emojiUpdate', (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => {
    const event = new EmojiUpdateEvent(client, oldEmoji, newEmoji);
    return event.handle();
});
client.on('guildCreate', (guild: CommandoGuild) => {
    const event = new GuildCreateEvent(client, guild);
    return event.handle();
});
client.on('guildDelete', (guild: CommandoGuild) => {
    const event = new GuildDeleteEvent(client, guild);
    return event.handle();
});
client.on('messageDelete', (message: Message) => {
    const event = new MessageDeleteEvent(client, message);
    return event.handle();
});
client.on('messageDeleteBulk', (messages: Collection<Snowflake, Message>) => {
    const event = new MessageDeleteBulkEvent(client, messages);
    return event.handle();
});
client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) => {
    const event = new MessageReactionAddEvent(client, messageReaction, user);
    return event.handle();
});
client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User) => {
    const event = new MessageReactionRemoveEvent(client, messageReaction, user);
    return event.handle();
});
client.on('roleDelete', (role: Role) => {
    const event = new RoleDeleteEvent(client, role);
    return event.handle();
});

// Graceful stop with pm2
process.on('SIGINT', () => {
    client.destroy();
    process.exit(0);
});
