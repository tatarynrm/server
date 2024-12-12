const { pool_emails_send } = require("../../db/pg/email");
const moment = require('moment');
moment.locale('uk');


// async function getTables() {

    
//     try {
//       const query = `
//     SELECT
//     t.tablename AS table_name,
//     obj_description(c.oid, 'pg_class') AS table_comment
    
// FROM
//     pg_tables t
// JOIN
//     pg_class c ON t.tablename = c.relname
// WHERE
//     t.schemaname = 'public';

//       `;


//       const result = await pool_emails_send.query(query);
//       console.log(result.rows);
      
//       return result.rows.map(row => row); // Масив назв таблиць
//     } catch (error) {
//       console.error('Error fetching tables:', error);

//     }
//   }
async function getTables() {
  try {
    // Query to get the table names and their descriptions
    const query = `
      SELECT
        t.tablename AS table_name,
        obj_description(c.oid, 'pg_class') AS table_comment
      FROM
        pg_tables t
      JOIN
        pg_class c ON t.tablename = c.relname
      WHERE
        t.schemaname = 'public'
    `;

    // Fetch the table names and their descriptions
    const result = await pool_emails_send.query(query);
    console.log(result.rows);

    // Loop through each table and count the number of TRUE values in 'issend' and total records
    const tablesWithCounts = [];

    for (let table of result.rows) {
      const tableName = table.table_name;

      // Dynamic SQL to count 'TRUE' values in 'issend'
      const countTrueQuery = `
        SELECT COUNT(*) AS true_count
        FROM public."${tableName}"
        WHERE issend = TRUE
      `;

      // Dynamic SQL to count the total number of rows in the table
      const countTotalQuery = `
        SELECT COUNT(*) AS total_count
        FROM public."${tableName}"
      `;

      // Get the count of TRUE values for the 'issend' column
      const countTrueResult = await pool_emails_send.query(countTrueQuery);
      const trueCount = countTrueResult.rows[0].true_count;

      // Get the total count of rows in the table
      const countTotalResult = await pool_emails_send.query(countTotalQuery);
      const totalCount = countTotalResult.rows[0].total_count;

      // Add the table info along with the true_count and total_count
      tablesWithCounts.push({
        ...table,
        true_count: trueCount,
        total_count: totalCount
      });
    }

    console.log(tablesWithCounts);
    
    return tablesWithCounts; // Return array of tables with true_count and total_count

  } catch (error) {
    console.error('Error fetching tables:', error);
  }
}

  module.exports = { getTables };