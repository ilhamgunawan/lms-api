/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_login_data', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('user_account');
    table.string('user_name', 20).unique().notNullable();
    table.string('psw_hash').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('user_login_data');
};
