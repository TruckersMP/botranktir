import { EmojiEvent } from './emoji.event';
import { Client, GuildEmoji } from 'discord.js';

export class EmojiDeleteEvent extends EmojiEvent {
    constructor(
        client: Client,
        protected emoji: GuildEmoji,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        await this.updateList(this.emoji.guild);
        await this.logChange(this.emoji.guild, `🗑️ Deleted \`:${this.emoji.name}:\``);
    }
}
