const { Command } = require('discord.js-commando');

module.exports = class DeleteRoleCommand extends Command {
    /**
     * DeleteRoleCommand class for the +delrole command that removes the reaction role from the message.
     *
     * @param   {CommandoClient} client
     */
    constructor(client) {
        super(client, {
            name: 'delrole',
            group: 'manage',
            memberName: 'delrole',
            description: 'Delete the reaction role from the message.',
            examples: ['delrole #welcome 580458877531979786 :truckersmp:'],
            aliases: ['deleterole', 'deletereaction', 'delreaction'],
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 15
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message for the reaction is placed in.',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'messageID',
                    prompt: 'Message that the reaction should be removed from.',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'emoji',
                    prompt: 'Emoticon that was used for the reaction role.',
                    type: 'string',
                    default: ''
                },
            ]
        });
    }

    async run(message, { channel, messageID, emoji }) {
        // If the last parameter is not provided, other parameters cannot be provided either
        if (!emoji) {
            return await message.reply(`please, provide all parameters! For more information, `
                + `run command \`${this.client.commandPrefix}help delrole\``);
        }

        const guildChannel = message.mentions.channels.first();
        if (!guildChannel) {
            return await message.reply(`I could not find the channel. Make sure I have access to it.`);
        }

        // Get only the emote name and the ID in the required format (truckersmp:579609125831573504)
        emoji = emoji.replace(/<?a?:?((.*:)?([0-9]+|.*))>?/, '$1');

        let emojiID = emoji;
        // The emoji should be an ID. However, the emoji can also be a unicode symbol and
        // that is why we set the default value above
        const emojiResults = /([0-9]{18,20})/.exec(emoji);
        if (emojiResults && emojiResults[1]) {
            emojiID = emojiResults[1];
        }

        connection.query(
            'DELETE FROM roles WHERE channel = ? AND message = ? AND emoji = ? AND guild = ?',
            [guildChannel.id, messageID.toString(), emojiID, message.guild.id],
            async (err, results) => {
                if (err) {
                    await message.reply(`The reaction role could not be removed from the database due to an error.`);
                    if (this.client.isOwner(message.author)) {
                        await message.channel.send(`Make sure the credentials for the database connection are `
                            + `correct and restart the bot if you make any changes.`);
                    }

                    return;
                }

                if (results.affectedRows === 0) {
                    return await message.reply(`no reaction matches the given credentials.`);
                }

                // Remove the reaction if it was removed from the database since
                // we want to remove only reactions for roles, not others
                try {
                    const messages = await guildChannel.messages.fetch();
                    const channelMessage = await messages.get(messageID.toString());
                    const messageReaction = channelMessage.reactions.get(emojiID);
                    if (messageReaction) {
                        messageReaction.users.remove(this.client.user.id);
                    }
                } catch (err) {
                    // The message is probably too old and thus, the reaction cannot be removed
                    // or the message cannot be found. We do not need to do anything
                }

                roleManager.removeRole(message.guild.id, guildChannel.id, messageID.toString(), emojiID);

                await message.reply(`the reaction role has been successfully removed.`);
            }
        );
    }
};
