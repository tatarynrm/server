const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const cookieParser = require("cookie-parser");
// const pool = require("../db/index");

const jwt = require("jsonwebtoken");



const pool = require("../../db/pool");


const addWebGuestZap = async (req, res) => {
    const { name, tel, email, text } = req.body;
  
  console.log(req.body);
    try {
      const connection = await oracledb.getConnection(pool);
      const result = await connection.execute(
        `BEGIN
              ICTDAT.p_webguest.WebGuestZapAdd(:pGuestName,:pGuestTel,:pGuestEMail,:pZapTxt);
          END;`,
        {
          pGuestName:name,
          pGuestTel:tel,
          pGuestEMail:email,
          pZapTxt:text,
        }
      );
      console.log(result);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  };


  module.exports = {
    addWebGuestZap
  };
  