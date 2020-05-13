import * as Discord from 'discord.js';
import { fetchReactionData } from '../lib/PartialFetch';

/**
 * MessageReactionAddHandler handles messageReactionAdd events from Discord
 */
export class MessageReactionAddHandler {
    private limits: Botranktir.LimitsMap = {};

    /**
     * initializes a new instance of MessageReactionAddHandler
     * @param limits limits configuration
     */
    constructor(limits: Botranktir.LimitsMap) {
        this.limits = limits;
    }

    /**
     * handles messageReactionAdd events from Discord
     * @param reaction the reaction that was added to
     * @param user the user who added to the reaction
     */
    handler = async (reaction: Discord.MessageReaction, user: Discord.User) => {
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

        if (!this.isAllowedToRequestRole(r.message.guild.id, r.member)) {
            r.reaction.users.remove(user);
        } else {
            r.member.roles.add(role).catch((reactionRole) => console.error('adding reaction role', reactionRole));
        }
    };

    /**
     * verifies the guild member is allowed to request another role
     * @param guildID the guild's ID
     * @param member the guild member
     */
    private isAllowedToRequestRole = (guildID: string, member: Discord.GuildMember) => {
        if (!this.limits.hasOwnProperty(guildID) || !this.limits[guildID].hasOwnProperty('rolesPerUser')) {
            return true;
        }

        // Currently has fewer managed roles than the upper limit
        return (
            member.roles.cache
                .array()
                .map((role) => role.id)
                .filter(global.roleManager.isManagedRole.bind(global.roleManager)).length <
            this.limits[guildID].rolesPerUser
        );
    };
}
