const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const {
  GET_ALL_USERS,
  GET_ALL_ACTIVE_USERS,
  GET_ALL_FIRED_USERS,
} = require("../queries/user");
// const { sendBuhTransport } = require("../index");

const getAllUsers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(GET_ALL_USERS);
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getActiveUsers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(GET_ALL_ACTIVE_USERS);
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getFiredUsers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(GET_ALL_FIRED_USERS);
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllManagers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`
    SELECT a.PIP,a.KOD,b.TELEGRAMID
    FROM ICTDAT.OS a 
    LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
    WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1
    `);
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
      // `SELECT * FROM ICTDAT.OS  a, ICTDAT.US  b,ICTDAT.OSMAIL c,ICTDAT.OSTEL d where a.kod = ${id}`
    );

    console.log("====================================");
    console.log(result.rows);
    console.log("====================================");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  getActiveUsers,
  getFiredUsers,
  getAllManagers
};
