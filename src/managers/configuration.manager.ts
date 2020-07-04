import Configuration from '../models/Configuration';
import * as DefaultConfig from '../../config/config.json';

export type GuildConfigurations = Map<string, string>;

/**
 * Takes care of the local storage of configurations per a guild.
 *
 * The bot global configuration is stored under the "bot" key.
 */
export class ConfigurationManager {
    /**
     * Singleton instance of ConfigurationManager.
     */
    private static instance: ConfigurationManager | undefined;
    /**
     * Stores configurations per guild.
     * It is a map in the nested order: guild -> key -> value
     */
    protected guilds: Map<string, GuildConfigurations>;

    protected constructor() {
        this.guilds = new Map<string, GuildConfigurations>();

        // Create a map for the global configuration
        this.guilds.set(this.resolveGuild(), new Map<string, string>());
    }

    /**
     * Get the instance of ConfigurationManager.
     */
    static get(): ConfigurationManager {
        if (this.instance === undefined) {
            this.instance = new ConfigurationManager;
        }
        return this.instance;
    }

    /**
     * Add fetched results from the database to the local storage.
     *
     * @param results
     */
    fetchConfigurations(results: Configuration[]): void {
        for (const result of results) {
            this.updateConfiguration(result.key, result.value, result.guild);
        }
    }

    /**
     * Get the configuration value for the specific key and guild.
     *
     * @param key
     * @param guild Use `null` to get the global bot configuration.
     */
    getConfiguration(key: string, guild?: string): string | null {
        guild = this.resolveGuild(guild);
        if (!this.guilds.has(guild) || !this.guilds.get(guild).has(key)) {
            return this.getDefault(key, guild);
        }

        return this.guilds.get(guild).get(key);
    }

    /**
     * Add or update the configuration in the local storage.
     *
     * @param key
     * @param value
     * @param guild
     */
    updateConfiguration(key: string, value?: string, guild?: string): void {
        guild = this.resolveGuild(guild);
        this.addGuild(guild);
        this.guilds.get(guild).set(key, value);
    }

    /**
     * Remove the specific configuration per the guild.
     *
     * @param key
     * @param guild
     */
    removeConfiguration(key: string, guild?: string): void {
        guild = this.resolveGuild(guild);
        if (this.guilds.has(guild)) {
            this.guilds.get(guild).delete(key);
        }
    }

    /**
     * Get all guilds with custom configurations from the local storage.
     *
     * @param ignoreGlobalConfig    Whether the key of the global bot configuration should be excluded
     * @returns Keys of a map copy
     */
    getGuilds(ignoreGlobalConfig: boolean = false): IterableIterator<string> {
        // Copy the map over in order not to have side effects
        const guilds = new Map(this.guilds);

        if (ignoreGlobalConfig) {
            guilds.delete(this.resolveGuild());
        }

        return guilds.keys();
    }

    /**
     * Get the map of configurations from the local storage per the specific guild.
     *
     * @param guild
     */
    getGuild(guild?: string): GuildConfigurations {
        guild = this.resolveGuild(guild);
        return this.guilds.has(guild) ? this.guilds.get(guild) : new Map<string, string>();
    }

    /**
     * Create a map of configurations in the local storage for the specific guild.
     *
     * If the guild already has a map of configurations, the previous map is **not** overridden.
     *
     * @param guild
     */
    addGuild(guild: string): void {
        if (!this.guilds.has(guild)) {
            this.guilds.set(guild, new Map<string, string>());
        }
    }

    /**
     * Remove configurations for the guild in the local storage.
     *
     * @param guild
     */
    removeGuild(guild: string): void {
        this.guilds.delete(this.resolveGuild(guild));
    }

    /**
     * Verify whether the specific configuration is modified or not.
     *
     * @param key
     * @param guild
     */
    isConfigurationModified(key: string, guild?: string): boolean {
        guild = this.resolveGuild(guild);
        if (!ConfigurationManager.doesConfigurationExist(key, guild !== 'bot')) {
            return false;
        }

        const value = ConfigurationManager.get().getConfiguration(key, guild);
        const defaultConfigEntry = ConfigurationManager.getDefaultConfiguration(key);
        if (!defaultConfigEntry) {
            return false;
        }

        return value !== defaultConfigEntry.defaultValue;
    }

    /**
     * Determine whether the configuration of the key exists.
     *
     * Whether the configuration is per-guild only is also taken into consideration.
     *
     * @param key
     * @param perGuild  Leave empty to check only the existence of the configuration disabling the additional check.
     */
    static doesConfigurationExist(key: string, perGuild?: boolean): boolean {
        if (!DefaultConfig.hasOwnProperty(key)) {
            return false;
        }
        // If only the existence of the configuration needs to be checked
        if (perGuild === undefined) {
            return true;
        }

        const config = this.getDefaultConfiguration(key);
        return (!perGuild && !config.guild) || (perGuild && config.guild);
    }

    /**
     * Get the default configuration entry.
     *
     * @param key
     */
    static getDefaultConfiguration(key: string): Botranktir.DefaultConfigEntry | null {
        if (!this.doesConfigurationExist(key)) {
            return null;
        }

        return DefaultConfig[key];
    }

    /**
     * Determine whether the configuration is per-guild only.
     *
     * @param key
     */
    static isGuildOnly(key: string): boolean {
        if (!this.doesConfigurationExist(key, true)) {
            return false;
        }

        const config = this.getDefaultConfiguration(key);
        return config.guild;
    }

    /**
     * Determine whether the configuration should be hidden from the output.
     *
     * @param key
     */
    static isHidden(key: string): boolean {
        if (!this.doesConfigurationExist(key)) {
            return false;
        }

        const config = this.getDefaultConfiguration(key);
        return config.hidden;
    }

    /**
     * Resolve the guild for the local storage.
     *
     * @param guild
     * @returns Guild's Snowflake, or "bot" for the global bot configuration.
     */
    protected resolveGuild(guild?: string): string {
        return !guild ? 'bot' : guild;
    }

    /**
     * Get the default value for the configuration.
     *
     * @param key
     * @param guild Guild's Snowflake, or "bot" for the global bot configuration.
     */
    protected getDefault(key: string, guild?: string): string | null {
        if (!DefaultConfig.hasOwnProperty(key)) {
            return null;
        }

        const config = ConfigurationManager.getDefaultConfiguration(key);
        if ((config.guild && guild === 'bot') || (!config.guild && guild !== 'bot')) {
            return null;
        }

        return config.defaultValue;
    }
}
