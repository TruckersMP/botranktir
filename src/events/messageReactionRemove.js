module.exports = class MessageReactionAdd {
    /**
     * MessageReactionRemove class for handling the MESSAGE_REACTION_REMOVE event.
     *
     * @param   client
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Handle the MESSAGE_REACTION_REMOVE event.
     * Remove the reaction role from the user after removing the reaction.
     *
     * @param   {number|string} guild
     * @param   {number|string} channel
     * @param   {number|string} message
     * @param   {number|string} emoji
     * @param   {number|string} user
     * @returns {Promise<GuildMember | void>}
     */
    async handle(guild, channel, message, emoji, user) {
        const role = roleManager.getRole(guild, channel, message, emoji);

        if (!role) {
            return;
        }

        const guildInstance = this.client.guilds.get(guild);
        const member = guildInstance.members.get(user);

        if (member.user.bot) {
            return;
        }

        return await member.roles.remove(role).catch(console.error);
    }
};
