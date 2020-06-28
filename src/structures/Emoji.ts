export default class Emoji {
    /**
     * Snowflake of the emoji. If it is a standard emoji, the raw format is presented.
     */
    id: string;
    /**
     * Identifier of the emoji. If it is a standard emoji, the raw format is presented.
     *
     * Example of an identifier: `truckersmp:579609125831573504`
     */
    identifier: string;

    constructor(public raw: string) {
        this.identifier = raw.replace(/<?a?:?((.*:)?([0-9]+|.*))>?/, '$1');

        // The emoji can also be a unicode symbol (without ID). Therefore, we need some default value
        this.id = this.identifier;
        // Retrieve the ID from the raw format
        const results = /([0-9]{18,20})/.exec(raw);
        if (results && results.length > 1) {
            this.id = results[1];
        }
    }
}
