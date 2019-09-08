const Discord = require('discord.js');

module.exports = class MessageReactionAdd {
    /**
     * MessageReactionAdd class for handling the MESSAGE_REACTION_ADD event.
     *
     * @param   client
     * @param   limits
     */
    constructor(client, limits) {
        this.client = client;
        this.limits = limits;
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

        if (member.user.bot) {
            return;
        }

        if (!this.validate(guild, member)) {
            // Remove the users failed reaction
            const channelInstance = guildInstance.channels.get(channel);
            const messageInstance = await new Discord.Message(this.client, { id: message }, channelInstance).fetch();
            await messageInstance.reactions
                .filter(v => v.emoji.id === emoji || v.emoji.name === emoji)
                .array()[0]
                .users.remove(member);

            return member;
        }
        return await member.roles.add(role).catch(console.error);
    }

    /**
     * Ensure the user has not reached limits
     *
     * @param   {number|string} guild
     * @param   {GuildMember} member
     * @returns {boolean}
     */
    validate(guild, member) {
        if (!this.limits.hasOwnProperty(guild) || !this.limits[guild].hasOwnProperty('rolesPerUser')) {
            return true;
        }

        return (
            member.roles
                .array()
                .map(role => role.id)
                .filter(roleManager.isManagedRole.bind(roleManager)).length <= this.limits[guild].rolesPerUser
        );
    }
};
