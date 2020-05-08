import * as Discord from 'discord.js';
import { fetchReactionData } from '../lib/PartialFetch';

/**
 * MessageReactionAddHandler returns an event handler for reaction additions
 * @param limits limits configuration
 */
export const MessageReactionAddHandler = (limits: Botranktir.LimitsMap) => async (
    reaction: Discord.MessageReaction,
    user: Discord.User
) => {
    const r = await fetchReactionData(reaction, user).catch((e) => console.error('fetching reaction data', e));
    if (!r) {
        return;
    }

    const role = global.roleManager.getRole(
        r.message.guild.id,
        r.message.channel.id,
        r.message.id,
        r.reaction.emoji.name
    );
    if (!role) {
        return;
    }

    if (!isAllowedToRequestRole(limits, r.message.guild.id, r.member)) {
        r.reaction.users.remove(user);
    } else {
        r.member.roles.add(role).catch((r) => console.error('adding reaction role', r));
    }
};

const isAllowedToRequestRole = (limits: Botranktir.LimitsMap, guildID: string, member: Discord.GuildMember) => {
    if (!limits.hasOwnProperty(guildID) || !limits[guildID].hasOwnProperty('rolesPerUser')) {
        return true;
    }
    // Currently has fewer managed roles than the upper limit
    return (
        member.roles.cache
            .array()
            .map((role) => role.id)
            .filter(global.roleManager.isManagedRole.bind(global.roleManager)).length < limits[guildID].rolesPerUser
    );
};
