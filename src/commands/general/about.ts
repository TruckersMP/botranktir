import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import * as packageFile from '../../../package.json';
import * as config from '../../../config/config.json';

export class AboutCommand extends Command {
    /**
     * AboutCommand class for the +about command that prints all information about the bot.
     *
     * @param   {CommandoClient} client
     */
    constructor(client: CommandoClient) {
        super(client, {
            name: 'about',
            group: 'general',
            memberName: 'about',
            description: 'Get all information about the bot.',
            examples: ['about'],
            clientPermissions: ['EMBED_LINKS'],
            throttling: {
                usages: 1,
                duration: 60,
            },
        });
    }

    async run(message: CommandoMessage) {
        let ownerText = '';
        const owners = config.bot.owner;
        for (let i = 0; i < owners.length; i++) {
            const user = this.client.users.resolve(owners[i]);
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
            .setColor(0xc4fcff)
            .setFooter('Open source bot for reaction roles')
            .addField('Version', packageFile.version, true)
            .addField('Developed by', '[TruckersMP](https://truckersmp.com)', true)
            .addField('Bot\'s Owner', ownerText);

        return await message.channel.send(embed);
    }
}
