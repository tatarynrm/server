const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");
const axios = require("axios");
const getAllZap = async (req, res) => {
  const { KOD_OS } = req.body;
  // console.log("----getAllZap--", KOD_OS);
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
      p_zap.IsGroupAdm(${KOD_OS}, a.kod_group, 0) as isadm,
      p_zap.IsZakrToKraina(${KOD_OS},a.kod_kraina) as zakrkraina,
      d.nur as zam,
      k.idgmap as kraina
  
  
  FROM zap a
  JOIN OS b on a.kod_os = b.kod
  JOIN US c on a.kod_os = c.kod_os
  left join ur d on a.kod_zam = d.kod
  left join kraina k on a.kod_kraina = k.kod
  WHERE a.status = 0`
    );
    console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
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
  const {
    pKodAutor,
    pKodGroup,
    pZav,
    pRozv,
    pZapText,
    zavInfo,
    rozvInfo,
    pKodZam,
    pZapCina,
    pKilAm,
    pPunktZ,
    pPunktR,
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
        // return item.short_name.length <= 3;

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
      const result = await connection.execute(
        `BEGIN
          ICTDAT.p_zap.AddZap(:pKodAutor, :pKodGroup, :pZav,:pRozv,
              :pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,:pZapText,:pZapCina,:pKilAm,:pZamName,:pKodZap);
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
          pZapCina,
          pKilAm: +pKilAm,
          pZamName: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );
      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Виникла проблема" });
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
  const { pKodAutor, pKodZap, pKodMen, pKilAmZakr } = req.body;
  console.log(pKodMen);
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
            ICTDAT.p_zap.SetZapZakr(:pKodAutor,:pKodZap,:pKodMen,:pKilAmZakr);
        END;`,
      {
        pKodAutor,
        pKodZap,
        pKodMen,
        pKilAmZakr,
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
            ICTDAT.p_zap.CopyZap(:pKodAutor,:pKodZap,:pKilAm,:pKodZapNew);
        END;`,
      {
        pKodAutor,
        pKodZap,
        pKilAm,
        pKodZapNew: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const editZap = async (req, res) => {
  // const { pKodAuthor, pKodZap, pZav, pRozv, pZapText } = req.body;
  const {
    pKodAuthor,
    pKodZap,
    pZav,
    pRozv,
    pKodZam,
    pZapText,
    zavInfo,
    rozvInfo,
    pZapCina,
    pKilAm,
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
          ICTDAT.p_zap.EditZap(:pKodAuthor, :pKodZap, :pZav,:pRozv,
              :pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,:pZapText,:pZapCina,:pKilAm,:pZamName);
      END;`,
        {
          pKodAuthor,
          pKodZap,
          pZav,
          pRozv,
          pCodeKrainaZ: pCodeKrainaZ.short_name,
          pCodeKrainaR: pCodeKrainaR.short_name,
          pOblZ: pOblZ.short_name,
          pOblR: pOblR.short_name,
          pZLat,
          pZLon,
          pRLat,
          pRLon,
          pKodZam: pKodZam || null,
          pZapText,
          pZapCina,
          pKilAm,
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
const editZapCinaStatus = async (req, res) => {
  const { pKodAuthor, pKodZap, pZapCina } = req.body;
  console.log(req.body);
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
};
