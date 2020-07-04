import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel } from 'discord.js';
import Role from '../../models/Role';
import { RoleManager } from '../../managers/role.manager';

module.exports = class DeleteRoleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'delallroles',
            group: 'roles',
            memberName: 'delallroles',
            description: 'Remove all reaction roles from the message.',
            examples: ['delallroles #welcome 580458877531979786'],
            aliases: [
                'delroles',
                'deleteallroles',
                'deleteroles',
                'deleteallreactions',
                'deletereactions',
                'delallreactions',
                'delreactions',
            ],
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 10,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message for the reactions is placed in.',
                    type: 'channel',
                    default: '',
                },
                {
                    key: 'messageID',
                    prompt: 'Message that the reactions should be removed from.',
                    type: 'string',
                    default: '',
                },
            ],
        });
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

        const affectedRows = await Role.deleteMessageRoles(args.messageID);
        if (affectedRows === 0) {
            return message.reply('no reaction roles match the given credentials.');
        }

        const channelMessage = await args.channel.messages.fetch(args.messageID);
        // Make sure the message could be fetched. If not, it is most likely too old
        if (channelMessage) {
            const roles = RoleManager.get().getRoles(message.guild.id, channelMessage.channel.id, args.messageID);
            for (const [roleID] of roles) {
                const messageReaction = channelMessage.reactions.resolve(roleID);
                if (messageReaction) {
                    await messageReaction.remove();
                }
            }
        }

        RoleManager.get().removeMessage(message.guild.id, args.channel.id, args.messageID);

        return message.reply('all reaction roles have been successfully removed from the message.');
    }
};
