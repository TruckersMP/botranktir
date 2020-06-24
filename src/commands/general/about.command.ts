import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import * as packageFile from '../../../package.json';

module.exports = class AboutCommand extends Command {
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

    async run(message: CommandoMessage): Promise<Message | Message[]> {
        let ownerText = '';
        for (const owner of this.client.owners) {
            ownerText += `${owner.username}#${owner.discriminator}\n`;
        }

        const embed = new MessageEmbed()
            .setAuthor('TruckersMP', 'https://truckersmp.com/assets/img/avatar.png')
            .setTitle('Botranktir')
            .setURL('https://github.com/TruckersMP/botranktir')
            .setColor(global.BOT_COLOR)
            .setFooter('Open source bot for reaction roles')
            .addField('Version', packageFile.version, true)
            .addField('Developed by', '[TruckersMP](https://truckersmp.com)', true)
            .addField('Bot\'s Owner', ownerText);

        return message.say(embed);
    }
};
