import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { ConfigurationManager } from '../../managers/configuration.manager';

module.exports = class JoinCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'join',
            group: 'general',
            memberName: 'join',
            description: 'Get the invite link for the bot.',
            aliases: ['invite'],
            examples: ['join'],
            throttling: {
                usages: 1,
                duration: 30,
            },
        });
    }

    hasPermission(message: CommandoMessage, ownerOverride?: boolean): boolean | string {
        const canBeInvited = ConfigurationManager.get().getConfiguration('invite') === 'true';
        if (!this.client.isOwner(message.author) && (global.LOCAL || !canBeInvited)) {
            return 'this bot cannot be invited!';
        }

        return super.hasPermission(message, ownerOverride);
    }

    async run(message: CommandoMessage): Promise<Message | Message[]> {
        const invite = await this.client.generateInvite([
            'CREATE_INSTANT_INVITE',
            'ADD_REACTIONS',
            'VIEW_CHANNEL',
            'SEND_MESSAGES',
            'MANAGE_MESSAGES',
            'EMBED_LINKS',
            'READ_MESSAGE_HISTORY',
            'USE_EXTERNAL_EMOJIS',
            'CHANGE_NICKNAME',
            'MANAGE_ROLES',
        ]);
        return message.say(`Invite ${this.client.user.username} to your guild: ${invite}`);
    }
};
