import Role from '../models/Role';

type ManagedRole = {
    guildID: string;
    channelID: string;
    messageID: string;
};

export type ManagedRoleEmoji = {
    role: string;
    raw: string;
};

type ChannelMessages = Map<string, MessageRoles>;
type MessageRoles = Map<string, ManagedRoleEmojis>;
export type ManagedRoleEmojis = Map<string, ManagedRoleEmoji>;

/**
 * Takes care of the client local roles storage.
 */
export class RoleManager {
    /**
     * Singleton instance of RoleManager.
     */
    private static instance: RoleManager | undefined;
    /**
     * Stores information about the location of the role message based on the role ID.
     */
    protected managedRoles: Map<string, ManagedRole>;
    /**
     * Stores information about the reaction role based on the location.
     * It is a map of nested maps in order: guild -> channel -> message -> roles -> reaction role
     */
    protected managedRolesMap: Map<string, ChannelMessages>;

    constructor() {
        this.managedRoles = new Map<string, ManagedRole>();
        this.managedRolesMap = new Map<string, ChannelMessages>();
    }

    /**
     * Get the instance of RoleManager.
     */
    static get(): RoleManager {
        if (this.instance === undefined) {
            this.instance = new RoleManager;
        }
        return this.instance;
    }

    /**
     * Store all fetched results from the database to the local storage.
     *
     * @param roles
     */
    fetchRoles(roles: Role[]): void {
        for (const role of roles) {
            this.addRole(role.guild, role.channel, role.message, role.role, role.emoji_raw);
        }
    }

    /**
     * Add the reaction role to the client local storage.
     *
     * @param guildID
     * @param channelID
     * @param messageID
     * @param roleID
     * @param emojiID
     */
    addRole(guildID: string, channelID: string, messageID: string, roleID: string, emojiID: string): void {
        // Create the object for the guild if it does not exist
        if (!this.managedRolesMap.has(guildID)) {
            this.managedRolesMap.set(guildID, new Map<string, MessageRoles>());
        }

        // Assign keys if they do not exist
        if (!this.managedRolesMap.get(guildID).has(channelID)) {
            this.managedRolesMap.get(guildID).set(channelID, new Map<string, ManagedRoleEmojis>());
        }
        if (!this.managedRolesMap.get(guildID).get(channelID).has(messageID)) {
            this.managedRolesMap.get(guildID).get(channelID).set(messageID, new Map<string, ManagedRoleEmoji>());
        }

        this.managedRolesMap.get(guildID).get(channelID).get(messageID).set(emojiID, { role: roleID, raw: emojiID });
        this.managedRoles.set(roleID, { guildID: guildID, channelID: channelID, messageID: messageID });
    }

    /**
     * Remove the reaction role from the client local storage.
     *
     * @param guildID
     * @param channelID
     * @param messageID
     * @param emojiID
     * @returns If the role was deleted from the client local storage.
     */
    removeRole(guildID: string, channelID: string, messageID: string, emojiID: string): boolean {
        const role = this.getRole(guildID, channelID, messageID, emojiID);
        if (!role) {
            return false;
        }

        this.managedRolesMap.get(guildID).get(channelID).get(messageID).delete(emojiID);
        this.managedRoles.delete(role);

        return true;
    }

    /**
     * Remove all reaction roles connected to the guild from the local storage.
     *
     * @param guildID
     */
    removeGuild(guildID: string): void {
        // As managed roles are mapped by their role ID only, all stored channels, messages,
        // and reaction roles of the guild must be looped through
        this.managedRolesMap.get(guildID).forEach(channel => {
            channel.forEach(message => {
                message.forEach(roleEmoji => {
                    this.managedRoles.delete(roleEmoji.role);
                });
            });
        });

        // Finally, remove the whole map
        this.managedRolesMap.delete(guildID);
    }

    /**
     * Get all reaction roles for the given message.
     *
     * Example of the result:
     * ```json
     * {
     *     "579609125831573504": {                          // Emoji ID/unicode
     *         "role": "352802547313934336",                // Role ID
     *         "raw": "<:truckersmp:579609125831573504>"    // Emoji as raw
     *     }
     * }
     * ```
     *
     * @param guild
     * @param channel
     * @param message
     * @returns Map with reaction roles, `null` for no results.
     */
    getRoles(guild: string, channel: string, message: string): ManagedRoleEmojis | null {
        // Check for existing keys. If they do not exist, there are no data for the message
        if (!this.managedRolesMap.has(guild)) {
            return null;
        }
        if (!this.managedRolesMap.get(guild).has(channel)) {
            return null;
        }
        if (!this.managedRolesMap.get(guild).get(channel).has(message)) {
            return null;
        }

        return this.managedRolesMap.get(guild).get(channel).get(message);
    }

    /**
     * Get the role ID by the forwarded criteria.
     *
     * @param guildID
     * @param channelID
     * @param messageID
     * @param emojiID
     * @returns Role ID, `null` for no result
     */
    getRole(guildID: string, channelID: string, messageID: string, emojiID: string): string | null {
        // Check for existing keys. If they do not exist, there are no data for the message
        const roles = this.getRoles(guildID, channelID, messageID);
        if (!roles || !roles.has(emojiID)) {
            return null;
        }

        return roles.get(emojiID).role;
    }

    /**
     * Get the emoji ID/unicode for the role on the given message.
     *
     * @param guildID
     * @param channelID
     * @param messageID
     * @param roleID
     * @returns Emoji ID/unicode, `null` for no result.
     */
    getEmojiFromRole(guildID: string, channelID: string, messageID: string, roleID: string): string | null {
        const roles = this.getRoles(guildID, channelID, messageID);
        if (!roles) {
            return null;
        }

        for (const [key, value] of roles.entries()) {
            if (value.role === roleID) {
                return key;
            }
        }

        return null;
    }

    /**
     * Verify if the given role is managed by the bot.
     *
     * @param roleID
     */
    isManagedRole(roleID: string): boolean {
        return this.managedRoles.has(roleID);
    }

    /**
     * Get the count of all reaction roles.
     */
    count(): number {
        return this.managedRoles.size;
    }
}
