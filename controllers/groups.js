const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

const getGroups = async (req, res) => {

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`
    SELECT a.*,b.*,c.TELEGRAMID FROM ICTDAT.OS a 
    LEFT JOIN ICTDAT.US c ON a.kod = c.KOD_OS 
    LEFT JOIN ICTDAT.ZAPGROUPOS b ON a.kod = b.KOD_OS 
    WHERE a.ZVILDAT IS NULL AND a.ISMEN = 1`);
    res.status(200).json(result.rows);
 
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
    getGroups
};
