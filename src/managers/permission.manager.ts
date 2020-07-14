import { GuildMember } from 'discord.js';
import { ConfigurationManager } from './configuration.manager';

export class PermissionsManager {
    /**
     * Determine whether the guild member is a guild manager.
     *
     * @param member
     */
    static isGuildManager(member: GuildMember): boolean {
        if (member.hasPermission('ADMINISTRATOR', { checkOwner: true })) {
            return true;
        }

        return this.hasRole(member, 'guild-manager');
    }

    /**
     * Determine whether the guild member has the specific role.
     *
     * @param member
     * @param role      Configuration key of the role
     */
    protected static hasRole(member: GuildMember, role: string): boolean {
        const defaultConfigEntry = ConfigurationManager.getDefaultConfiguration(role);
        if (!defaultConfigEntry) {
            return false;
        }

        const roleId = ConfigurationManager.get().getConfiguration(role, member.guild.id);
        if (roleId === defaultConfigEntry.defaultValue) {
            return false;
        }

        return member.roles.cache.has(roleId);
    }
}
