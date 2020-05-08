import Role from '../models/Role';
import * as Discord from 'discord.js';
import { RoleManager } from '../lib/RoleManager';

export default class Ready {
    client: Discord.Client;
    config: Botranktir.Config;

    /**
     * Ready class for handling the READY event.
     *
     * @param   client
     * @param   config
     */
    constructor(client: Discord.Client, config: Botranktir.Config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Handle the READY event.
     * Setup things for the bot.
     */
    async handle() {
        await this.client.user
            .setActivity('TruckersMP', {
                url: 'https://truckersmp.com',
                type: 'PLAYING',
            })
            .catch(console.error);

        // Load global libraries with managers
        global['roleManager'] = new RoleManager(this.client);

        // Load all emojis to the client so on every reaction the bot does not have to connect to the database
        this.client.guilds.cache.each(async (guild) => {
            const roles = await Role.rolesByGuild(guild.id);
            global.roleManager.fetchRoles(guild.id, roles);
        });
    }
}
