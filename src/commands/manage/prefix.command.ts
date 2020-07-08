import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { ConfigurationManager } from '../../managers/configuration.manager';
import Configuration from '../../models/Configuration';

module.exports = class PrefixCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'prefix',
            group: 'manage',
            memberName: 'prefix',
            description: 'Shows or sets the command prefix of the guild.',
            details:
                'If no prefix is provided, the current prefix will be shown. ' +
                'If the prefix is "default", the prefix will be reset to the bot\'s default prefix. ' +
                'Only administrators may change the prefix.\n' +
                'The prefix can be only 2 characters long.',
            format: '[prefix/"default"]',
            examples: ['prefix', 'prefix +', 'prefix default'],
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            throttling: {
                usages: 5,
                duration: 15,
            },
            args: [
                {
                    key: 'prefix',
                    prompt: 'What would you like to set the bot\'s prefix to?',
                    type: 'string',
                    default: '',
                    validate: (value: string) => this.validatePrefix(value),
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        args: { prefix: string },
    ): Promise<Message | Message[]> {
        // Just output the prefix
        if (!args.prefix) {
            return message.say(
                `The command prefix of the guild is \`${message.guild.commandPrefix}\`. ` +
                `To run commands, use ${message.anyUsage('command')}`,
            );
        }

        // In the development mode, the environment value for the prefix is forced
        if (global.LOCAL) {
            return message.reply('this bot does not support changing the command prefix!');
        }

        const defaultPrefix = ConfigurationManager.getDefaultValue('prefix');
        const prefix = args.prefix.toLowerCase();

        if (prefix === 'default') {
            message.guild.commandPrefix = defaultPrefix;

            await Configuration.deleteConfiguration('prefix', message.guild.id);
            ConfigurationManager.get().removeConfiguration('prefix', message.guild.id);

            return message.say(
                `Reset the command prefix of the guild to the default (currently \`${defaultPrefix}\`). ` +
                `To run commands, use ${message.anyUsage('command')}.`,
            );
        }

        message.guild.commandPrefix = prefix;

        await Configuration.setConfiguration('prefix', prefix, message.guild.id);
        ConfigurationManager.get().updateConfiguration('prefix', prefix, message.guild.id);

        return message.say(
            `Set the command prefix of the guild to \`${prefix}\`. ` +
            `To run commands, use ${message.anyUsage('command')}.`,
        );
    }

    /**
     * Validate the argument of the prefix.
     *
     * @param prefix
     */
    protected validatePrefix(prefix: string): boolean {
        // Do not validate the prefix in the development mode as it cannot be changed
        if (global.LOCAL) {
            return true;
        }

        return !prefix.includes(' ') && (prefix.length <= 3 || prefix === 'default');
    }
};
