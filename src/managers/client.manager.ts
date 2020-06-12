import Role from '../models/Role';
import Configuration from '../models/Configuration';
import { Client } from 'discord.js-commando';
import { RoleManager } from './role.manager';
import { ConfigurationManager } from './configuration.manager';

/**
 * Manages the Discord client instance.
 *
 * Can set up and initialize necessary objects, and load data to the local storage.
 */
export class ClientManager {
    /**
     * Singleton instance of ClientManager.
     */
    private static instance: ClientManager | undefined;
    /**
     * Whether the singleton instance is initialized.
     */
    protected initialized: boolean;
    /**
     * Instance of the Discord client.
     */
    protected client: Client | undefined;

    protected constructor() {
        this.initialized = false;
    }

    /**
     * Get the instance of ClientManager.
     */
    static get(): ClientManager {
        if (this.instance === undefined) {
            this.instance = new ClientManager;
        }
        return this.instance;
    }

    /**
     * Initialize the ClientManager instance.
     *
     * @param client
     */
    init(client: Client): void {
        if (this.initialized) {
            return;
        }

        this.client = client;

        this.initialized = true;
    }

    /**
     * Initialize all necessary objects.
     */
    async load(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('The instance is not initialized!');
        }

        // Load all reactions roles to the local storage
        const roles = await Role.all();
        RoleManager.get().fetchRoles(roles);

        // Create default configurations for the bot
        await Configuration.createDefaultConfigurations();
        // Load all configurations to the local storage
        const configurations = await Configuration.all();
        ConfigurationManager.get().fetchConfigurations(configurations);
    }

    /**
     * Determine whether all necessary objects have been initialized.
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Gets called when the client is ready.
     */
    async onReady(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('The instance is not initialized!');
        }

        // Set interval for setting the activity as sometimes the activity is gone
        setInterval(ClientManager.setActivity, 60 * 1000, this.client);
        await ClientManager.setActivity(this.client);

        await this.clearConfigurations();
        // TODO: Add clearing old reaction roles (per a guild + a channel + a message?)
    }

    /**
     * Clear all configurations of guilds which the client is not in anymore.
     */
    protected async clearConfigurations(): Promise<void> {
        if (process.env.CLEAR_GUILD === 'false') {
            return;
        }

        for (const guild of ConfigurationManager.get().getGuilds(true)) {
            if (this.client.guilds.resolve(guild)) {
                continue;
            }

            await Configuration.deleteGuildConfigurations(guild);
            ConfigurationManager.get().removeGuild(guild);
        }
    }

    /**
     * Set the presence activity of the client.
     *
     * @param client
     */
    protected static async setActivity(client: Client): Promise<void> {
        if (client.user.presence.activities.length === 0) {
            await client.user.setActivity('TruckersMP', {
                url: 'https://truckersmp.com',
                type: 'PLAYING',
            });
        }
    }
}
