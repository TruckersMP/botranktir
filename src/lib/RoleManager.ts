import * as Discord from 'discord.js';
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

export type ManagedRoleEmojis = { [key: string]: ManagedRoleEmoji };

export class RoleManager {
    client: Discord.Client;
    managedRoles: { [key: string]: ManagedRole };
    managedRolesMap: { [key: string]: { [key: string]: { [key: string]: ManagedRoleEmojis } } } = {};

    /**
     * RoleManager class that takes care of the client local roles storage.
     *
     * @param   client
     */
    constructor(client: Discord.Client) {
        this.client = client;

        this.managedRoles = {};
    }

    /**
     * Fetch roles for the guild and save them to the client local storage.
     *
     * @param   {string} guildID
     * @param   {Array} results
     */
    fetchRoles(guildID: string, results: Role[]) {
        for (let i = 0; i < results.length; i++) {
            const result = results[i];

            this.addRole(guildID, result['channel'], result['message'], result['role'], result['emoji_raw']);
        }
    }

    /**
     * Add the reaction role to the client local storage.
     *
     * @param   {string} guildID
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} roleID
     * @param   {string} emojiID
     */
    addRole(guildID: string, channelID: string, messageID: string, roleID: string, emojiID: string) {
        // Create the object for the guild if it does not exist
        if (!this.managedRolesMap.hasOwnProperty(guildID)) {
            this.managedRolesMap[guildID] = {};
        }

        // Assign keys if they do not exist
        if (!this.managedRolesMap[guildID].hasOwnProperty(channelID)) {
            this.managedRolesMap[guildID][channelID] = {};
        }
        if (!this.managedRolesMap[guildID][channelID].hasOwnProperty(messageID)) {
            this.managedRolesMap[guildID][channelID][messageID] = {};
        }

        this.managedRolesMap[guildID][channelID][messageID][emojiID] = { role: roleID, raw: emojiID };
        this.managedRoles[roleID] = { guildID: guildID, channelID: channelID, messageID: messageID };
    }

    /**
     * Remove the reaction role from the client local storage.
     *
     * @param   {string} guildID
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} emojiID
     * @returns {boolean}               If the role was deleted from the client local storage.
     */
    removeRole(guildID: string, channelID: string, messageID: string, emojiID: string): boolean {
        const role = this.getRole(guildID, channelID, messageID, emojiID);
        if (!role) {
            return false;
        }

        delete this.managedRolesMap[guildID][channelID][messageID][emojiID];
        delete this.managedRoles[role];
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
     * @param   {string} guild
     * @param   {string} channel
     * @param   {string} message
     * @returns {null|ManageRoleEmojis}            Array with reaction roles, `null` for no results.
     */
    getRoles(guild: string, channel: string, message: string): ManagedRoleEmojis | null {
        // Check for existing keys. If they do not exist, there are no data for the message
        if (
            !this.managedRolesMap.hasOwnProperty(guild) ||
            !this.managedRolesMap[guild].hasOwnProperty(channel) ||
            !this.managedRolesMap[guild][channel].hasOwnProperty(message)
        ) {
            return null;
        }

        return this.managedRolesMap[guild][channel][message];
    }

    /**
     * Get the role ID by the forwarded criteria.
     *
     * @param guildID Guild ID
     * @param channelID Channel ID
     * @param messageID Message ID
     * @param emojiID Raw ID of the emoji
     * @returns {null|*}                Role ID, `null` for no result
     */
    getRole(guildID: string, channelID: string, messageID: string, emojiID: string): string | null {
        // Check for existing keys. If they do not exist, there are no data for the message
        if (
            !this.getRoles(guildID, channelID, messageID) ||
            !this.managedRolesMap[guildID][channelID][messageID].hasOwnProperty(emojiID)
        ) {
            return null;
        }

        return this.managedRolesMap[guildID][channelID][messageID][emojiID].role;
    }

    /**
     * Get the emoji ID/unicode for the role on the given message.
     *
     * @param   {string} guildID
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} roleID
     * @returns {string|null}           Emoji ID/unicode, `null` for no result.
     */
    getEmojiFromRole(guildID: string, channelID: string, messageID: string, roleID: string): string | null {
        const roles = this.getRoles(guildID, channelID, messageID);
        if (!roles) {
            return null;
        }

        for (const key in roles) {
            if (!roles.hasOwnProperty(key)) {
                continue;
            }

            if (roles[key]['role'] === roleID) {
                return key;
            }
        }

        return null;
    }

    /**
     * Verify if the given role is managed by the bot.
     *
     * @param   {string} roleID
     * @returns {boolean}
     */
    isManagedRole(roleID: string): boolean {
        return roleID in this.managedRoles;
    }
}
