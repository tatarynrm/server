const { Pool } = require("pg");

const norisdb = new Pool({
  user: "postgres",
  host: "185.25.117.64",
  database: "ict",
  password: "noris",
  port: 5432, // PostgreSQL default port
});
const ictmainsite = new Pool({
  user: "postgres",
  host: "185.25.117.64",
// LOCAL
  // host: "localhost",
  // password: "Aa527465182",
//LOCAL
  database: "ict_main_site",
  password: "noris",

  port: 5432, // PostgreSQL default port
});

module.exports ={
  norisdb,
  ictmainsite
}




