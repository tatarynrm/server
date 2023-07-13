// Контрагенти (Замовники/Перевізники)
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const {
  GET_ALL_USERS,
  GET_ALL_ACTIVE_USERS,
  GET_ALL_FIRED_USERS,
} = require("../queries/user");

const getAllСarriers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISPOSTACH = 1
      FETCH FIRST 100 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllCustomers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISCLIENT = 1
      FETCH FIRST 5 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllExpeditions = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISEXP = 1
      FETCH FIRST 5 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getContrAgents = async (req, res) => {
  const { search } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE NDOV LIKE '${search}%'
      OR NDOV LIKE '$${search}'
      OR NDOV LIKE '${search}'
      OR ZKPO LIKE '${search}'
      OR ZKPO LIKE '${search}$'
      OR ZKPO LIKE '$${search}'
      OR UPPER( NDOV ) LIKE '${search}%'
      OR UPPER( NDOV ) LIKE '%${search}_%'
      OR UPPER( NDOV ) LIKE '% ${search}'
      OR UPPER( NDOV ) LIKE '%${search} %'
      OR LOWER( NDOV ) LIKE '${search}%'
      OR LOWER( NDOV ) LIKE '%${search} %'
      OR LOWER( NDOV ) LIKE '%_${search}'
      OR LOWER( NDOV ) LIKE '%${search} %'
      OR NDOV LIKE '%_${search}_%'
      OR NDOV LIKE '${search}_%'
      OR NDOV LIKE '%_${search}'
      OR NDOV LIKE '_${search}'
      OR NDOV LIKE '_${search}_'
      OR NDOV LIKE '${search}_'
      OR NDOV LIKE '${search}_%'
      `
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getOneAgent = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `      SELECT  a.*,
      b.*,c.*,u.*
  FROM ictdat.ur a 
  JOIN ictdat.dog b ON
      a.kod = b.kod_ur
  JOIN ICTDAT.FIRMA c ON b.KOD_FIRMA  = c.KOD 
  JOIN ICTDAT.URSTATUS u ON a.KOD_STATUS = u.KOD
      WHERE a.kod = ${id}
      `
    );
    console.log(result.rows);
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCustomers,
  getAllExpeditions,
  getAllСarriers,
  getContrAgents,
  getOneAgent
};
