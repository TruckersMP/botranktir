import * as dotenv from 'dotenv';

// Load config variables
const config = dotenv.config({ path: '.env' });
if (config.error) {
    console.error('configuration could not be parsed', config.error);
    process.exit(1);
}

const connection = {
    driver: process.env.DB_DRIVER,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: process.env.DB_CHARSET,
};

module.exports = {
    development: {
        client: 'mysql',
        connection,
        migrations: {
            tableName: 'knex_migrations',
            directory: './database/migrations',
        },
    },

    production: {
        client: 'mysql',
        connection,
        migrations: {
            tableName: 'knex_migrations',
            directory: './database/migrations',
        },
    },
};
