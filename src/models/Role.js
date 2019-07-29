const { Model } = require('objection');

// Register the Knex connection
Model.knex(knex);

module.exports = class Role extends Model {
    /**
     * Get the name of the table.
     *
     * @returns {string}
     */
    static get tableName() {
        return 'roles';
    }

    /**
     * Before the update is proceed.
     *
     * @param   opt
     * @param   queryContext
     */
    $beforeUpdate(opt, queryContext) {
        // The existence of the column must be checked as the user could create the database schema in the 1.0 version
        if (this.updated_at) {
            this.updated_at = knex.fn.now();
        }
    }

    /**
     * Determine whether the emoji role exists for the guild based on the database data.
     *
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @param   {number|string} role
     * @param   {number|string} guild
     * @returns {boolean}
     */
    static doesExist(channel, message, emoji, role, guild) {
        return this.query()
            .where('channel', channel)
            .where('message', message)
            .where('emoji', emoji)
            .where('role', role)
            .where('guild', guild)
            .count('*') > 0;
    }

    /**
     * Create the emoji role by inserting it into the database.
     *
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @param   {number|string} role
     * @param   {number|string} guild
     * @param   {string} emojiRaw
     * @returns {Promise<void>}
     */
    static async createReactionRole(channel, message, emoji, role, guild, emojiRaw) {
        await this.query().insert({
            channel: channel,
            message: message,
            emoji: emoji,
            role: role,
            guild: guild,
            emoji_raw: emojiRaw,
        });
    }

    /**
     * Delete the given emoji role for the guild.
     *
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @param   {number|string} guild
     * @returns {Promise<number>}                Number of affected rows.
     */
    static async deleteReactionRole(channel, message, emoji, guild) {
        return this.query()
            .where('channel', channel)
            .where('message', message)
            .where('emoji', emoji)
            .where('guild', guild)
            .del();
    }
};
