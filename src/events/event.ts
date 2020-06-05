import { Client } from 'discord.js';

export abstract class Event {
    constructor(protected client: Client) {
        //
    }

    abstract async handle(): Promise<void>;
}
