const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

const getAllZap = async (req, res) => {
  const { KOD_OS } = req.body;
  console.log("----getAllZap--", KOD_OS);
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,
              b.pip,
              c.TELEGRAMID,
              p_zap.CountComm(a.kod) as countcomm,
              p_zap.CountNewComm(${KOD_OS}, a.kod) as countnewcomm,
              p_zap.CountMyComm(${KOD_OS}, a.kod) as countmycomm,
              p_zap.IsNewZap(${KOD_OS}, a.kod) as isnew,
              p_zap.IsMemberGroup(${KOD_OS}, a.kod_group, 0) as ismember,
              p_zap.IsGroupAdm(${KOD_OS}, a.kod_group, 0) as isadm
       FROM zap a
       JOIN OS b on a.kod_os = b.kod
       JOIN US c on a.kod_os = c.kod_os
       WHERE a.status = 0`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};
const getClosedZap = async (req, res) => {
  const { KOD_OS } = req.body;
  console.log("----getAllZap--", KOD_OS);
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,
              b.pip,
              p_zap.CountComm(a.kod) as countcomm,
              p_zap.CountNewComm(${KOD_OS}, a.kod) as countnewcomm,
              p_zap.IsNewZap(${KOD_OS}, a.kod) as isnew
       FROM zap a
       JOIN OS b on a.kod_os = b.kod
       WHERE a.status = 1`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};

const getGroups = async (req, res) => {
  const { NGROUP, KOD, DATCLOSE, KOD_AUTHOR, kod } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(`select a.*,
                                            ictdat.p_zap.CountNewZap(${kod} ,a.kod) as countnewzap
                                            from ictdat.zapgroup a`);
    // const result = await connection.execute(`select *
    //                                         from ictdat.zapgroup a`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
const createZap = async (req, res) => {
  const { pKodAuthor, pKodGroup, pZav, pRozv, pZapText } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.AddZap(:pKodAuthor, :pKodGroup, :pZav,:pRozv,
                :pZapText,:pKodZap);
        END;`,
      {
        pKodAuthor,
        pKodGroup,
        pZav,
        pRozv,
        pZapText,
        pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

// Змінюємо статус заявки
const deleteZap = async (req, res) => {
  const { pKodAuthor, pKodZap, pStatus } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.SetStatusZap(:pKodAuthor,:pKodZap,:pStatus);
        END;`,
      {
        pKodAuthor,
        pStatus,
        pKodZap,
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const editZap = async (req, res) => {
  const { pKodAuthor, pKodZap, pZav, pRozv, pZapText } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.EditZap(:pKodAuthor,:pKodZap,:pZav,:pRozv,:pZapText);
        END;`,
      {
        pKodAuthor,
        pKodZap,
        pZav,
        pRozv,
        pZapText,
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const refreshZap = async (req, res) => {
  const { pKodAuthor, pKodZap } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.UpdateTimeZap(:pKodAuthor,:pKodZap);
        END;`,
      {
        pKodAuthor,
        pKodZap,
      }
    );
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};


const getAllTimeZap = async (req, res) => {
  const {todayDate} = req.body;
  console.log(todayDate);
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,b.pip
       FROM zap a
       JOIN os b on a.kod_os = b.kod
       WHERE  dat >= to_date('${todayDate}','yyyy-mm-dd')`
    );
    // console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};
module.exports = {
  createZap,
  getAllZap,
  getGroups,
  deleteZap,
  getClosedZap,
  refreshZap,
  editZap,
  getAllTimeZap
};
