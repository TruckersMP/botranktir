const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const packageFile = require('../../../package.json');
const config = require('../../../config/config.json');

module.exports = class AboutCommand extends Command {
    /**
     * AboutCommand class for the +about command that prints all information about the bot.
     *
     * @param   {CommandoClient} client
     */
    constructor(client) {
        super(client, {
            name: 'about',
            group: 'general',
            memberName: 'about',
            description: 'Get all information about the bot.',
            examples: ['about'],
            throttling: {
                usages: 1,
                duration: 60
            }
        });
    }

    async run(message) {
        let ownerText = ``;
        let owners = config.bot.owner;
        // If only an ID is presented, make the owner as an array for an easier work
        // (since we expect the owner to be an array with owners)
        if (!Array.isArray(owners)) {
            owners = [config.bot.owner];
        }
        for (let i = 0; i < owners.length; i++) {
            let user = this.client.users.get(owners[i]);
            if (user) {
                ownerText += `${user.username}#${user.discriminator}\n`;
            } else {
                ownerText += `<@${owners[i]}>\n`;
            }
        }

        const embed = new MessageEmbed()
            .setAuthor('TruckersMP', 'https://truckersmp.com/assets/img/avatar.png')
            .setTitle('Botranktir')
            .setURL('https://github.com/TruckersMP/botranktir')
            .setColor(0xC4FCFF)
            .setFooter('Open source bot for reaction roles')
            .addField('Version', packageFile.version, true)
            .addField('Developed by', '[TruckersMP](https://truckersmp.com)', true)
            .addField('Owner', ownerText);

        return await message.channel.send(embed);
    }
};
