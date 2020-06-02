import { Event } from './event';
import { Channel, Client, TextChannel } from 'discord.js';
import { RoleManager } from '../managers/role.manager';
import Role from '../models/Role';

/**
 * Handle `channelDelete` events from Discord.
 *
 * Received data from Discord might be partial.
 */
export class ChannelDeleteEvent extends Event {
    constructor(
        client: Client,
        protected channel: Channel,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        if (this.channel.type !== 'text' && this.channel.type !== 'news') {
            return;
        }

        const channel = <TextChannel> this.channel;
        await Role.deleteChannelRoles(channel.id);
        RoleManager.get().removeChannel(channel.guild.id, channel.id);

        console.log('deleted channel', channel.guild.id, channel.guild.name, channel.id, channel.name);
    }
}
