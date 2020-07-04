export declare global {
    namespace NodeJS {
        interface Global {
            BOT_COLOR: number;
            SUCCESS_COLOR: number;

            LOCAL: boolean;
        }
    }

    export namespace Botranktir {
        interface DefaultConfigEntry {
            name: string;
            description: string;
            defaultValue?: string;
            guild: boolean;
            hidden?: boolean;
        }
    }
}
