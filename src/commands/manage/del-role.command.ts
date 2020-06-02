import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, TextChannel } from 'discord.js';
import { RoleManager } from '../../managers/role.manager';
import { Emoji } from '../../structures/Emoji';
import Role from '../../models/Role';

interface Arguments {
    channel: TextChannel | null;
    messageID: string;
    emojiRaw: string;
}

module.exports = class DeleteRoleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'delrole',
            group: 'manage',
            memberName: 'delrole',
            description: 'Remove the reaction role from the message.',
            examples: ['delrole #welcome 580458877531979786 :truckersmp:'],
            aliases: ['deleterole', 'deletereaction', 'delreaction'],
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message for the reaction is placed in.',
                    type: 'channel',
                    default: '',
                },
                {
                    key: 'messageID',
                    prompt: 'Message that the reaction should be removed from.',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'emojiRaw',
                    prompt: 'Emoticon that was used for the reaction role.',
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
                `run command \`${this.client.commandPrefix}help ${this.name}\``,
            );
        }

        const emoji = new Emoji(args.emojiRaw);

        const affectedRows = await Role.deleteReactionRole(
            args.messageID,
            emoji.id,
        );

        if (affectedRows === 0) {
            return message.reply('no reaction matches the given credentials.');
        }

        // Remove the reaction if it was removed from the database since
        // we want to remove only reactions for roles, not others
        try {
            const channelMessage = await args.channel.messages.fetch(args.messageID);
            const messageReaction = channelMessage.reactions.resolve(emoji.id);
            if (messageReaction) {
                await messageReaction.remove();
            }
        } catch (err) {
            // The message is probably too old and thus, the reaction cannot be removed,
            // or the message cannot be found. We do not need to do anything
        }

        RoleManager.get().removeRole(message.guild.id, args.channel.id, args.messageID, emoji.id);

        return message.reply('the reaction role has been successfully removed.');
    }
};
