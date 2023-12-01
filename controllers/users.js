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



// User for admin
const getAllOsManagers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`
    SELECT a.*,a.KOD,b.TELEGRAMID
    FROM ICTDAT.OS a 
    LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
    WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1
    `);
    res.status(200).json(result.rows);
   
  } catch (error) {
    console.log(error);
  }
};
const getAllOsManagersTg = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`
    SELECT a.PIP,a.KOD,a.ISNV,b.TELEGRAMID
    FROM ICTDAT.OS a 
    LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
    WHERE (a.ZVILDAT IS NULL AND a.ISMEN = 1 AND b.TELEGRAMID is not null) or a.PRIZV = 'Драган' or a.PRIZV = 'Боровенко' or a.ISDIR = 1
    `);
    res.status(200).json(result.rows);
   
  } catch (error) {
    console.log(error);
  }
};
const getAllUsersToCloseZap = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`
    SELECT a.PIP,a.KOD,b.TELEGRAMID
    FROM ICTDAT.OS a 
    LEFT JOIN ICTDAT.US b ON a.kod = b.KOD_OS 
    WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1 AND b.TELEGRAMID is not null
    `);
 
    res.status(200).json(result.rows);
   
  } catch (error) {
    console.log(error);
  }
};
const getAllUsersForSite = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(`
    select b.nviddil,
    a.ismen,
    a.isnv,
    a.pipfull as os,
    os_$$pkg.GetTelRob(a.kod) as tel,
    os_$$pkg.GetEMailSl(a.kod) as email
from os a
left join viddil b on b.kod = os_$$pkg.GetKodViddil(a.kod)
where a.zvildat is null
order by decode(a.isdir, 1, 1, 2),
      b.nviddil,
      decode(a.isnv, 1, 1, 2),
      os
    `);
 
    res.status(200).json(result.rows);


  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  getActiveUsers,
  getFiredUsers,
  getAllManagers,
  getAllOsManagers,
  getAllOsManagersTg,
  getAllUsersToCloseZap,
  getAllUsersForSite
};
