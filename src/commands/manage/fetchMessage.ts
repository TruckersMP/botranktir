import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Command } from 'discord.js-commando';
import { MessageEmbed, Message } from 'discord.js';

module.exports = class FetchMessageCommand extends Command {
    /**
     * FetchMessageCommand class for the +fetchmessage command that gets all reaction roles that are registered for the message.
     *
     * @param   {CommandoClient} client
     */
    constructor(client: CommandoClient) {
        super(client, {
            name: 'fetchmessage',
            group: 'manage',
            memberName: 'fetchmessage',
            description: 'Get all reaction roles that are registered for the message.',
            examples: ['fetchmessage #welcome 580458877531979786'],
            userPermissions: ['MANAGE_GUILD'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 15,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'Channel where the message with role reactions is placed in.',
                    type: 'string',
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

    async run(
        message: CommandoMessage,
        { channel, messageID }: { channel: string; messageID: string }
    ): Promise<Message | Message[]> {
        // If the last parameter is not provided, other parameters cannot be provided either
        if (!messageID) {
            return message.reply(
                'please, provide all parameters! For more information, ' +
                    `run command \`${this.client.commandPrefix}help fetchmessage\``
            );
        }

        const guildChannel = message.mentions.channels.first();
        if (!guildChannel) {
            return message.reply('I could not find the channel. Make sure I have access to it.');
        }

        const roles = global.roleManager.getRoles(message.guild.id, guildChannel.id, messageID.toString());
        if (!roles) {
            return message.reply(
                'there are no reaction roles registered for the message or ' + 'the message does not exist.'
            );
        }

        const embed = new MessageEmbed()
            .setTitle('Reaction roles for the message')
            .setFooter(`#${guildChannel.name} - ${messageID.toString()}`)
            .setColor(0xc4fcff);
        for (const key in roles) {
            if (!roles.hasOwnProperty(key)) {
                continue;
            }

            const guildRole = message.guild.roles.cache.find((role) => role.id === roles[key]['role']);
            const roleName = guildRole ? guildRole.name : '*Unknown*';
            embed.addField(roleName, roles[key]['raw'], true);
        }

        return message.channel.send(embed);
    }
};
