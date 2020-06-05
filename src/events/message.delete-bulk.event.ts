import { Event } from './event';
import { Channel, Client, Collection, Guild, Message, Snowflake } from 'discord.js';
import { RoleManager } from '../managers/role.manager';
import Role from '../models/Role';

/**
 * Handle `messageDeleteBulk` events from Discord.
 *
 * Received data from Discord might be partial.
 * However, do not fetch the same data multiple times in order not to spam Discord API!
 * There can be a huge amount of deleted messages at once; we have no idea how the user uses the bot.
 */
export class MessageDeleteBulkEvent extends Event {
    constructor(
        client: Client,
        protected messages: Collection<Snowflake, Message>,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        // The data can be fetched only once as bulk delete happens only in one channel
        let guild: Guild;
        let channel: Channel;

        for (const [, message] of this.messages) {
            if (!guild) {
                let messageData = message;
                if (message.partial) {
                    messageData = await messageData.fetch();
                }

                guild = await messageData.guild.fetch();
                channel = messageData.channel;

                // Just skip the loop as the channel where the messages were removed from
                // does not have any reaction roles
                if (!RoleManager.get().isChannelManaged(guild.id, channel.id)) {
                    break;
                }
            }

            if (!RoleManager.get().getRoles(guild.id, channel.id, message.id)) {
                continue;
            }

            await Role.deleteMessageRoles(message.id);
            RoleManager.get().removeMessage(guild.id, channel.id, message.id);

            console.log('bulk deleted message', guild.id, guild.name, channel.id, message.id);
        }
    }
}
