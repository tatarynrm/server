const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const pool = require("../db/pool");

const getAllMessages = async (req, res) => {
  const { SENDER, RECEIVER } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);

    const result = await connection.execute(
      `SELECT * FROM ICTDAT.AAAA_MESSAGES WHERE SENDER = ${SENDER} AND RECEIVER = ${RECEIVER}`
    );
    console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const createMessage = async (req, res) => {
  const { MESSAGE, SENDER, RECEIVER } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const sql = `INSERT INTO ICTDAT.AAAA_MESSAGES ( MESSAGE,SENDER,RECEIVER) VALUES (:MESSAGE,:SENDER,:RECEIVER)`;
    const binds = {
      MESSAGE: MESSAGE,
      SENDER: SENDER,
      RECEIVER: RECEIVER,
    };
    const options = {
      autoCommit: true,
    };
    const result = await connection.execute(sql, binds, options);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  createMessage,
  getAllMessages,
};
