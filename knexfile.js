const config = require('./config/config');

module.exports = {
    development: {
        client: 'mysql',
        connection: config.database,
        migrations: {
            tableName: 'knex_migrations',
        },
    },

    production: {
        client: 'mysql',
        connection: config.database,
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};
