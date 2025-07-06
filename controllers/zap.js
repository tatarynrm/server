const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");
const axios = require("axios");
const { ict_managers } = require("../db/noris/noris");
const getAllZap = async (req, res) => {
  let connection;
  const { KOD_OS } = req.body;
console.log(KOD_OS);

  try {
    connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,
      l.kilamzakr,
      l.kilamact,
      b.pip,
      c.TELEGRAMID,
      p_zap.CountComm(a.kod) as countcomm,
      p_zap.CountNewComm(${KOD_OS}, a.kod) as countnewcomm,
      p_zap.CountMyComm(${KOD_OS}, a.kod) as countmycomm,
      p_zap.IsNewZap(${KOD_OS}, a.kod) as isnew,
      p_zap.IsGroupAdm(${KOD_OS}, a.kod_group, 0) as isadm,
      p_zap.IsZakrToKraina(${KOD_OS},a.kod_kraina) as zakrkraina,
      d.nur as zam,
      k.idgmap as kraina,
      f.ntype as tztype,
      e.ntype as tzntype1,
              os_$$pkg.GetTelRobMob(a.kod_os) as permentel,
          os_$$pkg.GetEMailSl(a.kod_os) as permenemail,
          c1.idd as zavkraina,
          c2.idd as rozvkraina

  

  FROM zap a
  JOIN OS b on a.kod_os = b.kod
  JOIN US c on a.kod_os = c.kod_os
  left join ur d on a.kod_zam = d.kod
  left join kraina k on a.kod_kraina = k.kod
  left join tztype f on a.kod_tztype = f.kod
  join zaplst l on a.kod = l.kod_zap
  left join tztype e on a.kod_tztype = e.kod
  left join kraina c1 on a.kod_krainaz = c1.kod
  left join kraina c2 on a.kod_krainar = c2.kod
  left join tztype e on a.kod_tztype = e.kod
  WHERE a.status = 0`
    );



    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  } finally {
    if (connection) {
      try {
        // Close the Oracle database connection
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
  }
};
const getAllZapMobile = async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,
      l.kilamzakr,
      l.kilamact,
      b.pip,
      c.TELEGRAMID,
      d.nur as zam,
      e.ntype as tzntype1,
      k.idgmap as kraina,
          os_$$pkg.GetTelRobMob(a.kod_os) as permentel,
          os_$$pkg.GetEMailSl(a.kod_os) as permenemail,
          c1.idd as zavkraina,
          c2.idd as rozvkraina

  
      FROM zap a
      JOIN OS b on a.kod_os = b.kod
      JOIN US c on a.kod_os = c.kod_os
      left join kraina k on a.kod_kraina = k.kod
      left join ur d on a.kod_zam = d.kod
      left join zaplst l on a.kod = l.kod_zap
      left join kraina c1 on a.kod_krainaz = c1.kod
      left join kraina c2 on a.kod_krainar = c2.kod
      left join tztype e on a.kod_tztype = e.kod
      WHERE a.status = 0`
    );

    console.log('1');
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  } finally {
    if (connection) {
      try {
        // Close the Oracle database connection
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
  }
};
const getClosedZap = async (req, res) => {
  const { KOD_OS, ZAP_STATUS } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    let myArray = [];
    const result = await connection.execute(
      `SELECT a.*,
              b.pip,
              p_zap.CountComm(a.kod) as countcomm,
              p_zap.CountNewComm(${KOD_OS}, a.kod) as countnewcomm,
              p_zap.CountMyComm(${KOD_OS}, a.kod) as countmycomm,
              p_zap.IsNewZap(${KOD_OS}, a.kod) as isnew,
              d.nur as zam
              FROM zap a
              JOIN OS b on a.kod_os = b.kod
              JOIN US c on a.kod_os = c.kod_os
              left join ur d on a.kod_zam = d.kod
              WHERE a.status != 1`
    );
    if (result.rows.length > 0) {
      const res1 = result.rows;
      for (let i = 0; i < res1.length; i++) {
        const el = res1[i];
        const comments = await connection.execute(
          `SELECT a.*,b.PIP 
          from ICTDAT.ZAPCOMM a 
          JOIN ICTDAT.OS b on a.KOD_OS = b.KOD
          where a.KOD_ZAP = ${el.KOD}`
        );
        myArray.push(comments.rows);
      }
    }
    // console.log(myArray);
    const combinedArray = result.rows.map((post) => {
      console.log(post.KOD);
      const comments = myArray.map((item) =>
        item.filter((val) => val.KOD_ZAP === post.KOD)
      );
      let commentsFilter = comments
        .map((item) => item)
        .filter((item) => item !== undefined);
      let comFil = commentsFilter.filter((item) =>
        item.length !== 0 ? item : null
      );

      return {
        ...post,
        COMMENTS: comFil[0] ? comFil[0] : null, // com // Add user object to the post
      };
    });

    res.status(200).json(combinedArray);
  } catch (error) {
    console.log("1---", error);
  }
};

