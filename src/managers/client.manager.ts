import Role from '../models/Role';
import Configuration from '../models/Configuration';
import { Client, CommandoGuild } from 'discord.js-commando';
import { RoleManager } from './role.manager';
import { ConfigurationManager } from './configuration.manager';
import { Activity, Presence, TextChannel } from 'discord.js';

export interface BotDeveloper {
    name: string;
    link: string;
}

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
    /**
     * Timestamp of when the client was loaded up.
     */
    protected startedAt: Date | undefined;

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
        this.startedAt = new Date();

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
     * Get the instance of the Date class of when the bot was loaded up.
     */
    getStartedAt(): Date | undefined {
        return this.startedAt;
    }

    /**
     * Get the developers of the bot.
     *
     * If you feel like you contributed a fair part to the bot, do not hesitate
     * to add yourself with a link to your portfolio (or a Github profile).
     *
     * Any advertisement or promotional links will not be accepted!
     */
    getDevelopers(): BotDeveloper[] {
        return [
            { name: 'TruckersMP', link: 'https://truckersmp.com' },
            { name: '3v', link: 'https://3v.fi/' },
        ];
    }

    /**
     * Gets called when the client is ready.
     */
    async onReady(): Promise<void> {
        if (!this.isInitialized()) {
            throw new Error('The instance is not initialized!');
        }

        // Update the command prefix for all guilds
        this.updateCommandPrefix();

        // Set interval for setting the activity as sometimes the activity is gone
        setInterval(ClientManager.setActivity, 60 * 1000, this.client);
        await ClientManager.setActivity(this.client);

        await this.clearConfigurations();
        await this.clearReactionRoles();
    }

    /**
     * Load the command prefix for all guilds from the configuration.
     *
     * In the development mode, the command prefix is kept to default.
     */
    protected updateCommandPrefix(): void {
        if (global.LOCAL) {
            return;
        }

        for (const [guildId, guild] of this.client.guilds.cache) {
            const commandoGuild = <CommandoGuild>guild;
            commandoGuild.commandPrefix = ConfigurationManager.get().getConfiguration('prefix', guildId);
        }
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
     * Clear all reaction roles of channels and messages that have been
     * removed. Guild roles will be removed only if the cleanup is enabled.
     */
    protected async clearReactionRoles(): Promise<void> {
        for (const guildId of RoleManager.get().getManagedGuilds()) {
            await this.clearGuildRoles(guildId);
        }
    }

    /**
     * Clear all reaction roles of the guild.
     *
     * This method also goes through all channels and messages with reaction
     * roles, and delete the instances if the original location was removed.
     *
     * @param guildID
     */
    async clearGuildRoles(guildID: string): Promise<void> {
        const guild = this.client.guilds.resolve(guildID);
        if (!guild) {
            if (process.env.CLEAR_GUILD === 'false') {
                return;
            }

            await Role.deleteGuildRoles(guildID);
            RoleManager.get().removeGuild(guildID);

            return;
        }

        const channels: string[] = [];
        // Map of messages in the channel
        const messages = new Map<string, string[]>();
        for (const role of RoleManager.get().getManagedRoles()) {
            if (role.guildID !== guildID) {
                continue;
            }

            if (!channels.includes(role.channelID)) {
                channels.push(role.channelID);
                messages.set(role.channelID, []);
            }
            if (!messages.get(role.channelID).includes(role.messageID)) {
                messages.get(role.channelID).push(role.messageID);
            }
        }

        for (const channelID of channels) {
            const channel = guild.channels.resolve(channelID);
            if (!channel) {
                await Role.deleteChannelRoles(channelID);
                RoleManager.get().removeChannel(guildID, channelID);

                // As messages are connected to channels, they will be removed
                // along with the above cleanup. Therefore, we do not need to
                // loop through channel's messages, and the script can continue
                continue;
            }

            const textChannel = <TextChannel>channel;
            for (const messageID of messages.get(channelID)) {
                const message = await textChannel.messages.fetch(messageID);
                if (!message) {
                    await Role.deleteMessageRoles(messageID);
                    RoleManager.get().removeMessage(guildID, channelID, messageID);
                }
            }
        }
    }

    /**
     * Set the presence activity of the client.
     *
     * @param client
     */
    protected static async setActivity(client: Client): Promise<void> {
        // The user needs to be fetched again. Discord might remove the presence
        // of the client, and when it happens, the cache does not get updated
        const user = await client.user.fetch();

        if (!this.isPlaying(user.presence)) {
            await client.user.setActivity({
                name: 'TruckersMP',
                url: 'https://truckersmp.com',
                type: 'PLAYING',
            });
        }
    }

    /**
     * Determine whether the member with the given presence is playing a game.
     *
     * @param presence
     */
    protected static isPlaying(presence: Presence): boolean {
        return presence.activities.find((activity: Activity) => activity.type === 'PLAYING') !== undefined;
    }
}
