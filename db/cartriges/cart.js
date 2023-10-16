const {Pool} = require('pg')

const cartridge = new Pool({
    // user: 'noris',
    user: 'postgres',
    // host: '192.168.5.180',
    host: '185.25.117.64',
    database: 'ict_cartriges',
    password: 'noris',
    port: 5432, // PostgreSQL default port
  });

  
  module.exports = cartridge;