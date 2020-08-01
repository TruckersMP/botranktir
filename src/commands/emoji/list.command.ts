import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { ConfigurationManager } from '../../managers/configuration.manager';
import { EmojiManager } from '../../managers/emoji.manager';
import { PermissionsManager } from '../../managers/permission.manager';

module.exports = class EmojiListCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'emojilist',
            group: 'emoji',
            memberName: 'emojilist',
            description: 'Generate a list of emojis to the configured channel.',
            examples: ['emojilist'],
            aliases: ['emoji-list'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10,
            },
        });
    }

    hasPermission(message: CommandoMessage, ownerOverride?: boolean): boolean | string {
        if (PermissionsManager.isGuildManager(message.member)) {
            return true;
        }

        return super.hasPermission(message, ownerOverride);
    }

    async run(message: CommandoMessage): Promise<Message | Message[]> {
        if (!ConfigurationManager.get().isConfigurationModified('emoji-list', message.guild.id)) {
            return message.reply('the emoji list is not configured!');
        }

        const emojiList = EmojiManager.getEmojiList(message.guild);
        if (!emojiList) {
            return message.reply('the configured emoji list is not valid!');
        }

        const messages = await emojiList.messages.fetch();
        for (const [, listMessage] of messages) {
            listMessage.delete().catch((e) => console.error('deleting a message from the emoji list\n', e));
        }

        return emojiList
            .send(EmojiManager.generateList(message.guild), { split: true })
            .catch(() => message.reply('I could not post the emoji list to the configured channel.'))
            .then(() => message.say('The emoji list has been successfully generated!'));
    }
};
