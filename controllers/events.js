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
      from v_zapevent
      where kod_osto = ${KOD_OS}
      order by dat desc
      )
    where rownum <= 10`);

console.log(result);
    res.status(200).json(user);
 
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
    getEvents
};
