const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

const getEvents = async (req, res) => {
  const { KOD_OS } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`select *
    from
      (
      select *
      from ictdat.v_zapevent
      where kod_osto = ${KOD_OS}
      order by dat desc
      )
    where rownum <= 1000`);
    res.status(200).json(result.rows);
 
  } catch (error) {
    console.log(error);
  }
};

const createMessAll = async (req,res) =>{
  const {pKodAutor,pMess} = req.body;
  console.log(req.body);
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.AddMessAll(:pKodAutor,:pMess);
        END;`,
      {
        pKodAutor,
        pMess,
      })
      res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
}
const createMessOs = async (req,res) =>{
  const {pKodAutor,pMess} = req.body;
  console.log(req.body);
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.AddMessAll(:pKodAutor,:pMess);
        END;`,
      {
        pKodAutor,
        pMess,
      })
      res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
}
const getAllMess = async (req,res) =>{
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from (SELECT a.*,b.PIP FROM ICTDAT.ZAPMESS a JOIN ICTDAT.OS b on b.KOD = a.KOD_OS order by dat desc) where rownum <= 1000`
    )
      res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
}
const getMessOs = async (req,res)=>{
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from (SELECT a.*,b.PIP FROM ICTDAT.ZAPMESS a JOIN ICTDAT.OS b on b.KOD = a.KOD_OS order by dat desc) where rownum <= 1000`
    )
      res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
}
const getGoogleMeetLink = async (req,res)=>{
  const {KOD_OS} = req.body
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select a.GOOGLEMEET  from ictdat.us a where a.KOD_OS = ${KOD_OS}`
    )
      res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    getEvents,
    createMessAll,
    getAllMess,
    getGoogleMeetLink
};
