const { Pool } = require("pg");


const pool_emails_send = new Pool({
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



module.exports ={
    pool_emails_send
}




