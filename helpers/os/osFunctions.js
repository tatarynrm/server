const OracleDB = require("oracledb");
const pool = require("../../db/pool");

const getOsPIP = async (data)=>{
    try {
      const connection = await OracleDB.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const result = await connection.execute(`select * from os where KOD = ${data}`);
      const name = await result.rows[0].PIP
      return await name
    } catch (error) {
      console.log(error);
    }
  }

  module.exports = {
    getOsPIP
  }