const getGroups = async (req, res) => {
  const { NGROUP, KOD, DATCLOSE, KOD_AUTHOR, kod } = req.body;
  let connection;
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
  } finally {
    if (connection) {
      try {
        // Close the Oracle database connection
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
  }
};

const createZap = async (req, res) => {
  let connection;
  const {
    pKodAutor,
    pKodGroup,
    pZav,
    pRozv,
    pZapText,
    pZapTextPriv,
    zavInfo,
    rozvInfo,
    pKodZam,
    pZapCina,
    pKilAm,
    pPunktZ,
    pPunktR,
    pFrahtOur,
    pFrahtPer,
    pKodTzType,
    pVantInfo,
    pZbir,
  } = req.body;



  try {
    const zavUrl = `https://maps.googleapis.com/maps/api/place/details/json?language=uk&key=AIzaSyCL4bmZk4wwWYECFCW2wqt7X-yjU9iPG2o&place_id=${zavInfo.value.place_id}`;
    const rozvUrl = `https://maps.googleapis.com/maps/api/place/details/json?language=uk&key=AIzaSyCL4bmZk4wwWYECFCW2wqt7X-yjU9iPG2o&place_id=${rozvInfo.value.place_id}`;
    const urlArray = [zavUrl, rozvUrl];
    const requests = urlArray.map((url) => axios.get(url));
    axios.all(requests).then(async (responses) => {
      const data1 = responses[0].data;
      const data2 = responses[1].data;
      const zDataKr = data1.result.address_components;
      const rDataKr = data2.result.address_components;
      const pCodeKrainaZ = zDataKr.filter((item) => {
        return item.types.includes("country");
      });
      const pCodeKrainaR = rDataKr.filter((item) => {
        return item.types.includes("country");
      });
      const pOblZ = zDataKr.filter((item) => {
        if (item.short_name.includes("область")) {
          return item.short_name.includes("область");
        } else if (
          !item.short_name.includes("область") &
          item.long_name.includes("область")
        ) {
          return item.long_name.includes("область");
        } else if (item.short_name.includes("Київ")) {
          return item.short_name.includes("Київ");
        } else {
          return item;
        }
      });
      const pOblR = zDataKr.filter((item) => {
        if (item.short_name.includes("область")) {
          return item.short_name.includes("область");
        } else if (
          !item.short_name.includes("область") &
          item.long_name.includes("область")
        ) {
          return item.long_name.includes("область");
        } else if (item.short_name.includes("Київ")) {
          return item.short_name.includes("Київ");
        } else {
          return item.short_name;
        }
      });
      const pZLat = data1.result.geometry.location.lat;
      const pZLon = data1.result.geometry.location.lng;
      const pRLat = data2.result.geometry.location.lat;
      const pRLon = data2.result.geometry.location.lng;
      const connection = await oracledb.getConnection(pool);

      console.log("");

      const result = await connection.execute(
        `BEGIN
          ICTDAT.p_zap.AddZap(:pKodAutor, :pKodGroup, :pZav,:pRozv,
              :pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,
              :pZapText,:pZapTextPriv,:pZbir,:pZapCina,:pKilAm,:pFrahtPer,:pKodTzType,:pVantInfo,:pZamName,:pKodZap,:pZapNum);
      END;`,
        {
          pKodAutor,
          pKodGroup,
          pZav,
          pRozv,
          pCodeKrainaZ: pCodeKrainaZ[0]?.short_name,
          pCodeKrainaR: pCodeKrainaR[0]?.short_name,
          pOblZ:
            pOblZ[0]?.short_name === "Київ"
              ? "Київська область"
              : pOblZ[0]?.short_name,
          pOblR:
            pOblR[0]?.short_name === "Київ"
              ? "Київська область"
              : pOblZ[0]?.short_name,
          pZLat,
          pZLon,
          pRLat,
          pRLon,
          pKodZam: pKodZam || null,
          pZapText,
          pZapTextPriv: pZapTextPriv ? pZapTextPriv : null,
          pZbir: pZbir ? +pZbir : 0,
          pZapCina,
          pKilAm: +pKilAm,
          pFrahtPer: pFrahtPer ? +pFrahtPer : null,
          pKodTzType: pKodTzType || 51,
          pVantInfo: pVantInfo ? pVantInfo : null,
          pZamName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          pZapNum: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );
  

      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Виникла проблема" });
  } finally {
    if (connection) {
      try {
        // Close the Oracle database connection
        await connection.close();
        console.log("Connection closed successfully.");
      } catch (error) {
        console.error("Error closing connection: ", error);
      }
    }
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
const zakrZap = async (req, res) => {
  const { pKodAutor, pKodZap, pKodMen, pKilAmZakr,pKodValut,pSuma } = req.body;
console.log('REQ BODY',req.body);

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.SetZapZakr(:pKodAutor,:pKodZap,:pKodMen,:pSuma,:pKodValut,:pKilAmZakr);
        END;`,
      {
        pKodAutor,
        pKodZap,
        pKodMen,
        pSuma,
        pKodValut,
        pKilAmZakr
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const copyZap = async (req, res) => {
  const { pKodAutor, pKodZap, pKilAm } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.CopyZap(:pKodAutor,:pKodZap,:pKilAm,:pKodZapNew,:pZapNumNew);
        END;`,
      {
        pKodAutor,
        pKodZap,
        pKilAm,
        pKodZapNew: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        pZapNumNew: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const editZap = async (req, res) => {
  const {
    pKodAuthor,
    pKodZap,
    pZav,
    pRozv,
    pKodZam,
    pZapText,
    pZapTextPriv,
    zavInfo,
    rozvInfo,
    pZapCina,
    pKilAm,
    pFrahtOur,
    pFrahtPer,
    pKodTzType,
    pVantInfo,
    pZbir,
  } = req.body;

  try {
    const zavUrl = `https://maps.googleapis.com/maps/api/place/details/json?language=uk&key=AIzaSyCL4bmZk4wwWYECFCW2wqt7X-yjU9iPG2o&place_id=${zavInfo.value.place_id}`;
    const rozvUrl = `https://maps.googleapis.com/maps/api/place/details/json?language=uk&key=AIzaSyCL4bmZk4wwWYECFCW2wqt7X-yjU9iPG2o&place_id=${rozvInfo.value.place_id}`;
    const urlArray = [zavUrl, rozvUrl];
    const requests = urlArray.map((url) => axios.get(url));
    axios.all(requests).then(async (responses) => {
      const data1 = responses[0].data;
      const data2 = responses[1].data;
      const zDataKr = data1.result.address_components;
      const rDataKr = data2.result.address_components;
      const pCodeKrainaZ = zDataKr.find((item) => {
        return item.short_name.length <= 3;
      });
      const pCodeKrainaR = rDataKr.find((item) => {
        return item.short_name.length <= 3;
      });
      const pOblZ = zDataKr.find((item) => {
        return (item.types = ["administrative_area_level_1", "political"]);
      });
      const pOblR = zDataKr.find((item) => {
        return (item.types = ["administrative_area_level_1", "political"]);
      });

      const pZLat = data1.result.geometry.location.lat;
      const pZLon = data1.result.geometry.location.lng;
      const pRLat = data2.result.geometry.location.lat;
      const pRLon = data2.result.geometry.location.lng;
      const connection = await oracledb.getConnection(pool);
      const result = await connection.execute(
        `BEGIN
          ICTDAT.p_zap.EditZap(:pKodAutor,:pKodZap,:pZav,:pRozv,:pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,:pZapText,:pZapTextPriv,:pZbir,:pZapCina,:pKilAm,:pFrahtPer,:pKodTzType,:pVantInfo,:pZamName);
      END;`,
        {
          pKodAutor: pKodAuthor,
          pKodZap,
          pZav,
          pRozv,
          pCodeKrainaZ: pCodeKrainaZ?.short_name,
          pCodeKrainaR: pCodeKrainaR?.short_name,
          pOblZ: pOblZ?.short_name,
          pOblR: pOblR?.short_name,
          pZLat: pZLat,
          pZLon: pZLon,
          pRLat: pRLat,
          pRLon: pRLon,
          pKodZam: pKodZam || null,
          pZapText: pZapText || null,
          pZapTextPriv: pZapTextPriv || null,
          pZbir: pZbir || null,
          pZapCina: pZapCina || null,
          pKilAm: pKilAm || null,
          pFrahtPer: pFrahtPer || null,
          pKodTzType: pKodTzType || null,
          pVantInfo: pVantInfo || null,
          pZamName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        }
      );

      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
  }
};
const editZapText = async (req, res) => {
  const { pKodZap, pZapText } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAP
      SET ZAPTEXT = :pZapText
      WHERE KOD = :pKodZap`,
      {
        pKodZap,
        pZapText,
      },
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const editZapKilAm = async (req, res) => {
  const { pKodAuthor, pKodZap, pKilAm } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAP
      SET KILAM = :pKilAm
      WHERE KOD = :pKodZap`,
      {
        pKilAm,
        pKodZap,
      },
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const editTzType = async (req, res) => {
  const { pKodTzType, pKodZap } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAP
      SET KOD_TZTYPE = :pKodTzType
      WHERE KOD = :pKodZap`,
      {
        pKodTzType,
        pKodZap,
      },
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const editZapZam = async (req, res) => {
  const { pKodZapZam, pKodZap } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAP
      SET KOD_ZAM = :pKodZapZam
      WHERE KOD = :pKodZap`,
      {
        pKodZapZam,
        pKodZap,
      },
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const editZapZbir = async (req, res) => {
  const { pZapZbir, pKodZap } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAP
      SET ZBIR = :pZapZbir
      WHERE KOD = :pKodZap`,
      {
        pZapZbir,
        pKodZap,
      },
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};
const editZapCinaStatus = async (req, res) => {
  const { pKodAuthor, pKodZap, pZapCina } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
        ICTDAT.p_zap.ChangeZapCina(:pKodAuthor, :pKodZap, :pZapCina);
    END;`,
      {
        pKodAuthor,
        pKodZap,
        pZapCina,
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

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const getAllTimeZap = async (req, res) => {
  const { todayDate } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,b.pip
       FROM zap a
       JOIN os b on a.kod_os = b.kod
       WHERE  dat >= to_date('${todayDate}','yyyy-mm-dd')`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};

const getClosedZapByDate = async (req, res) => {
  const { FROM, TO } = req.body;
  try {
    if (TO === undefined || TO === null || TO == undefined) {
      const connection = await oracledb.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const result = await connection.execute(
        `SELECT a.*,b.pip
         FROM zap a
         JOIN os b on a.kod_os = b.kod
         WHERE TRUNC(dat) = to_date('${FROM}','dd.mm.yyyy')`
      );
      res.status(200).json(result.rows);
    }
    if (FROM === TO) {
      const connection = await oracledb.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const result = await connection.execute(
        `SELECT a.*,b.pip
         FROM zap a
         JOIN os b on a.kod_os = b.kod
         WHERE TRUNC(dat) = to_date('${FROM}','dd.mm.yyyy')`
      );
      res.status(200).json(result.rows);
    } else {
      const connection = await oracledb.getConnection(pool);
      connection.currentSchema = "ICTDAT";
      const result = await connection.execute(
        `SELECT a.*,b.pip
     FROM zap a
     JOIN os b on a.kod_os = b.kod
     WHERE  dat BETWEEN to_date('${FROM}','dd.mm.yyyy') AND to_date('${TO}','dd.mm.yyyy')
     `
      );
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.log("1---", error);
  }
};
const getManagersIsCommentZap = async (req, res) => {
  const { KOD_ZAP } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `    select a.kod_os,
      c.pip,
      b.telegramid,
      count(*) as kilcomm
from zapcomm a
join us b on a.kod_os = b.kod_os
join os c on a.kod_os = c.kod
where a.kod_zap = ${KOD_ZAP}
group by a.kod_os,
      c.pip,
      b.telegramid`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};
// Вільний транспорт
const getAllFreeTrucks = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `select a.*,
      b.ntype,
      c.idd,
      d.nobl,
      e.pip
from ampor a
left join tztype b on a.kod_tztype = b.kod
left join kraina c on a.kod_kraina = c.kod
left join obl d on a.kod_obl = d.kod
left join os e on a.kod_men = e.kod
where a.dat >= trunc(sysdate, 'DD') - 2 and
     a.actual > 0 and
     a.lat <> 0 and a.lon <> 0`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getTzType = async (req, res) => {
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  try {
    const result = await connection.execute(
      `select * from tztype order by SORTID,NTYPE`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getZapInformationData = async (req,res)=>{
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  try {
    const result= await connection.execute(
      `SELECT * FROM ictdat.valut WHERE KOD NOT IN (41,2611)`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);  
  }
}

const getCommercialClosedByUs = async (req,res) =>{
  try {
    
  } catch (error) {
    console.log(error);
    
  }
}

const editComment = async (req, res) => {
  const { KOD, PRIM } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    
    const result = await connection.execute(
      `UPDATE ICTDAT.ZAPCOMM
       SET PRIM = :prim
       WHERE KOD = :kod`,
      { PRIM, KOD },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Коментар оновлено", rowsUpdated: result.rowsAffected });
  } catch (error) {
    console.error("Помилка при оновленні коментаря:", error);
    res.status(500).json({ error: "Не вдалося оновити коментар" });
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
  editZapText,
  editZapCinaStatus,
  getAllTimeZap,
  getClosedZapByDate,
  zakrZap,
  getManagersIsCommentZap,
  copyZap,
  editTzType,
  editZapZbir,
  editZapZam,
  editComment,

  // Вільний транспорт
  getAllFreeTrucks,
  editZapKilAm,
  getTzType,
  getAllZapMobile,
  getZapInformationData
};
