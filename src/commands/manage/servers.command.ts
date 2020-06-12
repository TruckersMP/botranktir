import * as numeral from 'numeral';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Guild, Message, MessageEmbed } from 'discord.js';
import { RoleManager } from '../../managers/role.manager';
import { ClientManager } from '../../managers/client.manager';

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
        const members = client.guilds.cache.reduce((count: number, guild: Guild) => count + guild.memberCount, 0);
        const shards = client.shard ? client.shard.count : 0;
        const roles = RoleManager.get().count();

        const embed = new MessageEmbed()
            .addField('Servers', numeral(servers).format('0,0'), true)
            .addField('Members', numeral(members).format('0,0'), true)
            .addField('Reaction Roles', numeral(roles).format('0,0'), true)
            .addField('Shards', shards || '❌', true)
            .setFooter('Online Since')
            .setTimestamp(ClientManager.get().getStartedAt())
            .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL())
            .setColor(global.BOT_COLOR);

        return message.embed(embed);
    }
};
