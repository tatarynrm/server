const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");
const axios = require("axios");
// const getAllZapArchive = async (req, res) => {
//   let connection;
//   const { KOD_OS } = req.body;

//   try {
//     connection = await oracledb.getConnection(pool);
//     connection.currentSchema = "ICTDAT";
//     const result = await connection.execute(
//       `select a.*,b.KOD_OS as menzakr,b.KILAMZAKR as kilammenzark,b.KOD_ZAP as ZAPKOD,c.PIP as MANAGERPIPCLOSE,
//       b.suma,b.kod_valut,c.idv as valuta_name
//       from zap a 
//       left join zapzakr b on a.kod = b.kod_zap
//       left join os c on b.KOD_OS = c.KOD
//       left join valut c on b.kod_valut = c.kod
//       where a.KOD_OS = ${KOD_OS} and b.KOD_OS is not null`
//     );
  
//     const array = result.rows;

//     const resultArray = [];

//     for (const obj of array) {
//       const existingItem = resultArray.find((item) => item.KOD === obj.KOD);


//       if (!existingItem) {
//         // If no item with the same KOD, create a new entry with an OWN array
//         resultArray.push({
//           ZAPNUM: obj.ZAPNUM,
//           KOD: obj.KOD,
//           ZAV: obj.ZAV,
//           ROZV: obj.ROZV,
//           DAT: obj.DAT,
      
       

//           CLOSEMANAGER: [
//             { MENZAKR: obj.MANAGERPIPCLOSE, COUNT: obj.KILAMMENZARK ,   VALUTA_IDV:obj.VALUTA_NAME,    SUMA:obj.SUMA,},
//           ],
//         });
//       } else {
//         // If there is an item with the same KOD, push RES and HELP values into the OWN array
//         existingItem.CLOSEMANAGER.push({
//           MENZAKR: obj.MANAGERPIPCLOSE,
//           COUNT: obj.KILAMMENZARK,
//         });
//       }
//     }

//     // console.log(resultArray);
//     // const all  = resultArray.map(item => item.CLOSEMANAGER)
//     // console.log(all);

//     res.status(200).json(resultArray);
//   } catch (error) {
//     console.log("1---", error);
//   } finally {
//     if (connection) {
//       try {
//         // Close the Oracle database connection
//         await connection.close();
//         console.log("Connection closed successfully.");
//       } catch (error) {
//         console.error("Error closing connection: ", error);
//       }
//     }
//   }
// };

const getAllZapArchive = async (req, res) => {
  let connection;
  const { KOD_OS, managerSurname, ZAV, ROZV, page = 1, limit = 100 } = req.body;

  console.log('REQQ BODY', req.body);

  // Розраховуємо offset для пагінації
  const offset = (page - 1) * limit;

  try {
    connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";

    // Формуємо умови фільтрації
    let filters = [];
    if (KOD_OS) filters.push(`a.KOD_OS = ${KOD_OS}`);
    if (managerSurname) filters.push(`UPPER(c.PIP) LIKE UPPER('%${managerSurname}%')`);  // Порівнюємо без урахування регістру
    if (ZAV) filters.push(`UPPER(a.ZAV) LIKE UPPER('%${ZAV}%')`); // Порівнюємо без урахування регістру для завантаження
    if (ROZV) filters.push(`UPPER(a.ROZV) LIKE UPPER('%${ROZV}%')`); // Порівнюємо без урахування регістру для розвантаження


    // Об'єднуємо всі фільтри в одну частину запиту
    const filterClause = filters.length > 0 ? 'AND ' + filters.join(' AND ') : '';

    // Виконуємо запит з пагінацією та фільтрацією, використовуючи ROWNUM
    const result = await connection.execute(
      `SELECT * FROM (
          SELECT a.*, b.KOD_OS AS menzakr, b.KILAMZAKR AS kilammenzark, b.KOD_ZAP AS ZAPKOD, 
                 c.PIP AS MANAGERPIPCLOSE, b.suma, b.kod_valut, d.idv AS valuta_name,
                 ROWNUM AS rn
          FROM zap a
          LEFT JOIN zapzakr b ON a.kod = b.kod_zap
          LEFT JOIN os c ON b.KOD_OS = c.KOD
          LEFT JOIN valut d ON b.kod_valut = d.kod
          WHERE 1=1 ${filterClause}
          AND b.KOD_OS IS NOT NULL
        ) 
        WHERE rn > ${offset} AND rn <= ${offset + limit}`
    );

    const array = result.rows;

    const resultArray = [];

    for (const obj of array) {
      const existingItem = resultArray.find((item) => item.KOD === obj.KOD);

      if (!existingItem) {
        resultArray.push({
          ZAPNUM: obj.ZAPNUM,
          KOD: obj.KOD,
          ZAV: obj.ZAV,
          ROZV: obj.ROZV,
          DAT: obj.DAT,
          CLOSEMANAGER: [
            { MENZAKR: obj.MANAGERPIPCLOSE, COUNT: obj.KILAMMENZARK, VALUTA_IDV: obj.VALUTA_NAME, SUMA: obj.SUMA }
          ]
        });
      } else {
        existingItem.CLOSEMANAGER.push({
          MENZAKR: obj.MANAGERPIPCLOSE,
          COUNT: obj.KILAMMENZARK
        });
      }
    }

    console.log(resultArray);
    res.status(200).json(resultArray);
  } catch (error) {
    console.log("1---", error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
  }
};




module.exports = {
  getAllZapArchive,
};
