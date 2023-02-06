import knex from "knex";

const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_SECRET,
    database: process.env.DB_NAME,
  },
});

export default db;
