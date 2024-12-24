const { Pool } = require("pg");

const norisdb = new Pool({
  user: "postgres",
  host: "185.25.117.64",
  database: "ict",
  password: "noris",
  port: 5432, // PostgreSQL default port
});
const ictmainsite = new Pool({
  user: "noris",
  host: "91.239.235.132",
  // LOCAL
  // host: "localhost",
  // password: "Aa527465182",
  //LOCAL
  database: "ict_main_site",
  password: "Aa527465182",

  port: 5432, // PostgreSQL default port
});
const ict_printers = new Pool({
  user: "noris",
  host: "91.239.235.132",
  // LOCAL
  // host: "localhost",
  // password: "Aa527465182",
  //LOCAL
  database: "ict_printers",
  password: "Aa527465182",

  port: 5432, // PostgreSQL default port
});
const emails_send = new Pool({
  user: "noris",
  host: "91.239.235.132",
  // LOCAL
  // host: "localhost",
  // password: "Aa527465182",
  //LOCAL
  database: "emails_send",
  password: "Aa527465182",

  port: 5432, // PostgreSQL default port
});

module.exports = {
  norisdb,
  ictmainsite,
  ict_printers,
  emails_send
};
