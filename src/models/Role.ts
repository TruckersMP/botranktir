import { Model, ModelOptions, QueryContext } from 'objection';

interface IRole {
    created_at: Date;
    updated_at: Date;
    channel: string;
    message: string;
    emoji: string;
    role: string;
    guild: string;
    emoji_raw: string;
}

export default class Role extends Model implements IRole {
    created_at: Date;
    updated_at: Date;
    channel: string;
    message: string;
    emoji: string;
    role: string;
    guild: string;
    emoji_raw: string;

    /**
     * Get the name of the table.
     *
     * @returns {string}
     */
    static get tableName(): string {
        return 'roles';
    }

    /**
     * Before the update is proceed.
     *
     * @param   opt
     * @param   queryContext
     */
    $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
        // The existence of the column must be checked as the user could create the database schema in the 1.0 version
        if (this.updated_at) {
            this.updated_at = new Date();
        }
    }

    /**
     * Determine whether the emoji role exists for the guild based on the database data.
     *
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} emojiID
     * @param   {string} roleID
     * @param   {string} guildID
     * @returns {Promise<boolean>}
     */
    static async doesExist(
        channelID: string,
        messageID: string,
        emojiID: string,
        roleID: string,
        guildID: string
    ): Promise<boolean> {
        const c: number = (
            await this.query()
                .where('channel', channelID)
                .where('message', messageID)
                .whereRaw('`emoji` COLLATE utf8mb4_bin = ?', [emojiID])
                .where('role', roleID)
                .where('guild', guildID)
                .count('*')
                .as('count')
                .execute()
        )[0]['count'];
        return c > 0;
    }

    /**
     * Create the emoji role by inserting it into the database.
     *
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} emojiID
     * @param   {string} roleID
     * @param   {string} guildID
     * @param   {string} emojiRaw
     * @returns {Promise<void>}
     */
    static async createReactionRole(
        channelID: string,
        messageID: string,
        emojiID: string,
        roleID: string,
        guildID: string,
        emojiRaw: string
    ): Promise<void> {
        await this.query().insert({
            channel: channelID,
            message: messageID,
            emoji: emojiID,
            role: roleID,
            guild: guildID,
            emoji_raw: emojiRaw,
        });
    }

    /**
     * Delete the given emoji role for the guild.
     *
     * @param   {string} channelID
     * @param   {string} messageID
     * @param   {string} emojiID
     * @param   {string} guildID
     * @returns {Promise<number>}       Number of affected rows.
     */
    static async deleteReactionRole(
        channelID: number | string,
        messageID: number | string,
        emojiID: number | string,
        guildID: number | string
    ): Promise<number> {
        return this.query()
            .where('channel', channelID)
            .where('message', messageID)
            .whereRaw('`emoji` COLLATE utf8mb4_bin = ?', [emojiID])
            .where('guild', guildID)
            .del();
    }

    /**
     * Returns the list of roles for a guild
     *
     * @param {string} id Guild ID
     * @returns {Promise<Role[]>} List of roles in this guild
     */
    static async rolesByGuild(id: string): Promise<Role[]> {
        return this.query().where('guild', id);
    }
}
