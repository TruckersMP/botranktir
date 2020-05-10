import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Command } from 'discord.js-commando';
import Role from '../../models/Role';
import { Message } from 'discord.js';

module.exports = class DeleteRoleCommand extends Command {
    /**
     * DeleteRoleCommand class for the +delrole command that removes the reaction role from the message.
     *
     * @param   {CommandoClient} client
     */
    constructor(client: CommandoClient) {
        super(client, {
            name: 'delrole',
            group: 'manage',
            memberName: 'delrole',
            description: 'Remove the reaction role from the message.',
            examples: ['delrole #welcome 580458877531979786 :truckersmp:'],
            aliases: ['deleterole', 'deletereaction', 'delreaction'],
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 15,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message for the reaction is placed in.',
                    type: 'string',
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
        { channel, messageID, emojiRaw }: { channel: {}; messageID: string; emojiRaw: string }
    ): Promise<Message | Message[]> {
        // If the last parameter is not provided, other parameters cannot be provided either
        if (!emojiRaw) {
            return message.reply(
                'please, provide all parameters! For more information, ' +
                    `run command \`${this.client.commandPrefix}help delrole\``
            );
        }

        const guildChannel = message.mentions.channels.first();
        if (!guildChannel) {
            return message.reply('I could not find the channel. Make sure I have access to it.');
        }

        // Get only the emote name and the ID in the required format (truckersmp:579609125831573504)
        const emoji = emojiRaw.replace(/<?a?:?((.*:)?([0-9]+|.*))>?/, '$1');

        let emojiID = emoji;
        // The emoji should be an ID. However, the emoji can also be a unicode symbol and
        // that is why we set the default value above
        const emojiResults = /([0-9]{18,20})/.exec(emoji);
        if (emojiResults && emojiResults[1]) {
            emojiID = emojiResults[1];
        }

        const affectedRows = await Role.deleteReactionRole(
            guildChannel.id,
            messageID.toString(),
            emojiID,
            message.guild.id
        );

        if (affectedRows === 0) {
            return message.reply('no reaction matches the given credentials.');
        }

        // Remove the reaction if it was removed from the database since
        // we want to remove only reactions for roles, not others
        try {
            const messages = await guildChannel.messages.fetch();
            const channelMessage = messages.get(messageID.toString());
            const messageReaction = channelMessage.reactions.resolve(emojiID);
            if (messageReaction) {
                await messageReaction.remove();
            }
        } catch (err) {
            // The message is probably too old and thus, the reaction cannot be removed
            // or the message cannot be found. We do not need to do anything
        }

        global.roleManager.removeRole(message.guild.id, guildChannel.id, messageID.toString(), emojiID);

        return message.reply('the reaction role has been successfully removed.');
    }
};
