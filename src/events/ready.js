const Role = require('../models/Role');

module.exports = class Ready {
    /**
     * Ready class for handling the READY event.
     *
     * @param   client
     * @param   {Array} config
     */
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }

    /**
     * Handle the READY event.
     * Setup things for the bot.
     */
    async handle() {
        await this.client.user.setActivity('TruckersMP', {
            url: 'https://truckersmp.com',
            type: 'PLAYING',
        }).catch(console.error);

        // Load global libraries with managers
        const RoleManager = require('../lib/RoleManager.js');
        global['roleManager'] = new RoleManager(this.client);

        // Load all emojis to the client so on every reaction the bot does not have to connect to the database
        this.client.roles = {};
        this.client.guilds.each(async guild => {
            this.client.roles[guild.id] = {};

            const roles = await Role.query().where('guild', guild.id);
            roleManager.fetchRoles(guild.id, roles);
        });
    }
};
