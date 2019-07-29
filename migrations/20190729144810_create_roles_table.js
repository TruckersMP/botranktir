exports.up = async function (knex) {
    await knex.schema.hasTable('roles').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('roles', function (table) {
                table.bigIncrements().unsigned();
                table.string('channel', 20);
                table.string('message', 20);
                table.string('emoji', 20);
                table.string('role', 20);
                table.string('guild', 20);
                table.string('emoji_raw', 128);
                table.timestamps(true, true);
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('roles');
};
