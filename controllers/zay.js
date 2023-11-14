const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

const getAllZay = async (req, res) => {
  const { KOD_OS,REC_START,REC_END } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `select b.datzav as datzav,
      p_utils.AddStr(', ', a.punktz, decode(a.kod_krainaz, p_base.GetKodKraina, d1.nobl, c1.idd)) as zav,
      p_utils.AddStr(', ', a.punktr, decode(a.kod_krainar, p_base.GetKodKraina, d2.nobl, c2.idd)) as rozv,
      e1.nur as zam,
      e2.nur as per,
      f1.pip as menz,
      f2.pip as menp,
      a.am,
      a.pr,
      a.vod1,
      a.vod1tel
from
 (select rownum as recnum, 
         t.*
  from
   (
   select b.kod_zay
   from zay a
   join zaylst b on a.kod = b.kod_zay
   where a.kod_zaym is null and
         a.datprov is not null and
         (b.kod_menz = ${KOD_OS} or b.kod_menp = ${KOD_OS})
   order by b.datzav desc
   ) t
 ) t
join zay a on t.kod_zay = a.kod
join zaylst b on t.kod_zay = b.kod_zay
left join kraina c1 on a.kod_krainaz = c1.kod
left join kraina c2 on a.kod_krainar = c2.kod
left join obl d1 on a.kod_oblz = d1.kod
left join obl d2 on a.kod_oblr = d2.kod
left join ur e1 on b.kod_zam = e1.kod
left join ur e2 on b.kod_per = e2.kod
left join os f1 on b.kod_menz = f1.kod
left join os f2 on b.kod_menp = f2.kod
where recnum > ${REC_START} and 
     recnum < ${REC_END}`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};

module.exports = {
    getAllZay
};
