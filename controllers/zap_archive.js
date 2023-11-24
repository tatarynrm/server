const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");
const axios = require("axios");
const getAllZapArchive = async (req, res) => {

  let connection;
  const { KOD_OS } = req.body;

  try {
    connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `select a.*,b.KOD_OS as menzakr,b.KILAMZAKR as kilammenzark,b.KOD_ZAP as ZAPKOD
      from zap a 
      left join zapzakr b on a.kod = b.kod_zap
      where a.KOD_OS = ${KOD_OS} and b.KOD_OS is not null`
    );

const array = result.rows


const resultArray = [];

for (const obj of array) {
  const existingItem = resultArray.find(item => item.KOD === obj.KOD);

  if (!existingItem) {
    // If no item with the same KOD, create a new entry with an OWN array
    resultArray.push({ KOD:obj.KOD, OWN: [{ MENZAKR: obj.MENZAKR, COUNT: obj.KILAMMENZARK }] });
  } else {
    // If there is an item with the same KOD, push RES and HELP values into the OWN array
    existingItem.OWN.push({ MENZAKR: obj.MENZAKR, COUNT: obj.KILAMMENZARK });
  }
}

console.log(resultArray);


// const arrayOfObjects = [
//   { KOD: 5555, RES: 1, HELP: 3 },
//   { KOD: 5555, RES: 1, HELP: 3 },
//   { KOD: 5555, RES: 1, HELP: 3 },
//   { KOD: 5575, RES: 1, HELP: 3 },
//   { KOD: 5555, RES: 1, HELP: 3 }
// ];

// const resultArray = [];

// for (const obj of arrayOfObjects) {
//   const existingItem = resultArray.find(item => item.KOD === obj.KOD);

//   if (!existingItem) {
//     // If no item with the same KOD, create a new entry with an OWN array
//     resultArray.push({ KOD: obj.KOD, OWN: [{ RES: obj.RES, HELP: obj.HELP }] });
//   } else {
//     // If there is an item with the same KOD, push RES and HELP values into the OWN array
//     existingItem.OWN.push({ RES: obj.RES, HELP: obj.HELP });
//   }
// }

// console.log(resultArray);






  res.status(200).json(array);















  } catch (error) {
    console.log("1---", error);
  } finally {
    if (connection) {
      try {
        // Close the Oracle database connection
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
  }
};


module.exports = {

  getAllZapArchive

}