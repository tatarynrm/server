const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const { GET_ALL_INTERNAL_DOWNLOADS } = require("../queries/INTERNAL_DOWNLOADS");

const getALLDownloads = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);

    const result = await connection.execute(
      `SELECT * FROM ICTDAT.AAAA_ZAGRYZKY`
    );
    console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
const getDownloadById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.AAAA_ZAGRYZKY where ID = ${id}`
    );
    console.log(result.rows);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

const createDownload = async (req, res) => {
  const { TEXT, KOD_OS, MANAGER } = req.body;
  console.log(TEXT, KOD_OS);
  try {
    const connection = await oracledb.getConnection(pool);
    const sql = `INSERT INTO ICTDAT.AAAA_ZAGRYZKY (TEXT, KOD_OS,MANAGER) VALUES (:TEXT, :KOD_OS,:MANAGER)`;
    const binds = {
      TEXT: TEXT,
      KOD_OS: KOD_OS,
      MANAGER: MANAGER,
    };
    const options = {
      autoCommit: true,
    };
    const result = await connection.execute(sql, binds, options);
    // const result = await connection.execute(
    //   `INSERT INTO ICTDAT.AAAA_ZAGRYZKY
    //   (TEXT, KOD_OS)
    //   VALUES
    //   ('${TEXT}', ${KOD_OS})`
    // );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getALLDownloads,
  getDownloadById,
  createDownload,
};
