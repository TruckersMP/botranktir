import * as semver from 'semver';
import * as Package from '../../../package.json';
import { BotDeveloper, ClientManager } from '../../managers/client.manager';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { Octokit } from '@octokit/rest';

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

        const developedBy = ClientManager.get()
            .getDevelopers()
            .map((developer: BotDeveloper) => `[${developer.name}](${developer.link})`)
            .join('\n');

        const embed = new MessageEmbed()
            .setAuthor('TruckersMP', 'https://truckersmp.com/assets/img/avatar.png')
            .setTitle('Botranktir')
            .setURL('https://github.com/TruckersMP/botranktir')
            .setColor(global.BOT_COLOR)
            .setFooter('Open source bot for reaction roles')
            .addField('Version', this.getCurrentVersion(), true)
            .addField('Developed by', developedBy, true)
            .addField('Bot\'s Owner', ownerText);

        const latestVersion = await this.getLatestVersion();
        if (semver.gt(latestVersion, this.getCurrentVersion())) {
            embed.addField('Newer Version Available', latestVersion);
        }

        return message.say(embed);
    }

    /**
     * Get the current version of the bot from the package file.
     */
    protected getCurrentVersion(): string {
        return Package.version.replace('v', '');
    }

    /**
     * Get the latest version of the bot from Github.
     */
    protected async getLatestVersion(): Promise<string> {
        const octokit = new Octokit();

        return octokit.repos
            .getLatestRelease({
                owner: 'TruckersMP',
                repo: 'botranktir',
            })
            .then((release) => release.data.name.replace('v', ''))
            .catch(() => this.getCurrentVersion());
    }
};
