import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild, Message, MessageEmbed } from 'discord.js';
import * as numeral from 'numeral';
import { RoleManager } from '../../managers/role.manager';

module.exports = class ServersCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'servers',
            group: 'manage',
            memberName: 'servers',
            description: 'Display statistics about all servers the bot is on.',
            examples: ['servers'],
            ownerOnly: true,
            clientPermissions: ['EMBED_LINKS'],
        });
    }

    async run(message: CommandoMessage): Promise<Message | Message[]> {
        const client = this.client;

        const servers = client.guilds.cache.size;
        const partneredServers = client.guilds.cache.filter(guild => guild.partnered).size;
        const verifiedServers = client.guilds.cache.filter(guild => guild.verified).size;
        const members = client.guilds.cache.reduce((count: number, guild: Guild) => count + guild.memberCount, 0);
        const shards = client.shard ? client.shard.count : 0;
        const roles = RoleManager.get().count();

        const embed = new MessageEmbed()
            .addField('Servers', numeral(servers).format('0,0'), true)
            .addField('Partnered Servers', numeral(partneredServers).format('0,0'), true)
            .addField('Verified Servers', numeral(verifiedServers).format('0,0'), true)
            .addField('Members', numeral(members).format('0,0'), true)
            .addField('Shards', shards || '❌', true)
            .addField('Reaction Roles', numeral(roles).format('0,0'), true)
            .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL())
            .setColor(global.BOT_COLOR);

        return message.embed(embed);
    }
};
