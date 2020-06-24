import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Discord from 'discord.js';
import Role from '../../models/Role';
import { RoleManager } from '../../managers/role.manager';
import Emoji from '../../structures/Emoji';

interface Arguments {
    channel: Discord.TextChannel | null;
    messageID: string;
    emojiRaw: string;
    role: Discord.Role | null;
}

module.exports = class AddRoleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'addrole',
            group: 'roles',
            memberName: 'addrole',
            description:
                'Add reaction to the message that will assign the role to the member or ' +
                'unassign it after removing the reaction.',
            examples: ['addrole #welcome 580458877531979786 :truckersmp: Subscriber'],
            aliases: ['addreaction'],
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
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
                    type: 'role',
                    default: '',
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        args: Arguments,
    ): Promise<Discord.Message | Discord.Message[]> {
        if (
            !args.channel ||
            !args.messageID ||
            !args.emojiRaw ||
            !args.role ||
            args.channel.type !== 'text' ||
            args.channel.guild.id !== message.guild.id
        ) {
            return message.reply(
                'please, provide valid parameters! For more information, ' +
                `run command \`${this.client.commandPrefix}help ${this.name}\``,
            );
        }

        const guild = message.guild;
        const botMember = guild.members.resolve(this.client.user);
        const botHighestRole = botMember.roles.highest;

        const messages = await args.channel.messages.fetch();
        const channelMessage = messages.get(args.messageID);
        if (!channelMessage) {
            return message.reply(
                'I could not find the message. Make sure I have access to read the ' +
                'channel, and the message is in the channel you picked. Also, the message must not be too old.',
            );
        }

        // The role is higher than bot's highest role
        if (args.role.comparePositionTo(botHighestRole) > 0) {
            return message.reply('the role is higher than my highest role. I would not be able to manage the role.');
        }
        // The role cannot be higher than author's highest role
        if (args.role.comparePositionTo(message.member.roles.highest) > 0) {
            return message.reply('I cannot give members a higher role than your current highest role!');
        }

        const emoji = new Emoji(args.emojiRaw);

        const moreDetailsText =
            'For more details, run this command: ' +
            `\`${this.client.commandPrefix}fetchmessage #${args.channel.name} ${args.messageID}\``;
        // The same emoji cannot be twice on the same message
        if (RoleManager.get().getRole(guild.id, args.channel.id, args.messageID, emoji.id)) {
            return message.reply(`this emoji has already been connected to a role on the message.\n${moreDetailsText}`);
        }
        // The same role cannot be linked to the message twice
        if (RoleManager.get().getEmojiFromRole(guild.id, args.channel.id, args.messageID, args.role.id)) {
            return message.reply(`this role has already been connected to this message.\n${moreDetailsText}`);
        }

        return channelMessage
            .react(emoji.identifier)
            .catch(() => {
                message.reply(
                    'I could not react with the given emoji. Make sure I can use the emoji, or react ' +
                        'with the emoji as first, and use the command again.',
                );
            })
            .then(
                async (): Promise<Discord.Message | Discord.Message[]> => {
                    // Do not continue if the row already exists
                    if (await Role.doesExist(args.channel.id, emoji.id, args.role.id)) {
                        return message.reply('a reaction role with the given details has already existed.');
                    }

                    await Role.createReactionRole(
                        args.channel.id,
                        args.messageID,
                        emoji.id,
                        args.role.id,
                        guild.id,
                        emoji.raw,
                    );
                    RoleManager.get().addRole(guild.id, args.channel.id, args.messageID, args.role.id, emoji);

                    return message.reply('the reaction for the role has been successfully added.');
                },
            );
    }
};
