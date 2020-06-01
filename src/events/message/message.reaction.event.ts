import { Client, GuildMember, Message, MessageReaction, User } from 'discord.js';
import { Event } from '../event';

type ReactionData = {
    reaction: MessageReaction;
    message: Message;
    member: GuildMember;
};

export abstract class MessageReactionEvent extends Event {
    constructor(
        client: Client,
        protected reaction: MessageReaction,
        protected user: User,
    ) {
        super(client);
    }

    /**
     * Fetch necessary data in case they are partial.
     *
     * Learn more about partials here: https://discordjs.guide/popular-topics/partials.html
     *
     * @param reaction
     * @param user
     */
    protected async fetchData(reaction: MessageReaction, user: User): Promise<ReactionData> {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }

        let message = reaction.message;
        if (message.partial) {
            message = await reaction.message.fetch();
        }

        if (user.partial) {
            user = await user.fetch();
        }
        // Convert user to GuildMember
        const member: GuildMember = message.guild.members.resolve(user);

        return {
            reaction,
            message,
            member,
        };
    }
}
