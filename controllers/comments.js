const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");
const { ict_managers } = require("../db/noris/noris");

const getCommentsById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await oracledb.getConnection(pool);

    const result = await connection.execute(
      `SELECT a.*,b.PIP FROM ICTDAT.ZAPCOMM a join ictdat.os b on a.kod_os = b.kod where KOD_ZAP = ${id}`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const addZapComment = async (req, res) => {
  const { pKodAuthor, pKodZap, pComment, telegramId } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
           ictdat.p_zap.AddComm(:pKodAuthor, :pKodZap, :pComment,:pKodCom);
        END;`,
      {
        pKodAuthor,
        pKodZap,
        pComment,
        pKodCom: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const setReadComments = async (req, res) => {
  const { pKodAuthor, pKodZap } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.SetReadComm(:pKodAuthor,:pKodZap);
        END;`,
      {
        pKodAuthor,
        pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const deleteCommentById = async (req, res) => {
  const { pKodAutor, pKodComm } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
          ICTDAT.p_zap.DeleteComm(:pKodAutor,:pKodComm);
        END;`,
      {
        pKodAutor,
        pKodComm,
      }
    );

    res.status(200).json(result);
  } catch (error) {}
};
const getCommentsPicture = async (req, res) => {
  const { id } = req.params;

  const connection = await oracledb.getConnection(pool);
  try {
    const userProfileId = await connection.execute(
      `SELECT * from ictdat.zap where KOD = ${id}`
    );

    console.log(userProfileId);
    
    const userPictureResult = await ict_managers.query(
      `select * from user_images where user_id = $1`,
      [userProfileId.rows[0]?.KOD_OS]
    );

  
    res.status(200).json(userPictureResult.rows[0]);


 
  } catch (error) {
    console.log(error);
    
  }
};

module.exports = {
  getCommentsById,
  addZapComment,
  setReadComments,
  deleteCommentById,
  getCommentsPicture
};
