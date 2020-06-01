import { MessageReactionEvent } from './message.reaction.event';
import { RoleManager } from '../../managers/role.manager';

/**
 * Handle `messageReactionRemove` events from Discord.
 *
 * Received data from Discord might be partial.
 */
export class MessageReactionRemoveEvent extends MessageReactionEvent {
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
        if (!role) {
            return;
        }

        data.member.roles.remove(role).catch(e => console.log('removing reaction role', e));
    }
}
