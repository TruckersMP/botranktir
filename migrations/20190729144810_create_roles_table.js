exports.up = async function (knex) {
    await knex.schema.hasTable('roles').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('roles', function (table) {
                table.bigIncrements().unsigned();
                table.string('channel', 20).notNullable();
                table.string('message', 20).notNullable();
                table.string('emoji', 20).notNullable();
                table.string('role', 20).notNullable();
                table.string('guild', 20).notNullable();
                table.string('emoji_raw', 128).notNullable();
                table.timestamps(true, true);
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('roles');
};
