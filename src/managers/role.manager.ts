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
     *
     * The key has the following format: `message.role`
     *
     * This special key has to be used as the role might be connected to more messages.
     */
    protected managedRoles: Map<string, ManagedRole>;
    /**
     * Stores all messages the reaction role is connected to.
     */
    protected managedRoleMessages: Map<string, string[]>;
    /**
     * Stores information about the reaction role based on the location.
     * It is a map of nested maps in order: guild -> channel -> message -> roles -> reaction role
     */
    protected managedRolesMap: Map<string, ChannelMessages>;

    constructor() {
        this.managedRoles = new Map<string, ManagedRole>();
        this.managedRoleMessages = new Map<string, string[]>();
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
     * @param guild
     * @param channel
     * @param message
     * @param role
     * @param emojiID
     */
    addRole(guild: string, channel: string, message: string, role: string, emojiID: string): void {
        // Create the object for the guild if it does not exist
        if (!this.managedRolesMap.has(guild)) {
            this.managedRolesMap.set(guild, new Map<string, MessageRoles>());
        }

        // Assign keys if they do not exist
        if (!this.managedRolesMap.get(guild).has(channel)) {
            this.managedRolesMap.get(guild).set(channel, new Map<string, ManagedRoleEmojis>());
        }
        if (!this.managedRolesMap.get(guild).get(channel).has(message)) {
            this.managedRolesMap.get(guild).get(channel).set(message, new Map<string, ManagedRoleEmoji>());
        }

        this.managedRolesMap.get(guild).get(channel).get(message).set(emojiID, { role: role, raw: emojiID });
        this.managedRoles.set(`${message}.${role}`, { guildID: guild, channelID: channel, messageID: message });

        const messages = this.getRoleMessages(role);
        messages.push(message);
        this.managedRoleMessages.set(role, messages);
    }

    /**
     * Remove the reaction role from the client local storage.
     *
     * @param guild
     * @param channel
     * @param message
     * @param emojiID
     * @returns If the role was deleted from the client local storage.
     */
    removeRole(guild: string, channel: string, message: string, emojiID: string): boolean {
        const role = this.getRole(guild, channel, message, emojiID);
        if (!role) {
            return false;
        }

        this.managedRolesMap.get(guild).get(channel).get(message).delete(emojiID);
        this.managedRoles.delete(`${message}.${role}`);

        // Remove the specific message ID from the array if the role is connected to more messages.
        // Otherwise, just delete the array in the map as the role is not managed by the bot anymore.
        const messages = this.getRoleMessages(role);
        if (messages.length === 1) {
            this.managedRoleMessages.delete(role);
        } else {
            this.managedRoleMessages.set(role, messages.filter(roleMessage => roleMessage !== message));
        }

        return true;
    }

    /**
     * Remove all reaction roles connected to the guild from the local storage.
     *
     * @param guild
     */
    removeGuild(guild: string): boolean {
        if (!this.managedRolesMap.has(guild)) {
            return false;
        }

        const guildData = this.managedRolesMap.get(guild);
        guildData.forEach((channel: MessageRoles, channelID: string) => this.removeChannel(guild, channelID));
        // Finally, remove the whole map
        this.managedRolesMap.delete(guild);

        return true;
    }

    /**
     * Remove all reaction roles connected to the channel from the local storage.
     *
     * @param guild
     * @param channel
     */
    removeChannel(guild: string, channel: string): boolean {
        if (!this.isChannelManaged(guild, channel)) {
            return false;
        }

        this.managedRolesMap
            .get(guild)
            .get(channel)
            .forEach((messages: ManagedRoleEmojis, message: string) => this.removeMessage(guild, channel, message));
        this.managedRolesMap.get(guild).delete(channel);

        return true;
    }

    /**
     * Remove all reaction roles connected to the message from the local storage.
     *
     * @param guild
     * @param channel
     * @param message
     */
    removeMessage(guild: string, channel: string, message: string): boolean {
        const roles = this.getRoles(guild, channel, message);
        if (!roles) {
            return false;
        }

        roles.forEach((role: ManagedRoleEmoji, emoji: string) => this.removeRole(guild, channel, message, emoji));
        this.managedRolesMap.get(guild).get(channel).delete(message);

        return true;
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
        if (!this.isChannelManaged(guild, channel)) {
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
        return this.managedRoleMessages.has(roleID);
    }

    /**
     * Get data about the reaction role from the local storage.
     *
     * @param messageID
     * @param roleID
     */
    getRoleLocation(messageID: string, roleID: string): ManagedRole | null {
        if (!this.isManagedRole(roleID)) {
            return null;
        }

        return this.managedRoles.get(`${messageID}.${roleID}`);
    }

    /**
     * Get all messages the reaction role is connected to.
     *
     * @param roleID
     */
    getRoleMessages(roleID: string): string[] {
        return this.managedRoleMessages.has(roleID) ? this.managedRoleMessages.get(roleID) : [];
    }

    /**
     * Verify whether the channel has reaction roles.
     *
     * @param guildID
     * @param channelID
     */
    isChannelManaged(guildID: string, channelID: string): boolean {
        return this.managedRolesMap.has(guildID) && this.managedRolesMap.get(guildID).has(channelID);
    }

    /**
     * Get the count of all reaction roles.
     */
    count(): number {
        return this.managedRoles.size;
    }
}
