module.exports = class MessageReactionAdd {
    /**
     * MessageReactionAdd class for handling the MESSAGE_REACTION_ADD event.
     *
     * @param   client
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Handle the MESSAGE_REACTION_ADD event.
     * Assign the reaction role to the user after reacting with the required emoji.
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

        return await member.roles.add(role).catch(console.error);
    }
};
