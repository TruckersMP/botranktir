import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, Util } from 'discord.js';

module.exports = class HelpCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'help',
            group: 'general',
            memberName: 'help',
            description: 'Displays a list of available commands, or detailed information for a specified command.',
            examples: ['help', 'help about'],
            args: [
                {
                    key: 'command',
                    prompt: 'For which command help information should be for.',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }

    async run(
        message: CommandoMessage,
        args: { command: string },
    ): Promise<Message | Message[]> {
        const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix;
        const commands = this.client.registry.commands.clone().sort(this.sortCommands);
        // As message.message is not working, we need to cast the object instead to get that value
        const msg = <Message><unknown>message;
        // Determine whether the member is an administrator. Works only in guilds
        const isAdministrator = message.member && message.member.hasPermission(['ADMINISTRATOR'], { checkOwner: true });

        // Display help for all commands
        if (args.command === '') {
            let activeCategory: string;
            const text: string[] = [];

            text.push('= Command List = \n');
            text.push(`*You can use ${prefix}help [command] to get more information about each command.*`);
            if (!message.guild) {
                text.push('*Some commands might be missing. To get more information, use this command in a guild.*');
            }
            text.push('');

            commands.forEach((command: Command) => {
                if (!command.isUsable(msg) || (command.hidden && !this.client.isOwner(message.author))) {
                    return;
                }

                if (command.group.id !== activeCategory) {
                    activeCategory = command.group.id;
                    text.push(`[${command.group.name}]`);
                }

                text.push(`   ${prefix}${command.name} - ${Util.cleanContent(command.description, msg)}`);
            });

            return message.say(text, { code: 'asciidoc', split: true });
        }

        const command = commands.get(args.command);
        if (command && command.isUsable(msg) && (!command.hidden || this.client.isOwner(message.author))) {
            const text = [
                `__**Group:**__ ${command.group.name} (\`${command.groupID}\`)`,
                `__**Command:**__ ${command.name}`,
                `${command.description}`,
            ];

            if (command.details) {
                text.push(command.details);
            }
            text.push('');

            if (command.examples && command.examples.length > 0) {
                text.push(`**Examples:** ${command.examples.join(', ')}`);
            }
            if (command.aliases && command.aliases.length > 0) {
                text.push(`**Aliases:** ${command.aliases.join(', ')}`);
            }

            const throttling = command.throttling;
            if (throttling) {
                if (throttling.usages > 1) {
                    text.push(`**Throttling:** ${throttling.duration} seconds (${throttling.usages} usages)`);
                } else {
                    text.push(`**Throttling:** ${throttling.duration} seconds`);
                }
            }

            const userPermissions = command.userPermissions;
            if (userPermissions && userPermissions.length > 0 && isAdministrator) {
                text.push(`**User permissions:** \`${userPermissions.join('`, `')}\``);
            }

            const clientPermissions = command.clientPermissions;
            if (clientPermissions && clientPermissions.length > 0 && isAdministrator) {
                const permissionEmoji = message.guild.me.hasPermission(clientPermissions) ? '✅' : '❌';
                text.push(`**Required permissions:** \`${clientPermissions.join('`, `')}\` (${permissionEmoji})`);
            }

            if (command.nsfw) {
                text.push('*This command can be used in NSFW channels only.*');
            }
            if (command.guildOnly) {
                text.push('*This command can be used only in a server.*');
            }
            if (command.ownerOnly) {
                text.push('*Only the bot owners can use this command.*');
            }

            return message.say(text);
        }

        return message.say(`Unable to identify command. Use \`${prefix}help\` to view the list of all commands.`);
    }

    /**
     * Sort the commands alphabetically by the group name, and the command name.
     *
     * @param first
     * @param second
     */
    protected sortCommands(first: Command, second: Command): number {
        // Sort by the category
        if (first.group.name < second.group.name) {
            return -1;
        }
        if (first.group.name > second.group.name) {
            return 1;
        }

        // If category is the same, sort by the name
        if (first.name < second.name) {
            return -1;
        }
        if (first.name > second.name) {
            return 1;
        }

        return 0;
    }
};
