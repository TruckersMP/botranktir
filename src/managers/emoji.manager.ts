import { Guild, GuildEmoji, TextChannel } from 'discord.js';
import { ConfigurationManager } from './configuration.manager';

export class EmojiManager {
    /**
     * Generate list of emojis from the guild.
     *
     * @param guild
     */
    static generateList(guild: Guild): string[] {
        const entries: string[] = [];

        const emojis = guild.emojis.cache.sort(this.sortEmojis);
        for (const [, emoji] of emojis) {
            entries.push(`${emoji} \`:${emoji.name}:\``);
        }

        // As the guild might not have any emojis, we need to make sure that
        // something is getting sent as an empty message is not allowed
        if (entries.length === 0) {
            entries.push('This guild has no emojis.');
        }

        return entries;
    }

    /**
     * Get the guild text channel with the emoji list.
     *
     * @param guild
     */
    static getEmojiList(guild: Guild): TextChannel | null {
        return this.getChannel(guild, 'emoji-list');
    }

    /**
     * Get the guild text channel where the emoji changes should be posted to.
     *
     * @param guild
     */
    static getEmojiChangelog(guild: Guild): TextChannel | null {
        return this.getChannel(guild, 'emoji-changelog');
    }

    /**
     * Get the guild channel from the configuration value.
     *
     * @param guild
     * @param key   Configuration key
     */
    protected static getChannel(guild: Guild, key: string): TextChannel | null {
        const channelId = ConfigurationManager.get().getConfiguration(key, guild.id);
        const channel = guild.channels.resolve(channelId);
        if (!channel || channel.type !== 'text') {
            return null;
        }

        return <TextChannel>channel;
    }

    /**
     * Sort emojis by their name in the ascending order.
     *
     * This method is case insensitive.
     *
     * @param first
     * @param second
     */
    protected static sortEmojis(first: GuildEmoji, second: GuildEmoji): number {
        const firstName = first.name.toLowerCase();
        const secondName = second.name.toLowerCase();

        if (firstName < secondName) {
            return -1;
        }
        if (firstName > secondName) {
            return 1;
        }

        return 0;
    }
}
