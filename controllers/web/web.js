const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const cookieParser = require("cookie-parser");
// const pool = require("../db/index");
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");
const generateRandomNumber = require("../helpers/randomNumber");
const { bot } = require("../telegram__bot/telegram_bot");
const { sendOTPCode } = require("../telegram__bot/bot__functions");


const addWebGuestZap = async (req, res) => {
    const { name, tel, email, text } = req.body;
  
  
    try {
      const connection = await oracledb.getConnection(pool);
      const result = await connection.execute(
        `BEGIN
              ICTDAT.p_webguest.WebGuestZapAdd(:pGuestName,:pGuestTel,:pGuestEMail,:pZapText);
          END;`,
        {
          pGuestName:name,
          pGuestTel:tel,
          pGuestEMail:email,
          pGuestText:text,
        }
      );
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  };


  module.exports = {
    addWebGuestZap
  };
  