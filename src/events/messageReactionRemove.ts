import * as Discord from 'discord.js';
import { fetchReactionData } from '../lib/PartialFetch';

/**
 * handles messageReactionRemove events from Discord
 * @param reaction the reaction that was removed from
 * @param user the user who removed from the reaction
 */
export const MessageReactionRemove = async (reaction: Discord.MessageReaction, user: Discord.User) => {
    const r = await fetchReactionData(reaction, user).catch((e) => console.error('fetching reaction data', e));
    if (!r) {
        return;
    }

    const role = global.roleManager.getRole(
        r.message.guild.id,
        r.message.channel.id,
        r.message.id,
        r.reaction.emoji.name,
    );
    if (!role) {
        return;
    }

    r.member.roles.remove(role).catch(console.error);
};
