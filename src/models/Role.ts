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
     */
    static get tableName(): string {
        return 'roles';
    }

    /**
     * Before the update is proceed.
     *
     * @param opt
     * @param queryContext
     */
    $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
        this.updated_at = new Date();
    }

    /**
     * Determine whether the emoji role exists for the guild based on the database data.
     *
     * @param messageID
     * @param emojiID
     * @param roleID
     */
    static async doesExist(
        messageID: string,
        emojiID: string,
        roleID: string,
    ): Promise<boolean> {
        const query = await this.query()
            .where('message', messageID)
            .whereRaw('`emoji` COLLATE utf8mb4_bin = ?', [emojiID])
            .where('role', roleID)
            .count('*')
            .as('count')
            .execute();
        const count: number = query[0]['count'];

        return count > 0;
    }

    /**
     * Create the emoji role by inserting it into the database.
     *
     * @param channelID
     * @param messageID
     * @param emojiID
     * @param roleID
     * @param guildID
     * @param emojiRaw
     */
    static async createReactionRole(
        channelID: string,
        messageID: string,
        emojiID: string,
        roleID: string,
        guildID: string,
        emojiRaw: string,
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
     * @param messageID
     * @param emojiID
     * @param guildID
     * @returns Number of affected rows.
     */
    static async deleteReactionRole(
        messageID: string,
        emojiID: string,
        guildID: string,
    ): Promise<number> {
        return this.query()
            .where('message', messageID)
            .whereRaw('`emoji` COLLATE utf8mb4_bin = ?', [emojiID])
            .where('guild', guildID)
            .del();
    }

    /**
     * Delete all reactions roles connected to the guild.
     *
     * @param guildID
     * @returns Number of affected rows.
     */
    static async deleteGuildRoles(guildID: string): Promise<number> {
        return this.query()
            .where('guild', guildID)
            .del();
    }

    static async all(): Promise<Role[]> {
        return this.query().select();
    }
}
