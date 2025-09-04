const { Pool } = require("pg");

const parkingdb = new Pool({
  user: "noris",
  host: "91.239.235.132",
  database: "ict_managers",
  password: "Aa527465182",
  port: 5432, // PostgreSQL default port
});


module.exports = parkingdb