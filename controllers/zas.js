const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const { GET_ZAS } = require("../queries/OS_ZASOBY");

const getZas = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.oszas where kod_os = '${id}'`
    );
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getZas,
};
