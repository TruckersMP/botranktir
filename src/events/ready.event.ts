import { Event } from './event';
import { ClientManager } from '../managers/client.manager';

/**
 * Handle the READY event.
 *
 * Setup things for the bot.
 */
export class ReadyEvent extends Event {
    async handle(): Promise<void> {
        await ClientManager.get().onReady();

        console.log('bot has been successfully loaded');
    }
}
