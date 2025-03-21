const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../../db/pool");

const getHomeScreenData = async (req, res) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";


  try {
    const result = await connection.execute(`
            select count(*) as c2,
       sum(decode(trunc(a.appdat, 'MM'), t.m0, 1, 0)) as c0, -- к-за поточний-місяць
       sum(decode(trunc(a.appdat, 'MM'), t.m1, 1, 0)) as c1, --к-стьь перевезенньт за минулий місяць
       sum(decode(trunc(a.appdat, 'MM'), t.m0, decode(a.code_per, 'R', 0, 1), 0)) as cm0, -- к-сть перевезень міжнародних за поточний місяць
       sum(decode(trunc(a.appdat, 'MM'), t.m0, decode(a.code_per, 'R', 1, 0), 0)) as cr0,-- к-сть перевезень регіональних за поточний місяць
       sum(decode(trunc(a.appdat, 'MM'), t.m1, decode(a.code_per, 'R', 0, 1), 0)) as cm1, -- к-сть перевезень міжнародних за минулий місяць
       sum(decode(trunc(a.appdat, 'MM'), t.m1, decode(a.code_per, 'R', 1, 0), 0)) as cr1,-- к-сть перевезень регіональних за минулий місяць за минулий місяць
       
       round(sum(b.margrn)) as m2, -- ЕД за 2 місяці
       round(sum(decode(trunc(a.appdat, 'MM'), t.m0, b.margrn, 0))) as m0, -- ЕД за поточний місяць
       round(sum(decode(trunc(a.appdat, 'MM'), t.m1, b.margrn, 0))) as m1, -- ЕД за минулий місяць
       round(sum(decode(trunc(a.appdat, 'MM'), t.m0, decode(a.code_per, 'R', 0, b.margrn), 0))) as mm0, -- маржа по міжнародних за поточний місяць
       round(sum(decode(trunc(a.appdat, 'MM'), t.m0, decode(a.code_per, 'R', b.margrn, 0), 0))) as mr0,-- маржа по регіональних за поточний місяць
       round(sum(decode(trunc(a.appdat, 'MM'), t.m1, decode(a.code_per, 'R', 0, b.margrn), 0))) as mm1,-- маржа по міжнародних за минулий місяць
       round(sum(decode(trunc(a.appdat, 'MM'), t.m1, decode(a.code_per, 'R', b.margrn, 0), 0))) as mr1-- маржа по регіональних за минулий місяць
from zay a
join zaylst b on a.kod = b.kod_zay
join (select trunc(sysdate, 'MM') as m0,
             add_months(trunc(sysdate, 'MM'), -1) as m1
      from dual) t on 1 = 1
where trunc(a.appdat, 'MM') >= add_months(trunc(sysdate, 'MM'), - 1)
            `);

    console.log(result.rows);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getHomeScreenData,
};
