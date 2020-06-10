exports.up = function (knex) {
    return knex.schema.createTable('configurations', function (table) {
        table.bigIncrements().unsigned();
        table.string('guild', 20).nullable();
        table.string('key', 128).notNullable();
        table.text('value').nullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('configurations');
};
