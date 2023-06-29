const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

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
  const { pKodAuthor, pKodZap, pComment } = req.body;

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
    console.log("==============SETREADCOMMENTS==================");
    console.log(result);
    console.log("====================================");
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const deleteCommentById = async (req, res) => {
  const { pKodAutor, pKodComm } = req.body;
  console.log(pKodComm, pKodAutor);
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
module.exports = {
  getCommentsById,
  addZapComment,
  setReadComments,
  deleteCommentById,
};
