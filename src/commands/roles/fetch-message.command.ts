import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { RoleManager } from '../../managers/role.manager';
import { PermissionsManager } from '../../managers/permission.manager';

module.exports = class FetchMessageCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'fetchmessage',
            group: 'roles',
            memberName: 'fetchmessage',
            description: 'Get all reaction roles that are registered for the message.',
            examples: ['fetchmessage #welcome 580458877531979786'],
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message with role reactions is placed in.',
                    type: 'channel',
                    default: '',
                },
                {
                    key: 'messageID',
                    prompt: 'Message with reaction roles.',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    hasPermission(message: CommandoMessage, ownerOverride?: boolean): boolean | string {
        if (PermissionsManager.isGuildManager(message.member)) {
            return true;
        }

        return super.hasPermission(message, ownerOverride);
    }

    async run(
        message: CommandoMessage,
        args: { channel: TextChannel; messageID: string },
    ): Promise<Message | Message[]> {
        if (
            !args.channel ||
            !args.messageID ||
            args.channel.type !== 'text' ||
            args.channel.guild.id !== message.guild.id
        ) {
            return message.reply(
                'please, provide valid parameters! For more information, ' +
                `run command \`${message.guild.commandPrefix}help ${this.name}\``,
            );
        }

        const roles = RoleManager.get().getRoles(message.guild.id, args.channel.id, args.messageID);
        if (!roles || roles.size === 0) {
            return message.reply(
                'there are no reaction roles registered for the message, or the message does not exist.',
            );
        }

        const embed = new MessageEmbed()
            .setTitle('Reaction roles for the message')
            .setFooter(`#${args.channel.name} - ${args.messageID}`)
            .setColor(global.BOT_COLOR);

        for (const [, value] of roles) {
            const guildRole = message.guild.roles.resolve(value.role);
            const roleName = guildRole ? guildRole.name : '*Unknown*';
            const text = value.raw + (value.singleUse ? ' (single use)' : '');
            embed.addField(roleName, text, true);
        }

        return message.channel.send(embed);
    }
};
