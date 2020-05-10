import { MessageReaction, Message, GuildMember, User } from 'discord.js';

type ReactionData = {
    reaction: MessageReaction;
    message: Message;
    member: GuildMember;
};

export const fetchReactionData = async (reaction: MessageReaction, user: User): Promise<ReactionData> => {
    if (reaction.partial) {
        reaction = await reaction.fetch();
    }

    let message = reaction.message;
    if (reaction.message.partial) {
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
};
