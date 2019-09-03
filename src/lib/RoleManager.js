module.exports = class ManageRoles {
    /**
     * RoleManager class that takes care of the client local roles storage.
     *
     * @param   client
     */
    constructor(client) {
        this.client = client;

        // Set the storage to the client
        if (!this.client.hasOwnProperty('roles')) {
            this.client.roles = {};
        }

        this.managedRoles = {};
    }

    /**
     * Fetch roles for the guild and save them to the client local storage.
     *
     * @param   {number|string} guild
     * @param   {Array} results
     */
    fetchRoles(guild, results) {
        for (let i = 0; i < results.length; i++) {
            const result = results[i];

            this.addRole(
                guild,
                result['channel'],
                result['message'],
                result['emoji'],
                result['role'],
                result['emoji_raw']
            );
        }
    }

    /**
     * Add the reaction role to the client local storage.
     *
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @param   {number|string} role
     * @param   {string} emojiRaw
     */
    addRole(guild, channel, message, emoji, role, emojiRaw) {
        // Create the object for the guild if it does not exist
        if (!this.client.roles.hasOwnProperty(guild)) {
            this.client.roles[guild] = {};
        }

        // Assign keys if they do not exist
        if (!this.client.roles[guild].hasOwnProperty(channel)) {
            this.client.roles[guild][channel] = {};
        }
        if (!this.client.roles[guild][channel].hasOwnProperty(message)) {
            this.client.roles[guild][channel][message] = {};
        }

        this.client.roles[guild][channel][message][emoji] = { role: role, raw: emojiRaw };
        this.managedRoles[role] = { guild: guild, channel: channel, message: message };
    }

    /**
     * Remove the reaction role from the client local storage.
     *
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @returns {boolean}               If the role was deleted from the client local storage.
     */
    removeRole(guild, channel, message, emoji) {
        const role = this.getRole(guild, channel, message, emoji);
        if (!role) {
            return false;
        }

        delete this.client.roles[guild][channel][message][emoji];
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
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @returns {null|Array}            Array with reaction roles, `null` for no results.
     */
    getRoles(guild, channel, message) {
        // Check for existing keys. If they do not exist, there are no data for the message
        if (
            !this.client.roles.hasOwnProperty(guild) ||
            !this.client.roles[guild].hasOwnProperty(channel) ||
            !this.client.roles[guild][channel].hasOwnProperty(message)
        ) {
            return null;
        }

        return this.client.roles[guild][channel][message];
    }

    /**
     * Get the role ID by the forwarded criteria.
     *
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @returns {null|*}                Role ID, `null` for no result
     */
    getRole(guild, channel, message, emoji) {
        // Check for existing keys. If they do not exist, there are no data for the message
        if (
            !this.getRoles(guild, channel, message) ||
            !this.client.roles[guild][channel][message].hasOwnProperty(emoji)
        ) {
            return null;
        }

        return this.client.roles[guild][channel][message][emoji]['role'];
    }

    /**
     * Get the emoji ID/unicode for the role on the given message.
     *
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} role
     * @returns {string|null}           Emoji ID/unicode, `null` for no result.
     */
    getEmojiFromRole(guild, channel, message, role) {
        const roles = this.getRoles(guild, channel, message);
        if (!roles) {
            return null;
        }

        for (const key in roles) {
            if (!roles.hasOwnProperty(key)) {
                continue;
            }

            if (roles[key]['role'] === role) {
                return key;
            }
        }

        return null;
    }

    /**
     * Verify if the given role is managed by the bot.
     *
     * @param   {number|string} role
     * @returns {boolean}
     */
    isManagedRole(role) {
        return role in this.managedRoles;
    }
};
