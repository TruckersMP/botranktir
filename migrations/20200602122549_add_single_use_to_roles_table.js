exports.up = function (knex) {
    return knex.schema.raw('alter table `roles` add column `single_use` tinyint(1) not null default 0 after `emoji_raw`');
};

exports.down = function (knex) {
    return knex.schema.alterTable('roles', function (table) {
        table.dropColumn('single_use');
    });
};
