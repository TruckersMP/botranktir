import Role from '../models/Role';
import { RoleManager } from '../managers/role.manager';
import Configuration from '../models/Configuration';
import { ConfigurationManager } from '../managers/configuration.manager';
import { Event } from './event';
import { Client } from 'discord.js';

/**
 * Handle the READY event.
 *
 * Setup things for the bot.
 */
export class ReadyEvent extends Event {
    async handle(): Promise<void> {
        setInterval(ReadyEvent.setActivity, 60 * 1000, this.client);
        await ReadyEvent.setActivity(this.client);

        // Load all reactions roles to the local storage
        const roles = await Role.all();
        RoleManager.get().fetchRoles(roles);

        // Create default configurations for the bot
        await Configuration.createDefaultConfigurations();
        // Load all configurations to the local storage
        const configurations = await Configuration.all();
        ConfigurationManager.get().fetchConfigurations(configurations);

        console.log('bot has been successfully loaded');
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
