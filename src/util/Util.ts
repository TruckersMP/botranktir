import { EmbedFieldData, MessageEmbed, MessageEmbedOptions, Util as BaseUtil } from 'discord.js';

interface EmbedSplitOptions {
    count?: number;
}

/**
 * Extend the base Util class of Discord.JS with useful utils.
 */
export class Util extends BaseUtil {
    /**
     * Split fields into multiple embeds to respect Discord limits.
     *
     * @param options
     * @param fields
     * @param splitOptions
     */
    static createEmbeds(
        options: MessageEmbedOptions,
        fields: EmbedFieldData[],
        splitOptions: EmbedSplitOptions = {},
    ): MessageEmbed[] {
        const embeds: MessageEmbed[] = [];

        // Loop through all fields. Thanks to the splice method, the length
        // will be lower in each iteration
        while (fields.length !== 0) {
            const embed = new MessageEmbed(options);
            // Reset the title as it will be set only to the first embed later
            embed.setTitle('');

            embed.addFields(fields.splice(0, splitOptions.count || 25));
            embeds.push(embed);
        }

        // Set the title only for the first embed
        if (embeds.length !== 0) {
            embeds[0].setTitle(options.title);
        }

        return embeds;
    }
}
