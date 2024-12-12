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




// async function getTables() {
//   try {
//     // Query to get the table names and their descriptions
//     const query = `
//       SELECT
//         t.tablename AS table_name,
//         obj_description(c.oid, 'pg_class') AS table_comment
//       FROM
//         pg_tables t
//       JOIN
//         pg_class c ON t.tablename = c.relname
//       WHERE
//         t.schemaname = 'public'
//     `;

//     // Fetch the table names and their descriptions
//     const result = await pool_emails_send.query(query);
 

//     // Loop through each table and count the number of TRUE values in 'issend' and total records
//     const tablesWithCounts = [];

//     for (let table of result.rows) {
//       const tableName = table.table_name;

//       // Dynamic SQL to count 'TRUE' values in 'issend'
//       const countTrueQuery = `
//         SELECT COUNT(*) AS true_count
//         FROM public."${tableName}"
//         WHERE issend = TRUE
//       `;

//       // Dynamic SQL to count the total number of rows in the table
//       const countTotalQuery = `
//         SELECT COUNT(*) AS total_count
//         FROM public."${tableName}"
//       `;

//       // Get the count of TRUE values for the 'issend' column
//       const countTrueResult = await pool_emails_send.query(countTrueQuery);
//       const trueCount = countTrueResult.rows[0].true_count;

//       // Get the total count of rows in the table
//       const countTotalResult = await pool_emails_send.query(countTotalQuery);
//       const totalCount = countTotalResult.rows[0].total_count;



      
//       // Add the table info along with the true_count and total_count
//       tablesWithCounts.push({
//         ...table,
//         true_count: trueCount,
//         total_count: totalCount
//       });
//     }

//     console.log('TABLESsssssssssssssss',tablesWithCounts);
    
//     return tablesWithCounts; // Return array of tables with true_count and total_count

//   } catch (error) {
//     console.error('Error fetching tables:', error);
//   }
// }



// async function getTables() {
//   try {
//     // Query to get the table names and their descriptions
//     const query = `
//       SELECT
//         t.tablename AS table_name,
//         obj_description(c.oid, 'pg_class') AS table_comment
//       FROM
//         pg_tables t
//       JOIN
//         pg_class c ON t.tablename = c.relname
//       WHERE
//         t.schemaname = 'public'
//     `;

//     // Fetch the table names and their descriptions
//     const result = await pool_emails_send.query(query);

//     const tablesWithCounts = [];

//     for (let table of result.rows) {
//       const tableName = table.table_name;

//       // Check if the 'issend' column exists in the table
//       const columnCheckQuery = `
//         SELECT column_name
//         FROM information_schema.columns
//         WHERE table_name = $1 AND column_name = 'issend'
//       `;

//       const columnCheckResult = await pool_emails_send.query(columnCheckQuery, [tableName]);

//       if (columnCheckResult.rows.length > 0) {
//         // Dynamic SQL to count 'TRUE' values in 'issend'
//         const countTrueQuery = `
//           SELECT COUNT(*) AS true_count
//           FROM public."${tableName}"
//           WHERE issend = TRUE
//         `;

//         // Dynamic SQL to count the total number of rows in the table
//         const countTotalQuery = `
//           SELECT COUNT(*) AS total_count
//           FROM public."${tableName}"
//         `;

//         const countTrueResult = await pool_emails_send.query(countTrueQuery);
//         const trueCount = countTrueResult.rows[0].true_count;

//         const countTotalResult = await pool_emails_send.query(countTotalQuery);
//         const totalCount = countTotalResult.rows[0].total_count;

//         tablesWithCounts.push({
//           ...table,
//           true_count: trueCount,
//           total_count: totalCount,
//         });
//       } else {
//         console.log(`Skipping table ${tableName} as it does not contain the 'issend' column.`);
//       }
//     }

//     console.log("TABLES with counts:", tablesWithCounts);

//     return tablesWithCounts; // Return array of tables with true_count and total_count
//   } catch (error) {
//     console.error("Error fetching tables:", error);
//   }
// }





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

    const tablesWithCounts = [];

    for (let table of result.rows) {
      const tableName = table.table_name;

      // Check if the 'issend' column exists in the table
      const columnCheckQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = 'issend'
      `;

      const columnCheckResult = await pool_emails_send.query(columnCheckQuery, [tableName]);

      if (columnCheckResult.rows.length > 0) {
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

        const countTrueResult = await pool_emails_send.query(countTrueQuery);
        const trueCount = countTrueResult.rows[0].true_count;

        const countTotalResult = await pool_emails_send.query(countTotalQuery);
        const totalCount = countTotalResult.rows[0].total_count;

        // Fetch the send_pause data
        const sendPauseQuery = `
          SELECT is_pause
          FROM send_pause
          WHERE send_id = $1
        `;
        
        const sendPauseResult = await pool_emails_send.query(sendPauseQuery, [tableName]);

        // Default value for is_pause is 0 (not paused)
        const isPaused = sendPauseResult.rows.length > 0 ? sendPauseResult.rows[0].is_pause : 0;

        tablesWithCounts.push({
          ...table,
          true_count: trueCount,
          total_count: totalCount,
          is_pause: isPaused, // Add the 'is_pause' value for this table
        });
      } else {
        console.log(`Skipping table ${tableName} as it does not contain the 'issend' column.`);
      }
    }

    console.log("TABLES with counts and pause status:", tablesWithCounts);

    return tablesWithCounts; // Return array of tables with true_count, total_count, and is_pause
  } catch (error) {
    console.error("Error fetching tables:", error);
  }
}


module.exports = { getTables };