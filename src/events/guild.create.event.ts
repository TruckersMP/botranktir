import { Event } from './event';
import { Client } from 'discord.js';
import { CommandoGuild } from 'discord.js-commando';
import Role from '../models/Role';
import { RoleManager } from '../managers/role.manager';
import Configuration from '../models/Configuration';
import { ConfigurationManager } from '../managers/configuration.manager';
import { ClientManager } from '../managers/client.manager';

/**
 * Handle `guildCreate` events from Discord.
 *
 * This event is fired when the client joins a new guild.
 * Keep in mind this event is not fired on the bot setup.
 */
export class GuildCreateEvent extends Event {
    constructor(
        client: Client,
        protected guild: CommandoGuild,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        console.log('joined guild', this.guild.id, this.guild.name);

        // Change the command prefix for the guild only if the bot is not in
        // the development mode as in such a case, the environment value is forced
        if (!global.LOCAL) {
            this.guild.commandPrefix = ConfigurationManager.get().getConfiguration('prefix', this.guild.id);
        }

        // If data is cleared on leaving the guild, there is nothing left in
        // the database; nothing needs to be fetched
        if (process.env.CLEAR_GUILD === 'true') {
            return;
        }

        const roles = await Role.getGuildRoles(this.guild.id);
        RoleManager.get().fetchRoles(roles);

        const configurations = await Configuration.getGuildConfigurations(this.guild.id);
        ConfigurationManager.get().fetchConfigurations(configurations);

        // Once the data is loaded, run the cleanup
        await ClientManager.get().clearGuildRoles(this.guild.id);
    }
}
