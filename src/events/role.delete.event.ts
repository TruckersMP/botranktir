import * as Discord from 'discord.js';
import { Event } from './event';
import { RoleManager } from '../managers/role.manager';
import Role from '../models/Role';

/**
 * Handle `roleDelete` events from Discord.
 */
export class RoleDeleteEvent extends Event {
    constructor(
        client: Discord.Client,
        protected role: Discord.Role,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        if (!RoleManager.get().isManagedRole(this.role.id)) {
            return;
        }

        for (const messageID of RoleManager.get().getRoleMessages(this.role.id)) {
            const location = RoleManager.get().getRoleLocation(messageID, this.role.id);
            const emoji = RoleManager.get().getEmojiFromRole(
                location.guildID,
                location.channelID,
                location.messageID,
                this.role.id,
            );
            if (!emoji) {
                continue;
            }

            await Role.deleteReactionRole(location.messageID, emoji);
            RoleManager.get().removeRole(location.guildID, location.channelID, location.messageID, emoji);

            const channel = await this.client.channels.fetch(location.channelID);
            if (channel && (channel.type === 'text' || channel.type === 'news')) {
                const textChannel = <Discord.TextChannel>channel;
                const channelMessage = await textChannel.messages.fetch(location.messageID);
                if (channelMessage) {
                    const messageReaction = channelMessage.reactions.resolve(emoji);
                    if (messageReaction) {
                        await messageReaction.remove();
                    }
                }
            }
        }

        console.log('deleted role', this.role.guild.id, this.role.guild.name, this.role.id, this.role.name);
    }
}
