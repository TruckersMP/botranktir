import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Discord from 'discord.js';
import Role from '../../models/Role';

export class AddRoleCommand extends Command {
    /**
     * AddRoleCommand class for the +addrole command that adds a row to the database for the reaction role.
     *
     * @param   {CommandoClient} client
     */
    constructor(client: CommandoClient) {
        super(client, {
            name: 'addrole',
            group: 'manage',
            memberName: 'addrole',
            description:
                'Add reaction to the message that will assign the role to the member or ' +
                'unassign it after removing the reaction.',
            examples: ['addrole #welcome 580458877531979786 :truckersmp: Subscriber'],
            aliases: ['addreaction'],
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['MANAGE_ROLES'],
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
                    prompt: 'Message that the reaction should be put at.',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'emojiRaw',
                    prompt: 'Emoticon that will assign or unassign the role (after reacting or removing the reaction).',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'role',
                    prompt:
                        'Role that will be assigned after reacting or unassigned after removing the reaction. ' +
                        'Can be ID of the role or the mention.',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        { channel, messageID, emojiRaw, role }: { channel: {}; messageID: string; emojiRaw: string; role: string }
    ): Promise<Discord.Message | Discord.Message[]> {
        // If the last parameter is not provided, other parameters cannot be provided either
        if (!role) {
            return await message.reply(
                'please, provide all parameters! For more information, ' +
                    `run command \`${this.client.commandPrefix}help addrole\``
            );
        }

        const guild = message.guild;
        const botMember = guild.members.resolve(this.client.user.id);
        const botHighestRole = botMember.roles.highest;

        const guildChannel = message.mentions.channels.first();
        if (!guildChannel) {
            return message.reply('I could not find the channel. Make sure I have access to it.');
        }

        const messages = await guildChannel.messages.fetch();
        const channelMessage = messages.get(messageID.toString());
        if (!channelMessage) {
            return message.reply(
                'I could not find the message. Make sure I have access to read the ' +
                    'channel and the message is in the channel you forwarded to me. Also, the message cannot be too old.'
            );
        }

        let guildRole = guild.roles.cache.find((foundRole) => foundRole.name === role);
        // If the role cannot be found by the name, get the first mentioned role
        if (!guildRole) {
            guildRole = message.mentions.roles.first();
        }
        // Still no role? Try to get the role by the ID
        if (!guildRole) {
            guildRole = guild.roles.resolve(role);
        }
        if (!guildRole) {
            return message.reply('I could not find the role.');
        }
        // The role is higher than bot's highest role
        if (guildRole.comparePositionTo(botHighestRole) > 0) {
            return message.reply('the role is higher than my highest role. I would not be able to manage the role.');
        }
        // The role cannot be higher than author's highest role
        if (guildRole.comparePositionTo(message.member.roles.highest) > 0) {
            return message.reply('I cannot give members a higher role than your current highest role!');
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

        const moreDetailsText =
            'For more details, run this command: ' +
            `\`${this.client.commandPrefix}fetchmessage #${guildChannel.name} ${messageID}\``;
        // The same emoji cannot be twice on the same message
        if (global.roleManager.getRole(guild.id, guildChannel.id, channelMessage.id, emojiID)) {
            return await message.reply(
                `this emoji has already been connected to a role on the message.\n${moreDetailsText}`
            );
        }
        // The same role cannot be linked to the message twice
        if (global.roleManager.getEmojiFromRole(guild.id, guildChannel.id, channelMessage.id, guildRole.id)) {
            return await message.reply(`this role has already been connected to this message.\n${moreDetailsText}`);
        }

        return channelMessage
            .react(emoji)
            .catch(async () => {
                await message.reply(
                    'I could not react with the given emoji. Make sure I can use the emoji, or react ' +
                        'with the emoji as first and use the command again.'
                );
            })
            .then(
                async (): Promise<Discord.Message | Discord.Message[]> => {
                    // Do not continue if the row already exists
                    if (Role.doesExist(guildChannel.id, channelMessage.id, emojiID, guildRole.id, guild.id)) {
                        return message.reply('a reaction role with the given details has already existed.');
                    }

                    await Role.createReactionRole(
                        guildChannel.id,
                        channelMessage.id,
                        emojiID,
                        guildRole.id,
                        guild.id,
                        emojiRaw
                    );
                    global.roleManager.addRole(guild.id, guildChannel.id, channelMessage.id, guildRole.id, emojiRaw);

                    return message.reply('the reaction for the role has been successfully added.');
                }
            );
    }
}
