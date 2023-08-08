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
      d.nur as zam
  FROM zap a
  JOIN OS b on a.kod_os = b.kod
  JOIN US c on a.kod_os = c.kod_os
  left join ur d on a.kod_zam = d.kod
  WHERE a.status = 0`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};
const getClosedZap = async (req, res) => {
  const { KOD_OS ,ZAP_STATUS} = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.*,
              b.pip,
              p_zap.CountComm(a.kod) as countcomm,
              p_zap.CountNewComm(${KOD_OS}, a.kod) as countnewcomm,
              p_zap.CountMyComm(${KOD_OS}, a.kod) as countmycomm,
              p_zap.IsNewZap(${KOD_OS}, a.kod) as isnew
              FROM zap a
              JOIN OS b on a.kod_os = b.kod
              JOIN US c on a.kod_os = c.kod_os
              WHERE a.status != 1`
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
  const {
    pKodAuthor,
    pKodGroup,
    pZav,
    pRozv,
    pZapText,
    zavInfo,
    rozvInfo,
    pKodZam,
    pZapCina
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
    const pCodeKrainaZ = zDataKr.find(item =>{
    return item.short_name.length <= 3;
    })
    const pCodeKrainaR = rDataKr.find(item =>{
    return item.short_name.length <= 3;
    })
 const pOblZ = zDataKr.find(item =>{
  return item.types = [ 'administrative_area_level_1', 'political' ];
 })
 const pOblR = zDataKr.find(item =>{
  return item.types = [ 'administrative_area_level_1', 'political' ];
 })

 const pZLat = data1.result.geometry.location.lat;
 const pZLon = data1.result.geometry.location.lng;
 const pRLat = data2.result.geometry.location.lat;
 const pRLon = data2.result.geometry.location.lng;

  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(
    `BEGIN
          ICTDAT.p_zap.AddZap(:pKodAuthor, :pKodGroup, :pZav,:pRozv,
              :pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,:pZapText,:pZapCina,:pZamName,:pKodZap);
      END;`,
    {
      pKodAuthor,
      pKodGroup,
      pZav,
      pRozv,
      pCodeKrainaZ:pCodeKrainaZ.short_name,
      pCodeKrainaR:pCodeKrainaR.short_name,
      pOblZ:pOblZ.short_name,
      pOblR:pOblR.short_name,
      pZLat,
      pZLon,
      pRLat,
      pRLon,
      pKodZam:pKodZam || null,
      pZapText,
      pZapCina,
      pZamName:{ dir: oracledb.BIND_OUT, type: oracledb.STRING },
      pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  res.status(200).json(result);
})



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
    pZapCina
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
    const pCodeKrainaZ = zDataKr.find(item =>{
    return item.short_name.length <= 3;
    })
    const pCodeKrainaR = rDataKr.find(item =>{
    return item.short_name.length <= 3;
    })
 const pOblZ = zDataKr.find(item =>{
  return item.types = [ 'administrative_area_level_1', 'political' ];
 })
 const pOblR = zDataKr.find(item =>{
  return item.types = [ 'administrative_area_level_1', 'political' ];
 })

 const pZLat = data1.result.geometry.location.lat;
 const pZLon = data1.result.geometry.location.lng;
 const pRLat = data2.result.geometry.location.lat;
 const pRLon = data2.result.geometry.location.lng;

  const connection = await oracledb.getConnection(pool);
  const result = await connection.execute(
    `BEGIN
          ICTDAT.p_zap.EditZap(:pKodAuthor, :pKodZap, :pZav,:pRozv,
              :pCodeKrainaZ,:pCodeKrainaR,:pOblZ,:pOblR,:pZLat,:pZLon,:pRLat,:pRLon,:pKodZam,:pZapText,:pZapCina,:pZamName);
      END;`,
    {
      pKodAuthor,
      pKodZap,
      pZav,
      pRozv,
      pCodeKrainaZ:pCodeKrainaZ.short_name,
      pCodeKrainaR:pCodeKrainaR.short_name,
      pOblZ:pOblZ.short_name,
      pOblR:pOblR.short_name,
      pZLat,
      pZLon,
      pRLat,
      pRLon,
      pKodZam:pKodZam || null,
      pZapText,
      pZapCina,
      pZamName:{ dir: oracledb.BIND_OUT, type: oracledb.STRING },
      // pKodZap: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
 
  res.status(200).json(result);
})
    // const connection = await oracledb.getConnection(pool);
    // const result = await connection.execute(
    //   `BEGIN
    //         ICTDAT.p_zap.EditZap(:pKodAuthor,:pKodZap,:pZav,:pRozv,:pZapText);
    //     END;`,
    //   {
    //     pKodAuthor,
    //     pKodZap,
    //     pZav,
    //     pRozv,
    //     pZapText,
    //   }
    // );
    // res.status(200).json(result);
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
    // console.log(result);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("1---", error);
  }
};

const getClosedZapByDate = async (req, res) => {
  const { FROM,TO } = req.body;
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  try {

    if (TO === undefined) {
      const result = await connection.execute(
        `SELECT a.*,b.pip
         FROM zap a
         JOIN os b on a.kod_os = b.kod
         WHERE  dat >= to_date('${FROM}','dd.mm.yyyy')`
         
      );
      res.status(200).json(result.rows);
    }
else{
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

    // console.log(result);
 
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
  getAllTimeZap,
  getClosedZapByDate
};
