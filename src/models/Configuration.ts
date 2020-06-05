import { Model, ModelOptions, QueryContext } from 'objection';
import * as DefaultConfig from '../../config/config.json';
import { ConfigurationManager } from '../managers/configuration.manager';

interface IConfiguration {
    created_at: Date;
    updated_at: Date;
    guild?: string;
    key: string;
    value?: string;
}

export default class Configuration extends Model implements IConfiguration {
    created_at: Date;
    updated_at: Date;
    guild?: string;
    key: string;
    value?: string;

    /**
     * Get the name of the table.
     */
    static get tableName(): string {
        return 'configurations';
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
     * Create configurations for the bot with default values.
     *
     * This method does not take care of the local storage.
     */
    static async createDefaultConfigurations(): Promise<void> {
        for (const key in DefaultConfig) {
            const config = ConfigurationManager.getDefaultConfiguration(key);

            // The configuration cannot be per-guild only, and must not exist to be created
            if (!config.guild && !await Configuration.getConfiguration(key)) {
                await this.setConfiguration(key, config.defaultValue);
            }
        }
    }

    /**
     * Get the value of the specific configuration matching the key and the guild.
     *
     * @param key
     * @param guild
     */
    static async getConfiguration(key: string, guild?: string): Promise<string> {
        const first = await this.query()
            .where('key', key)
            .where('guild', this.resolveGuild(guild))
            .first();

        return first !== undefined ? first.value : '';
    }

    /**
     * Determine whether the configuration exists in the database meaning
     * the default value has been modified to something else.
     *
     * @param key
     * @param guild
     */
    static async doesExist(key: string, guild?: string): Promise<boolean> {
        const query = await this.query()
            .where('key', key)
            .where('guild', this.resolveGuild(guild))
            .count('*', { as: 'count' })
            .execute();
        const count: number = query[0]['count'];

        return count > 0;
    }

    /**
     * Create a new configuration.
     *
     * @param key
     * @param value
     * @param guild
     */
    static async setConfiguration(key: string, value?: string, guild?: string): Promise<void> {
        if (await this.doesExist(key, guild)) {
            await this.query()
                .where('key', key)
                .where('guild', this.resolveGuild(guild))
                .update({ value });
        } else {
            await this.query().insert({
                key,
                value,
                guild,
            });
        }
    }

    /**
     * Delete the specific configuration.
     *
     * @param key
     * @param guild
     */
    static async deleteConfiguration(key: string, guild?: string): Promise<number> {
        return this.query()
            .where('key', key)
            .where('guild', this.resolveGuild(guild))
            .del();
    }

    /**
     * Delete all configurations for the specific guild.
     *
     * @param guild
     */
    static async deleteGuildConfigurations(guild: string): Promise<number> {
        return this.query()
            .where('guild', guild)
            .del();
    }

    /**
     * Get all configurations of the specific guild.
     *
     * @param guild
     */
    static async getGuildConfigurations(guild: string): Promise<Configuration[]> {
        return this.query()
            .where('guild', guild)
            .select();
    }

    /**
     * Get all configuration rows.
     */
    static async all(): Promise<Configuration[]> {
        return this.query().select();
    }

    /**
     * Resolve the guild ID for the database.
     *
     * @param guild
     */
    protected static resolveGuild(guild?: string): string | null {
        return guild === undefined ? null : guild;
    }
}
