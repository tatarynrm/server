const pool = require("../db/pool");






async function getLogistProTenders(req,res) {
  
    connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
  
    try {
      // Connect to the PostgreSQL database from the pool
 
    
      // Execute a query
    const   result = await   norisdb.query('SELECT * FROM logist_pro_data');
      
      // Handle the result
     
      res.json(result.rows)
    } catch (err) {
      // Handle errors
      console.error('Database query failed:', err.stack);
    } finally {
      // Release the client back to the pool
      if (client) {
        client.release();
        console.log('Client released back to the pool.');
      }
    }
  }

module.exports = {
    getLogistProTenders,

};
