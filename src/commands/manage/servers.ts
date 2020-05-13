import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Message } from 'discord.js';

module.exports = class ServersCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'servers',
            group: 'manage',
            memberName: 'servers',
            description: 'Display all servers that the bot is on.',
            examples: ['servers'],
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['EMBED_LINKS'],
        });
    }

    hasPermission(message: CommandoMessage) {
        if (this.client.isOwner(message.author)) {
            return true;
        }
        // If the command is not executed in a guild and the user is not bot's owner, we have no other way to check
        // user's permissions. Therefore, the user is not permitted to execute this command
        if (!message.guild) {
            return false;
        }

        return message.member.hasPermission('MANAGE_GUILD', { checkAdmin: true, checkOwner: true });
    }

    async run(message: CommandoMessage): Promise<Message | Message[]> {
        const servers = [];
        // Determine whether the foreach has been finished prematurely (for example when the description is too long)
        let finished = false;
        this.client.guilds.cache.forEach((guild) => {
            if (finished) {
                return;
            }
            // Check if the description is not too long
            if (servers.join('\n').length + guild.name.length + guild.id.toString().length + 7 >= 2048 - 22) {
                servers.push('... and more servers');
                finished = true;
                return;
            }

            servers.push(`\`${guild.id}\` - ${guild.name}`);
        });

        const clientUser = this.client.user;
        const embed = new MessageEmbed()
            .setDescription(servers)
            .setAuthor(`${clientUser.username}#${clientUser.discriminator}`, clientUser.displayAvatarURL())
            .setColor(0xc4fcff)
            .setTitle('**Servers**');

        return message.embed(embed);
    }
};
