import { RoleManager } from '../../managers/role.manager';
import { MessageReactionEvent } from './message.reaction.event';
import { GuildMember } from 'discord.js';
import { ConfigurationManager } from '../../managers/configuration.manager';

/**
 * Handle `messageReactionAdd` events from Discord.
 *
 * Received data from Discord might be partial.
 */
export class MessageReactionAddEvent extends MessageReactionEvent {
    async handle(): Promise<void> {
        const data = await this.fetchData(this.reaction, this.user).catch(e => console.error('fetching reaction data\n', e));
        if (!data) {
            return;
        }

        const role = RoleManager.get().getRole(
            data.message.guild.id,
            data.message.channel.id,
            data.message.id,
            data.reaction.emoji.name,
        );
        // There is no reaction role for the reaction
        if (!role) {
            return;
        }

        if (!this.isAllowedToRequestRole(data.message.guild.id, data.member)) {
            // Remove the reaction from the user as they hit the limits
            data.reaction.users
                .remove(this.user)
                .catch(e => console.error('removing reaction role due to limits\n', e));
        } else {
            // Add the reaction role to the user
            data.member.roles.add(role).catch(e => console.error('adding reaction role\n', e));
        }
    }

    /**
     * Verify the guild member is allowed to request another role.
     *
     * @param guildID
     * @param member
     */
    private isAllowedToRequestRole(guildID: string, member: GuildMember): boolean {
        const limit = parseInt(ConfigurationManager.get().getConfiguration('limit', guildID));
        if (limit === 0) {
            return true;
        }

        // Currently has fewer managed roles than the upper limit
        return member.roles.cache
            .map(role => role.id)
            .filter(role => RoleManager.get().isManagedRole(role)).length < limit;
    }
}
