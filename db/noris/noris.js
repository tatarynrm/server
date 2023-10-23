const { Pool } = require("pg");

const norisdb = new Pool({
  user: "postgres",
  host: "185.25.117.64",
  database: "ict",
  password: "noris",
  port: 5432, // PostgreSQL default port
});

module.exports = norisdb;



