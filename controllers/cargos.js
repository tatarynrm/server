const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const { GET_ALL_CARGOS, GET_ALL_OFFSET } = require("../queries/cargos");

const getAllCargos = async (req, res, myDate) => {
  try {
    const connection = await oracledb.getConnection(pool);

    const result = await connection.execute(
      `SELECT * FROM ICTDAT.ZAY  where dat >= to_date('10.04.2023','dd.mm.yyyy')`
    );
    // console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.os where kod = ${id}`
    );
    // console.log(result.rows);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCargos,
  getUserById,
};
