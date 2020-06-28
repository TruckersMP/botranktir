import { EmojiEvent } from './emoji.event';
import { Client, GuildEmoji } from 'discord.js';

export class EmojiUpdateEvent extends EmojiEvent {
    constructor(
        client: Client,
        protected oldEmoji: GuildEmoji,
        protected newEmoji: GuildEmoji,
    ) {
        super(client);
    }

    async handle(): Promise<void> {
        // Ignore the changes if the name is still same (some internal stuff?)
        if (this.oldEmoji.name === this.newEmoji.name) {
            return;
        }

        await this.updateList(this.newEmoji.guild);
        await this.logChange(
            this.newEmoji.guild,
            `✏️ Updated ${this.newEmoji}, renamed from \`:${this.oldEmoji.name}:\` to \`:${this.newEmoji.name}:\``,
        );
    }
}
