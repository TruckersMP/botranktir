import { Event } from './event';
import { Guild } from 'discord.js';
import { EmojiManager } from '../managers/emoji.manager';

export abstract class EmojiEvent extends Event {
    /**
     * Update the emoji list.
     *
     * @param guild
     */
    protected async updateList(guild: Guild): Promise<void> {
        const emojiList = EmojiManager.getEmojiList(guild);
        if (!emojiList) {
            return;
        }

        const messages = await emojiList.messages.fetch();
        for (const [, message] of messages) {
            message.delete().catch((e) => console.error('deleting a message from the emoji list\n', e));
        }

        emojiList
            .send(EmojiManager.generateList(guild), { split: true })
            .catch((e) => console.error('posting the new emoji list\n', e));
    }

    /**
     * Log an emoji change to the configured channel.
     *
     * @param guild
     * @param message
     */
    protected async logChange(guild: Guild, message: string): Promise<void> {
        const changelog = EmojiManager.getEmojiChangelog(guild);
        if (!changelog) {
            return;
        }

        changelog.send(message).catch((e) => console.error('logging an emoji change\n', e));
    }
}
