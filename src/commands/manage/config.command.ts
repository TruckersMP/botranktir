import * as Discord from 'discord.js';
import * as DefaultConfig from '../../../config/config.json';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { ConfigurationManager } from '../../managers/configuration.manager';
import Configuration from '../../models/Configuration';

module.exports = class ConfigCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'config',
            group: 'manage',
            memberName: 'config',
            description: 'Configure the bot. Use the `config` command for more information.',
            examples: [
                'config',
                'config options',
                'config get',
                'config get limit',
                'config set limit 10',
                'config remove limit',
            ],
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['EMBED_LINKS'],
            guildOnly: true,
            throttling: {
                usages: 5,
                duration: 15,
            },
            args: [
                {
                    key: 'action',
                    prompt: 'Action to be taken regarding the configuration of the bot.',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'key',
                    prompt: 'Key of the configuration.',
                    type: 'string',
                    default: '',
                },
                {
                    key: 'value',
                    prompt: 'Value of the configuration.',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        args: { action: string, key: string, value: string },
    ): Promise<Discord.Message | Discord.Message[]> {
        if (!args.action) {
            return message.say(this.createHelp(message.guild.commandPrefix));
        }

        if (args.action === 'options') {
            return this.displayOptions(message);
        }
        if (args.action === 'get') {
            if (args.key === '') {
                return this.getConfigurations(message);
            }
            return this.getConfiguration(message, args.key);
        }
        if (args.action === 'set') {
            return this.setConfiguration(message, args.key, args.value);
        }
        if (args.action === 'remove') {
            return this.removeConfiguration(message, args.key);
        }

        return message.replyEmbed(this.createHelp(message.guild.commandPrefix), 'the action is invalid!');
    }

    /**
     * Display all available configuration options.
     *
     * @param message
     */
    protected async displayOptions(message: CommandoMessage): Promise<Discord.Message | Discord.Message[]> {
        const embed = new Discord.MessageEmbed()
            .setColor(global.BOT_COLOR)
            .setTitle('Configuration Options');

        for (const key in DefaultConfig) {
            const config = ConfigurationManager.getDefaultConfiguration(key);
            if (config.hidden) {
                continue;
            }

            embed.addField(
                `${config.name} (${key})` + (!config.guild ? ' (**BOT**)' : ''),
                config.description + (config.defaultValue ? `\nDefault value: \`${config.defaultValue}\`` : ''),
            );
        }

        return message.say(embed);
    }

    /**
     * Display the configuration value per the key.
     *
     * @param message
     * @param key
     */
    protected async getConfiguration(
        message: CommandoMessage,
        key: string,
    ): Promise<Discord.Message | Discord.Message[]> {
        // Check whether all parameters are provided (so they do not match the default value)
        if (key === '') {
            return message.replyEmbed(this.createHelp(message.guild.commandPrefix), 'no key has been provided!');
        }
        // Check the existence of the configuration
        if (!ConfigurationManager.doesConfigurationExist(key) || ConfigurationManager.isHidden(key)) {
            return message.reply('the configuration of this key could not be found!');
        }

        let value = ConfigurationManager.get().getConfiguration(key);
        if (ConfigurationManager.isGuildOnly(key)) {
            value = ConfigurationManager.get().getConfiguration(key, message.guild.id);
        }

        const embed = new Discord.MessageEmbed()
            .setTitle('Configuration Variable')
            .setColor(global.BOT_COLOR)
            .setDescription(`\`${key}\` is set to ${value}`);

        return message.say(embed);
    }

    /**
     * Display all configurations of the bot and the current guild.
     *
     * @param message
     */
    protected async getConfigurations(message: CommandoMessage): Promise<Discord.Message | Discord.Message[]> {
        const embed = new Discord.MessageEmbed()
            .setTitle('Configuration Values')
            .setColor(global.BOT_COLOR);

        // First, loop through global bot configurations
        ConfigurationManager.get().getGuild().forEach((value: string, key: string) => {
            if (!ConfigurationManager.isHidden(key)) {
                embed.addField(`${key} (**BOT**)`, `\`${value}\``);
            }
        });
        // Then, go through the guild configurations
        ConfigurationManager.get().getGuild(message.guild.id).forEach((value: string, key: string) => {
            if (!ConfigurationManager.isHidden(key)) {
                embed.addField(key, `\`${value}\``);
            }
        });

        // As unmodified configuration values are not stored, let the user know that nothing has been changed
        if (embed.fields.length === 0) {
            embed.setDescription('No configuration values have been modified.');
        }

        return message.say(embed);
    }

    /**
     * Change the configuration value of the key to the provided value.
     *
     * @param message
     * @param key
     * @param value
     */
    protected async setConfiguration(
        message: CommandoMessage,
        key: string,
        value: string,
    ): Promise<Discord.Message | Discord.Message[]> {
        // Check whether all parameters are provided (so they do not match the default value)
        if (key === '') {
            return message.replyEmbed(this.createHelp(message.guild.commandPrefix), 'no key has been provided!');
        }
        if (value === '') {
            return message.replyEmbed(this.createHelp(message.guild.commandPrefix), 'no value has been provided!');
        }
        // Check the existence of the configuration
        if (!ConfigurationManager.doesConfigurationExist(key) || ConfigurationManager.isHidden(key)) {
            return message.reply('the configuration of this key could not be found!');
        }
        // Check whether the user can modify this configuration
        if (!ConfigurationManager.isGuildOnly(key) && !this.client.isOwner(message.author)) {
            return message.reply('you do not have sufficient permissions to change this configuration value!');
        }

        const guild = ConfigurationManager.isGuildOnly(key) ? message.guild.id : null;
        await Configuration.setConfiguration(key, value, guild);
        ConfigurationManager.get().updateConfiguration(key, value, guild);

        const embed = new Discord.MessageEmbed()
            .setTitle('Success')
            .setColor(global.SUCCESS_COLOR)
            .setDescription(`Set \`${key}\` to \`${value}\``);

        return message.say(embed);
    }

    /**
     * Remove the value of the configuration of the provided key.
     *
     * @param message
     * @param key
     */
    protected async removeConfiguration(
        message: CommandoMessage,
        key: string,
    ): Promise<Discord.Message | Discord.Message[]> {
        // Check whether all parameters are provided (so they do not match the default value)
        if (key === '') {
            return message.replyEmbed(this.createHelp(message.guild.commandPrefix), 'no key has been provided!');
        }
        // Check the existence of the configuration
        if (!ConfigurationManager.doesConfigurationExist(key) || ConfigurationManager.isHidden(key)) {
            return message.reply('the configuration of this key could not be found!');
        }
        // Check whether the user can remove the specific configuration
        if (!ConfigurationManager.isGuildOnly(key) && !this.client.isOwner(message.author)) {
            return message.reply('you do not have sufficient permissions to reset this configuration value!');
        }

        const guild = ConfigurationManager.isGuildOnly(key) ? message.guild.id : null;
        if (await Configuration.deleteConfiguration(key, guild) === 0) {
            // If the configuration cannot be removed, try to delete it as a global configuration
            if (!this.client.isOwner(message.author) || await Configuration.deleteConfiguration(key) === 0) {
                return message.reply('the configuration of this key could not be found!');
            }
        }

        ConfigurationManager.get().removeConfiguration(key, guild);

        const embed = new Discord.MessageEmbed()
            .setTitle('Success')
            .setColor(global.SUCCESS_COLOR)
            .setDescription(`Set \`${key}\` to the default value`);

        return message.say(embed);
    }

    /**
     * Create an embed containing help for the command.
     */
    protected createHelp(prefix: string): Discord.MessageEmbed {
        return new Discord.MessageEmbed()
            .setTitle('Configuration')
            .setColor(global.BOT_COLOR)
            .setDescription(
                'Modify changeable configuration variables for this bot.\n\n' +
                `Type \`${prefix}config options\` to view a list of valid configuration variables.\n\n` +
                `To get all set configuration variables:\n\`${prefix}config get\`\n\n` +
                `To get a configuration variable:\n\`${prefix}config get key\`\n\n` +
                `To set a configuration variable:\n\`${prefix}config set key value\`\n\n` +
                `To remove a configuration variable:\n\`${prefix}config remove key\``,
            );
    }
};
