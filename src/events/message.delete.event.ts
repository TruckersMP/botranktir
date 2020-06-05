import { Event } from './event';
import { Client, Message } from 'discord.js';
import { RoleManager } from '../managers/role.manager';
import Role from '../models/Role';

/**
 * Handle `messageDelete` events from Discord.
 *
 * Received data from Discord might be partial.
 */
export class MessageDeleteEvent extends Event {
    constructor(
        client: Client,
        protected message: Message,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        let message = this.message;
        if (message.partial) {
            message = await this.message.fetch();
        }

        await Role.deleteMessageRoles(message.id);
        RoleManager.get().removeMessage(message.guild.id, message.channel.id, message.id);

        console.log(
            'deleted message',
            message.guild.id,
            message.guild.name || 'unknown',
            message.channel.id,
            message.id,
        );
    }
}
