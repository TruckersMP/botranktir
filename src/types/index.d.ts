import * as Knex from 'knex';
import { RoleManager } from '../lib/RoleManager';

declare global {
    namespace NodeJS {
        interface Global {
            roleManager: RoleManager;
        }
    }

    namespace Botranktir {
        interface Config {
            bot: BotConfig;
            defaultCommands: CommandConfig;
            database:
                | string
                | Knex.ConnectionConfig
                | Knex.MariaSqlConnectionConfig
                | Knex.MySqlConnectionConfig
                | Knex.MsSqlConnectionConfig
                | Knex.OracleDbConnectionConfig
                | Knex.Sqlite3ConnectionConfig
                | Knex.SocketConnectionConfig;
            limits: LimitsMap;
        }

        interface BotConfig {
            token: string;
            prefix: string;
            owner: string[];
            messageCache: number;
        }

        interface CommandConfig {
            commandState: boolean;
            unknownCommand: boolean;
            eval: boolean;
        }

        interface LimitsConfig {
            rolesPerUser: number;
        }

        type LimitsMap = { [key: string]: LimitsConfig };
    }
}

declare module 'knex/types/result' {
    interface Role {
        Count: number;
    }
}
