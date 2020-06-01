import { CommandoGuild } from 'discord.js-commando';
import { ConfigurationManager } from '../../managers/configuration.manager';
import { RoleManager } from '../../managers/role.manager';
import Configuration from '../../models/Configuration';
import Role from '../../models/Role';
import { Event } from '../event';
import { Client } from 'discord.js';

/**
 * Handle `guildDelete` events from Discord.
 *
 * This event is fired when the client is kicked from the guild, or when the guild is deleted.
 */
export class GuildDeleteEvent extends Event {
    constructor(client: Client, protected guild: CommandoGuild) {
        super(client);
    }

    async handle(): Promise<void> {
        if (process.env.CLEAR_GUILD === 'false') {
            return;
        }

        // Remove all reactions roles of the guild
        await Role.deleteGuildRoles(this.guild.id);
        RoleManager.get().removeGuild(this.guild.id);
        // Remove all configurations of the guild
        await Configuration.deleteGuildConfigurations(this.guild.id);
        ConfigurationManager.get().removeGuild(this.guild.id);

        console.log('left guild', this.guild.id, this.guild.name);
    }
}
