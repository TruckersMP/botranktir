export declare global {
    namespace NodeJS {
        interface Global {
            BOT_COLOR: number;
            SUCCESS_COLOR: number;
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
