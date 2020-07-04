import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel } from 'discord.js';
import { RoleManager } from '../../managers/role.manager';
import Emoji from '../../structures/Emoji';
import Role from '../../models/Role';

interface Arguments {
    channel: TextChannel | null;
    messageID: string;
    emojiRaw: string;
}

module.exports = class ToggleRoleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'togglerole',
            group: 'roles',
            memberName: 'togglerole',
            description: 'Toggle the reaction role to be single use. If it is already single use, revert it.',
            examples: ['togglerole #welcome 580458877531979786 :truckersmp:'],
            aliases: ['togglereaction', 'togglesingleuse'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message with the reaction role is placed in.',
                    type: 'channel',
                    default: '',
                },
                {
                    key: 'messageID',
                    prompt: 'Message with the reaction role.',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'emojiRaw',
                    prompt: 'Emoticon that is used for the reaction role.',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        args: Arguments,
    ): Promise<Message | Message[]> {
        if (
            !args.channel ||
            !args.messageID ||
            !args.emojiRaw ||
            args.channel.type !== 'text' ||
            args.channel.guild.id !== message.guild.id
        ) {
            return message.reply(
                'please, provide valid parameters! For more information, ' +
                `run command \`${message.guild.commandPrefix}help ${this.name}\``,
            );

        }
        const emoji = new Emoji(args.emojiRaw);

        const role = RoleManager.get().getRole(message.guild.id, args.channel.id, args.messageID, emoji.id);
        if (!RoleManager.get().isManagedRole(role)) {
            return message.reply('no reaction matches the given credentials.');
        }

        const singleUse = RoleManager.get().isRoleSingleUse(args.messageID, role);
        await Role.updateRoleSingleUse(args.messageID, emoji.id, role, !singleUse);
        RoleManager.get().updateRoleSingleUse(
            message.guild.id,
            args.channel.id,
            args.messageID,
            role,
            emoji.id,
            !singleUse,
        );

        if (singleUse) {
            return message.reply('the reaction role can now be unassigned after removing the reaction.');
        }

        return message.reply('the reaction role has been toggled to the single use.');
    }
};
